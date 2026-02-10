import Foundation

/// Development-only authentication provider using dev tokens.
///
/// Generates a synthetic ID token by prefixing the email address with a
/// configurable string (e.g. `"dev_"`). The backend recognises this prefix
/// and bypasses real Google token verification in development mode.
class DevAuthProvider: AuthenticationProvider {

    // MARK: - Properties

    private let devTokenPrefix: String
    private var currentEmail: String?

    // MARK: - Initialization

    /// Creates a new dev auth provider.
    ///
    /// - Parameter devTokenPrefix: The prefix prepended to email addresses to form dev tokens.
    init(devTokenPrefix: String = "dev_") {
        self.devTokenPrefix = devTokenPrefix
    }

    // MARK: - AuthenticationProvider

    var isSignedIn: Bool {
        currentEmail != nil
    }

    /// Sign in with an email address (dev mode only).
    ///
    /// - Parameter email: The email address to authenticate with.
    /// - Returns: A dev token string in the format `"<prefix><email>"`.
    func signIn(email: String) async throws -> String {
        currentEmail = email
        return "\(devTokenPrefix)\(email)"
    }

    /// Not used directly -- use ``signIn(email:)`` instead.
    ///
    /// - Throws: ``AuthenticationError/configurationError`` always.
    func signIn() async throws -> String {
        throw AuthenticationError.configurationError
    }

    func signOut() {
        currentEmail = nil
    }
}
