import SwiftUI

/// The welcome / sign-in screen displayed when the user is not authenticated.
///
/// Supports two modes toggled via a DEBUG-only button:
/// - **Google Sign-In** -- the production flow using the Google SDK.
/// - **Dev Mode** -- accepts an email address and authenticates with a dev token.
struct WelcomeView: View {

    @EnvironmentObject var authVM: AuthViewModel
    @State private var email = ""
    @State private var isLoading = false
    @State private var showDevMode = AppConfig.Auth.useDevAuth

    var body: some View {
        ZStack {
            AppTheme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo and Title
                VStack(spacing: 16) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 24)
                            .fill(AppTheme.primary.opacity(0.1))
                            .frame(width: 88, height: 88)

                        Image(systemName: "sparkles")
                            .font(.system(size: 40))
                            .foregroundColor(AppTheme.primary)
                    }

                    Text("HelpMeClean")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundColor(AppTheme.textPrimary)

                    Text("Curatenie profesionala la un click distanta")
                        .font(.body)
                        .foregroundColor(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }

                Spacer()

                // Login Card
                VStack(spacing: 16) {
                    if !showDevMode {
                        // Google Sign-In Button
                        Button {
                            guard !isLoading else { return }
                            isLoading = true
                            Task {
                                await authVM.loginWithGoogle()
                                isLoading = false
                            }
                        } label: {
                            HStack(spacing: 12) {
                                if isLoading {
                                    ProgressView()
                                        .tint(AppTheme.textPrimary)
                                } else {
                                    Image(systemName: "g.circle.fill")
                                        .font(.title2)
                                }
                                Text(isLoading ? "Se conecteaza..." : "Conecteaza-te cu Google")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(.white)
                            .foregroundColor(AppTheme.textPrimary)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                    .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                            )
                            .cornerRadius(AppTheme.cornerRadius)
                        }
                        .disabled(isLoading)
                    } else {
                        // Dev Mode
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Adresa de email (Dev Mode)")
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(AppTheme.textPrimary)

                            TextField("exemplu@email.com", text: $email)
                                .textFieldStyle(.plain)
                                .keyboardType(.emailAddress)
                                .textContentType(.emailAddress)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(
                                    RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                        .fill(.white)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                                        )
                                )
                        }

                        Button {
                            guard !trimmedEmail.isEmpty, !isLoading else { return }
                            isLoading = true
                            Task {
                                await authVM.loginDev(email: trimmedEmail)
                                isLoading = false
                            }
                        } label: {
                            HStack(spacing: 8) {
                                if isLoading {
                                    ProgressView()
                                        .tint(.white)
                                        .scaleEffect(0.9)
                                }
                                Text(isLoading ? "Se conecteaza..." : "Conecteaza-te (Dev)")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(AppTheme.primary)
                            .foregroundColor(.white)
                            .cornerRadius(AppTheme.cornerRadius)
                        }
                        .disabled(isLoading || trimmedEmail.isEmpty)
                        .opacity(trimmedEmail.isEmpty ? 0.6 : 1)
                    }

                    if let error = authVM.error {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(AppTheme.danger)
                    }
                }
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.white)
                        .shadow(color: .black.opacity(0.05), radius: 20, y: 10)
                )
                .padding(.horizontal, 24)

                // Dev mode toggle (only in DEBUG builds)
                #if DEBUG
                Button {
                    showDevMode.toggle()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "info.circle")
                            .font(.caption)
                        Text(showDevMode ? "Foloseste Google Auth" : "Foloseste Dev Mode")
                            .font(.caption)
                    }
                    .foregroundColor(AppTheme.textSecondary)
                }
                .padding(.top, 16)
                #endif

                Spacer()
                    .frame(height: 32)
            }
        }
    }

    // MARK: - Helpers

    private var trimmedEmail: String {
        email.trimmingCharacters(in: .whitespaces)
    }
}
