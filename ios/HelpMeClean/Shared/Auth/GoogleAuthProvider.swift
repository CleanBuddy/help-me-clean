import Foundation
import UIKit
import GoogleSignIn

/// Google Sign-In authentication provider.
///
/// Wraps the `GoogleSignIn` SDK behind the ``AuthenticationProvider`` protocol
/// so the view model does not depend on a concrete SDK type.
class GoogleAuthProvider: AuthenticationProvider {

    // MARK: - Properties

    private let clientID: String

    // MARK: - Initialization

    /// Creates a new Google auth provider.
    ///
    /// - Parameter clientID: The OAuth 2.0 client ID registered in Google Cloud Console.
    init(clientID: String) {
        self.clientID = clientID
    }

    // MARK: - AuthenticationProvider

    var isSignedIn: Bool {
        GIDSignIn.sharedInstance.currentUser != nil
    }

    @MainActor
    func signIn() async throws -> String {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            throw AuthenticationError.configurationError
        }

        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config

        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)
            guard let idToken = result.user.idToken?.tokenString else {
                throw AuthenticationError.noIDToken
            }
            return idToken
        } catch let error as GIDSignInError where error.code == .canceled {
            throw AuthenticationError.cancelled
        } catch let error as AuthenticationError {
            throw error
        } catch {
            throw AuthenticationError.unknownError(error)
        }
    }

    func signOut() {
        GIDSignIn.sharedInstance.signOut()
    }
}
