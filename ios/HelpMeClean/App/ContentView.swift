import SwiftUI

/// The root view that routes between the loading splash, authentication screen,
/// and the main tab interface based on the current authentication state.
struct ContentView: View {

    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        Group {
            if authVM.isLoading {
                // Loading splash screen
                ZStack {
                    AppTheme.background.ignoresSafeArea()

                    VStack(spacing: 16) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 48))
                            .foregroundColor(AppTheme.primary)

                        Text("HelpMeClean")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(AppTheme.textPrimary)

                        ProgressView()
                            .tint(AppTheme.primary)
                    }
                }
            } else if authVM.isAuthenticated {
                MainTabView()
            } else {
                WelcomeView()
            }
        }
    }
}
