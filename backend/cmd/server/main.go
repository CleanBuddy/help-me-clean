package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"unicode"
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

	// File storage - GCS for production, local for development
	env := os.Getenv("ENVIRONMENT")
	gcsCredentials := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	var store storage.Storage

	// Use local storage for development if GCS credentials not configured
	if env != "production" && gcsCredentials == "" {
		uploadsDir := "./uploads"
		baseURL := "http://localhost:" + port + "/uploads"
		store = storage.NewLocalStorage(uploadsDir, baseURL)
		log.Printf("📁 Using local file storage: %s", uploadsDir)
		log.Printf("💡 Set GOOGLE_APPLICATION_CREDENTIALS to use GCS instead")

		// Serve uploaded files locally
		r.Get("/uploads/*", func(w http.ResponseWriter, r *http.Request) {
			http.StripPrefix("/uploads/", http.FileServer(http.Dir(uploadsDir))).ServeHTTP(w, r)
		})
	} else {
		// Use Google Cloud Storage
		gcsBucket := os.Getenv("GCS_BUCKET")
		gcsProjectID := os.Getenv("GCS_PROJECT_ID")

		if gcsBucket == "" {
			log.Fatal("GCS_BUCKET environment variable is required for GCS storage")
		}
		if gcsProjectID == "" {
			log.Fatal("GCS_PROJECT_ID environment variable is required for GCS storage")
		}

		gcsStore, err := storage.NewGCSStorage(ctx, gcsBucket, gcsProjectID, gcsCredentials)
		if err != nil {
			log.Fatalf("Failed to initialize GCS storage: %v", err)
		}
		store = gcsStore
		log.Printf("☁️  Using Google Cloud Storage: bucket=%s, project=%s", gcsBucket, gcsProjectID)
	}

	// Stripe webhook (must be BEFORE auth middleware)
	stripeWebhook := webhook.NewStripeHandler(paymentSvc)
	r.Post("/webhook/stripe", stripeWebhook.ServeHTTP)

	// ANAF company lookup proxy — CORS-safe server-side relay
	r.Get("/api/company-lookup", func(w http.ResponseWriter, req *http.Request) {
		cuiStr := strings.TrimSpace(req.URL.Query().Get("cui"))
		cuiStr = strings.TrimPrefix(strings.ToUpper(cuiStr), "RO")
		cuiNum, err := strconv.Atoi(strings.TrimSpace(cuiStr))
		if err != nil || cuiNum <= 0 {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"invalid cui"}`, http.StatusBadRequest)
			return
		}
		today := time.Now().Format("2006-01-02")
		payload, _ := json.Marshal([]map[string]interface{}{{"cui": cuiNum, "data": today}})
		resp, err := http.Post(
			"https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva",
			"application/json",
			bytes.NewReader(payload),
		)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			http.Error(w, `{"error":"anaf unreachable"}`, http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()
		var anafResp struct {
			Found []struct {
				DateGenerale struct {
					Denumire string `json:"denumire"`
					Adresa   string `json:"adresa"`
					Telefon  string `json:"telefon"`
					NrRegCom string `json:"nrRegCom"`
					CodCAEN  string `json:"cod_CAEN"`
				} `json:"date_generale"`
			} `json:"found"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&anafResp); err != nil || len(anafResp.Found) == 0 {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"found":false}`)) //nolint:errcheck
			return
		}
		dg := anafResp.Found[0].DateGenerale
		city, county, streetAddr := parseANAFAddress(dg.Adresa)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{ //nolint:errcheck
			"found":        true,
			"companyName":  titleCaseRO(strings.TrimSpace(dg.Denumire)),
			"streetAddress": streetAddr,
			"city":         city,
			"county":       county,
			"contactPhone": strings.TrimSpace(dg.Telefon),
			"nrRegCom":     strings.TrimSpace(dg.NrRegCom),
			"codCaen":      strings.TrimSpace(dg.CodCAEN),
		})
	})

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

// titleCaseRO converts an ALL-CAPS Romanian string to Title Case using unicode-safe rune ops.
func titleCaseRO(s string) string {
	words := strings.Fields(strings.ToLower(s))
	for i, w := range words {
		runes := []rune(w)
		if len(runes) > 0 {
			runes[0] = unicode.ToUpper(runes[0])
			words[i] = string(runes)
		}
	}
	return strings.Join(words, " ")
}

// parseANAFAddress splits the ANAF flat address string into city, county and street.
// ANAF format: "MUNICIPIUL BUCUREȘTI, SECTOR 1, STR. XYZ, NR. 1, ..."
//              "MUNICIPIUL CLUJ-NAPOCA, JUD. CLUJ, STR. XYZ, NR. 5"
func parseANAFAddress(adresa string) (city, county, street string) {
	parts := strings.SplitN(adresa, ", ", 3)
	if len(parts) == 0 {
		return "", "", adresa
	}

	// City: strip locality-type prefix
	cityRaw := strings.TrimSpace(parts[0])
	for _, pfx := range []string{"MUNICIPIUL ", "ORAȘ ", "ORAŞ ", "COMUNĂ ", "COMUNA ", "SAT ", "SECTOR "} {
		if strings.HasPrefix(cityRaw, pfx) {
			cityRaw = strings.TrimPrefix(cityRaw, pfx)
			break
		}
	}
	city = titleCaseRO(cityRaw)

	if len(parts) < 2 {
		return city, "", ""
	}

	// County: strip județ prefix; keep "Sector N" as-is for București
	countyRaw := strings.TrimSpace(parts[1])
	for _, pfx := range []string{"JUDEȚ ", "JUDET ", "JUDEȚUL ", "JUDETUL ", "JUD. ", "JUD "} {
		if strings.HasPrefix(countyRaw, pfx) {
			countyRaw = strings.TrimPrefix(countyRaw, pfx)
			break
		}
	}
	county = titleCaseRO(countyRaw)

	if len(parts) < 3 {
		return city, county, ""
	}

	street = titleCaseRO(strings.TrimSpace(parts[2]))
	return city, county, street
}
