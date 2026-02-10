import SwiftUI
import GoogleSignIn

/// Manages authentication state for the HelpMeClean client app.
///
/// Supports two authentication flows through protocol-oriented providers:
/// - **Google Sign-In** via ``GoogleAuthProvider`` for production use.
/// - **Dev tokens** via ``DevAuthProvider`` for development/testing.
///
/// Handles session persistence via JWT stored in UserDefaults and provides
/// the current user profile to the view hierarchy via `@EnvironmentObject`.
@MainActor
class AuthViewModel: ObservableObject {

    // MARK: - Published State

    /// The currently authenticated user, or `nil` if not signed in.
    @Published var user: User?

    /// Whether the user is currently authenticated.
    @Published var isAuthenticated = false

    /// Whether the initial auth check is still in progress.
    @Published var isLoading = true

    /// An error message to display to the user, if any.
    @Published var error: String?

    // MARK: - Private

    private let client = GraphQLClient.shared
    private let googleProvider: GoogleAuthProvider
    private let devProvider: DevAuthProvider

    // MARK: - Initialization

    init() {
        self.googleProvider = GoogleAuthProvider(clientID: AppConfig.Auth.googleClientID)
        self.devProvider = DevAuthProvider(devTokenPrefix: AppConfig.Auth.devTokenPrefix)
        Task { await checkAuth() }
    }

    // MARK: - Public Methods

    /// Checks whether the stored auth token is still valid by querying the current user.
    func checkAuth() async {
        guard client.authToken != nil else {
            isLoading = false
            return
        }

        do {
            let response: MeResponse = try await client.execute(query: GQL.me)
            user = response.me
            isAuthenticated = true
        } catch {
            // Token is invalid or expired; clear it
            client.authToken = nil
            isAuthenticated = false
        }

        isLoading = false
    }

    /// Signs in using Google Sign-In.
    ///
    /// Presents the Google Sign-In sheet, obtains an ID token, and sends it
    /// to the backend for verification and JWT exchange.
    func loginWithGoogle() async {
        error = nil

        do {
            let idToken = try await googleProvider.signIn()
            try await authenticate(idToken: idToken)
        } catch let authError as AuthenticationError {
            if case .cancelled = authError { return }
            self.error = authError.localizedDescription
        } catch {
            self.error = "Autentificarea a esuat. Te rugam sa incerci din nou."
        }
    }

    /// Signs in using a dev token derived from the provided email address.
    ///
    /// - Parameter email: The email address to use for dev authentication.
    func loginDev(email: String) async {
        error = nil

        do {
            let idToken = try await devProvider.signIn(email: email)
            try await authenticate(idToken: idToken)
        } catch {
            self.error = "Autentificarea a esuat. Te rugam sa incerci din nou."
        }
    }

    /// Signs out the current user, clearing the stored token and resetting state.
    func logout() {
        googleProvider.signOut()
        devProvider.signOut()
        client.authToken = nil
        user = nil
        isAuthenticated = false
    }

    // MARK: - Private Helpers

    /// Sends an ID token to the backend and stores the resulting JWT.
    ///
    /// - Parameter idToken: The token obtained from an ``AuthenticationProvider``.
    private func authenticate(idToken: String) async throws {
        let response: SignInResponse = try await client.execute(
            query: GQL.signInWithGoogle,
            variables: ["idToken": idToken, "role": AppConfig.Auth.defaultRole]
        )
        client.authToken = response.signInWithGoogle.token
        user = response.signInWithGoogle.user
        isAuthenticated = true
    }
}
