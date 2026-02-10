import SwiftUI
import GoogleSignIn

/// The main entry point for the HelpMeClean client iOS app.
///
/// Creates the ``AuthViewModel`` as a `@StateObject` and injects it into the
/// view hierarchy via `@EnvironmentObject` so all child views can access
/// authentication state. Also handles the Google Sign-In callback URL.
@main
struct HelpMeCleanApp: App {

    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authVM)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}
