import Foundation

/// A lightweight GraphQL client using URLSession for communicating with the HelpMeClean backend.
///
/// Provides shared singleton access, automatic JWT token management via UserDefaults,
/// and generic decoding of GraphQL responses into strongly-typed Swift models.
class GraphQLClient {

    // MARK: - Singleton

    static let shared = GraphQLClient()

    // MARK: - Configuration

    var endpoint = AppConfig.API.endpoint

    /// The JWT authentication token persisted across launches.
    var authToken: String? {
        get { UserDefaults.standard.string(forKey: AppConfig.Auth.tokenStorageKey) }
        set { UserDefaults.standard.set(newValue, forKey: AppConfig.Auth.tokenStorageKey) }
    }

    // MARK: - Private

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = AppConfig.API.timeoutRequest
        configuration.timeoutIntervalForResource = AppConfig.API.timeoutResource
        self.session = URLSession(configuration: configuration)

        self.decoder = JSONDecoder()
    }

    // MARK: - Public API

    /// Executes a GraphQL query or mutation and decodes the response into the specified type.
    ///
    /// - Parameters:
    ///   - query: The GraphQL query or mutation string.
    ///   - variables: Optional dictionary of variables to pass with the operation.
    /// - Returns: The decoded response data of type `T`.
    /// - Throws: ``GraphQLError`` if the server returns errors or the response cannot be decoded.
    func execute<T: Decodable>(query: String, variables: [String: Any]? = nil) async throws -> T {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var body: [String: Any] = ["query": query]
        if let variables = variables {
            body["variables"] = variables
        }

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw GraphQLError.serverError
        }

        let result = try decoder.decode(GraphQLResponse<T>.self, from: data)

        if let errors = result.errors, !errors.isEmpty {
            throw GraphQLError.graphQLErrors(errors.map { $0.message })
        }

        guard let responseData = result.data else {
            throw GraphQLError.noData
        }

        return responseData
    }
}

// MARK: - Response Types

/// Wrapper for the standard GraphQL JSON response envelope.
struct GraphQLResponse<T: Decodable>: Decodable {
    let data: T?
    let errors: [GraphQLErrorItem]?
}

/// Represents a single error item returned by the GraphQL server.
struct GraphQLErrorItem: Decodable {
    let message: String
}

// MARK: - Error Types

/// Errors that can occur during GraphQL operations.
enum GraphQLError: LocalizedError {
    /// The HTTP response status code was outside the 2xx range.
    case serverError
    /// The response contained no data payload.
    case noData
    /// The server returned one or more GraphQL errors.
    case graphQLErrors([String])

    var errorDescription: String? {
        switch self {
        case .serverError:
            return "Eroare de server"
        case .noData:
            return "Nu s-au primit date"
        case .graphQLErrors(let messages):
            return messages.joined(separator: ", ")
        }
    }
}
