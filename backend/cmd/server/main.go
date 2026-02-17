package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"helpmeclean-backend/internal/app"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler, shutdown, err := app.NewHandler(context.Background())
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	defer shutdown()

	log.Printf("HelpMeClean backend starting on port %s", port)
	log.Printf("GraphQL playground: http://localhost:%s/graphql", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
