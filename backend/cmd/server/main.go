package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	chimiddleware "github.com/go-chi/cors"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"

	"helpmeclean-backend/internal/auth"
	internaldb "helpmeclean-backend/internal/db"
	db "helpmeclean-backend/internal/db/generated"
	"helpmeclean-backend/internal/graph"
	"helpmeclean-backend/internal/graph/resolver"
	custommiddleware "helpmeclean-backend/internal/middleware"
	"helpmeclean-backend/internal/pubsub"
	"helpmeclean-backend/internal/service/invoice"
	"helpmeclean-backend/internal/service/payment"
	"helpmeclean-backend/internal/storage"
	"helpmeclean-backend/internal/webhook"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(custommiddleware.SecurityHeaders)
	r.Use(custommiddleware.RateLimitMiddleware()) // Phase 3: DoS protection

	// CORS: read from ALLOWED_ORIGINS env var (comma-separated)
	// Local: http://localhost:3000
	// Dev: https://dev-help-me-clean.vercel.app,http://localhost:3000
	// Prod: https://help-me-clean.vercel.app
	allowedOrigins := []string{"http://localhost:3000"}
	if originsEnv := os.Getenv("ALLOWED_ORIGINS"); originsEnv != "" {
		allowedOrigins = strings.Split(originsEnv, ",")
	}
	r.Use(chimiddleware.Handler(chimiddleware.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "Sec-WebSocket-Protocol"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","version":"0.1.0"}`)
	})

	// Database
	ctx := context.Background()
	pool, err := internaldb.NewPool(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()
	queries := db.New(pool)

	// PubSub
	ps := pubsub.New()

	// Services
	paymentSvc := payment.NewService(queries)
	invoiceSvc := invoice.NewService(queries)

	// File storage
	var store storage.Storage
	useLocalStorage := os.Getenv("USE_LOCAL_STORAGE") == "true"

	if useLocalStorage {
		// Local filesystem storage (development mode)
		uploadsBaseURL := fmt.Sprintf("http://localhost:%s/uploads", port)
		store = storage.NewLocalStorage("./uploads", uploadsBaseURL)
		log.Println("Using local filesystem storage")

		// Serve uploaded files
		r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))
	} else {
		// Google Cloud Storage (production mode)
		gcsBucket := os.Getenv("GCS_BUCKET")
		gcsProjectID := os.Getenv("GCS_PROJECT_ID")
		gcsCredentials := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

		if gcsBucket == "" {
			log.Fatal("GCS_BUCKET environment variable is required when USE_LOCAL_STORAGE is not set")
		}
		if gcsProjectID == "" {
			log.Fatal("GCS_PROJECT_ID environment variable is required when USE_LOCAL_STORAGE is not set")
		}

		gcsStore, err := storage.NewGCSStorage(ctx, gcsBucket, gcsProjectID, gcsCredentials)
		if err != nil {
			log.Fatalf("Failed to initialize GCS storage: %v", err)
		}
		store = gcsStore
		log.Printf("Using Google Cloud Storage: bucket=%s, project=%s", gcsBucket, gcsProjectID)
	}

	// Stripe webhook (must be BEFORE auth middleware)
	stripeWebhook := webhook.NewStripeHandler(paymentSvc)
	r.Post("/webhook/stripe", stripeWebhook.ServeHTTP)

	// Authorization helper (Phase 3 security)
	authzHelper := custommiddleware.NewAuthzHelper(queries)

	// GraphQL resolver
	res := &resolver.Resolver{
		Pool:           pool,
		Queries:        queries,
		PubSub:         ps,
		PaymentService: paymentSvc,
		InvoiceService: invoiceSvc,
		Storage:        store,
		AuthzHelper:    authzHelper,
	}

	// Wire auto-confirm callback: when payment succeeds, create chat room.
	paymentSvc.OnBookingConfirmed = func(ctx context.Context, booking db.Booking) {
		res.CreateBookingChatFromPayment(ctx, booking)
	}

	// GraphQL server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: res,
	}))
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})
	srv.AddTransport(&transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				if origin == "" {
					return false
				}
				// Validate against ALLOWED_ORIGINS list (same as CORS config)
				for _, allowed := range allowedOrigins {
					if origin == allowed {
						return true
					}
				}
				return false
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
		InitFunc: func(ctx context.Context, initPayload transport.InitPayload) (context.Context, *transport.InitPayload, error) {
			// Note: WebSocket auth currently uses Authorization header/token from connection params
			// Cookies are not easily accessible in gqlgen's InitFunc (would require custom transport)
			// This is acceptable since WebSocket origin validation (Phase 1) already protects against CSWSH
			// Regular HTTP requests use secure httpOnly cookies (Phase 2)
			token := initPayload.Authorization()
			if token == "" {
				if raw, ok := initPayload["token"]; ok {
					if t, ok := raw.(string); ok {
						token = t
					}
				}
			}
			token = strings.TrimPrefix(token, "Bearer ")
			if token != "" {
				claims, err := auth.ValidateToken(token)
				if err == nil {
					ctx = context.WithValue(ctx, auth.UserContextKey, claims)
				}
			}
			return ctx, &initPayload, nil
		},
	})

	// Only enable introspection in development/test environments
	// Prevents schema enumeration attacks in production
	if os.Getenv("ENVIRONMENT") != "production" {
		srv.Use(extension.Introspection{})
	}

	// Phase 4: Query complexity and depth limits (DoS protection)
	srv.Use(extension.FixedComplexityLimit(100)) // Max complexity: 100 (configurable via GRAPHQL_MAX_COMPLEXITY)
	srv.Use(custommiddleware.QueryDepthLimitExtension{
		MaxDepth: custommiddleware.MaxQueryDepth(),
	})

	// Phase 4: Error sanitization (prevent information leakage)
	srv.SetErrorPresenter(custommiddleware.ErrorPresenter())
	srv.SetRecoverFunc(custommiddleware.RecoverFunc())

	// GraphQL Playground is also only available in non-production
	if os.Getenv("ENVIRONMENT") != "production" {
		r.Handle("/graphql", playground.Handler("HelpMeClean GraphQL", "/query"))
	}
	// Apply auth middleware, strict rate limiting, and inject ResponseWriter for cookie management
	// Strict rate limiting on GraphQL protects auth, payments, and other sensitive mutations
	r.With(
		custommiddleware.StrictRateLimitMiddleware(),
		auth.AuthMiddleware,
		custommiddleware.InjectResponseWriter,
	).Handle("/query", srv)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, `<h1>HelpMeClean API</h1><p>GraphQL playground: <a href="/graphql">/graphql</a></p>`)
	})

	log.Printf("HelpMeClean backend starting on port %s", port)
	log.Printf("GraphQL playground: http://localhost:%s/graphql", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
