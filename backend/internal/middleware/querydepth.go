package middleware

import (
	"context"
	"os"
	"strconv"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/ast"
)

// MaxQueryDepth returns the configured maximum query depth (default: 10).
// This prevents resource exhaustion attacks via deeply nested queries.
func MaxQueryDepth() int {
	depth := 10
	if envDepth := os.Getenv("GRAPHQL_MAX_DEPTH"); envDepth != "" {
		if parsed, err := strconv.Atoi(envDepth); err == nil && parsed > 0 {
			depth = parsed
		}
	}
	return depth
}

// QueryDepthLimitExtension calculates query depth and rejects queries exceeding the limit.
type QueryDepthLimitExtension struct {
	MaxDepth int
}

// ExtensionName returns the extension name.
func (e QueryDepthLimitExtension) ExtensionName() string {
	return "QueryDepthLimit"
}

// Validate is called before query execution to check depth.
func (e QueryDepthLimitExtension) Validate(schema graphql.ExecutableSchema) error {
	return nil
}

// InterceptOperation is called before operation execution.
func (e QueryDepthLimitExtension) InterceptOperation(ctx context.Context, next graphql.OperationHandler) graphql.ResponseHandler {
	oc := graphql.GetOperationContext(ctx)

	// Calculate depth before execution
	depth := calculateDepth(oc.Operation.SelectionSet, 0)

	if depth > e.MaxDepth {
		return func(ctx context.Context) *graphql.Response {
			return graphql.ErrorResponse(ctx, "query exceeds maximum depth of %d (depth: %d)", e.MaxDepth, depth)
		}
	}

	return next(ctx)
}

// calculateDepth recursively calculates the maximum depth of a selection set.
func calculateDepth(selectionSet ast.SelectionSet, currentDepth int) int {
	if len(selectionSet) == 0 {
		return currentDepth
	}

	maxDepth := currentDepth
	for _, selection := range selectionSet {
		switch sel := selection.(type) {
		case *ast.Field:
			childDepth := calculateDepth(sel.SelectionSet, currentDepth+1)
			if childDepth > maxDepth {
				maxDepth = childDepth
			}
		case *ast.InlineFragment:
			childDepth := calculateDepth(sel.SelectionSet, currentDepth)
			if childDepth > maxDepth {
				maxDepth = childDepth
			}
		case *ast.FragmentSpread:
			// Fragment spreads don't increase depth themselves
			// The fragment definition will be expanded elsewhere
		}
	}

	return maxDepth
}
