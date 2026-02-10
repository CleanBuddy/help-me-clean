import SwiftUI

/// The user profile screen displaying account info, settings, and sign-out option.
struct ProfileView: View {

    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Avatar and Name
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(AppTheme.primary.opacity(0.1))
                                .frame(width: 80, height: 80)

                            Text(initials(from: authVM.user?.fullName))
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(AppTheme.primary)
                        }

                        Text(authVM.user?.fullName ?? "--")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(AppTheme.textPrimary)

                        Text(authVM.user?.email ?? "--")
                            .font(.subheadline)
                            .foregroundColor(AppTheme.textSecondary)
                    }
                    .padding(.top, 8)

                    // Account Section
                    VStack(alignment: .leading, spacing: 0) {
                        SectionHeader(title: "Cont")
                        ProfileRow(icon: "person", title: "Editeaza profilul")
                        ProfileRow(icon: "mappin", title: "Adresele mele")
                        ProfileRow(icon: "creditcard", title: "Metode de plata")
                    }
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                            .fill(.white)
                            .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
                    )

                    // Settings Section
                    VStack(alignment: .leading, spacing: 0) {
                        SectionHeader(title: "Setari")
                        ProfileRow(icon: "bell", title: "Notificari")
                        ProfileRow(icon: "globe", title: "Limba")
                        ProfileRow(icon: "questionmark.circle", title: "Ajutor")
                    }
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                            .fill(.white)
                            .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
                    )

                    // Logout Button
                    Button {
                        authVM.logout()
                    } label: {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Deconectare")
                        }
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(AppTheme.danger.opacity(0.1))
                        .foregroundColor(AppTheme.danger)
                        .cornerRadius(AppTheme.cornerRadius)
                    }
                    .padding(.top, 8)
                }
                .padding(16)
            }
            .background(AppTheme.background)
            .navigationTitle("Profil")
        }
    }

    // MARK: - Helpers

    /// Extracts initials from a full name string.
    private func initials(from name: String?) -> String {
        guard let name = name else { return "?" }
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

// MARK: - Section Header

/// A small uppercase label used to title groups of profile rows.
struct SectionHeader: View {

    let title: String

    var body: some View {
        Text(title.uppercased())
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundColor(AppTheme.textSecondary)
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 4)
    }
}

// MARK: - Profile Row

/// A single tappable row in the profile settings list.
struct ProfileRow: View {

    let icon: String
    let title: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .frame(width: 24)
                .foregroundColor(AppTheme.primary)

            Text(title)
                .foregroundColor(AppTheme.textPrimary)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
