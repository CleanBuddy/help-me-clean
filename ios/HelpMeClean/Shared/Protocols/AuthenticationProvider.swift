import Foundation

/// Protocol defining authentication provider capabilities.
///
/// Conforming types provide sign-in and sign-out functionality for different
/// authentication methods (Google, Apple, dev tokens, etc.). Each provider
/// returns an ID token string that the backend can verify.
protocol AuthenticationProvider {

    /// Sign in and return an ID token for backend verification.
    ///
    /// - Returns: An ID token string suitable for sending to the GraphQL `signInWithGoogle` mutation.
    /// - Throws: ``AuthenticationError`` if the sign-in flow fails or is cancelled.
    func signIn() async throws -> String

    /// Sign out the current user from this provider.
    func signOut()

    /// Whether the user is currently signed in with this provider.
    var isSignedIn: Bool { get }
}

/// Errors that can occur during authentication.
enum AuthenticationError: LocalizedError {

    /// The user cancelled the sign-in flow.
    case cancelled

    /// The provider did not return an ID token.
    case noIDToken

    /// The provider is misconfigured (e.g. missing Client ID).
    case configurationError

    /// An underlying error from the authentication SDK.
    case unknownError(Error)

    var errorDescription: String? {
        switch self {
        case .cancelled:
            return "Autentificarea a fost anulata."
        case .noIDToken:
            return "Nu s-a primit token de autentificare."
        case .configurationError:
            return "Eroare de configurare. Verifica Client ID."
        case .unknownError(let error):
            return error.localizedDescription
        }
    }
}
