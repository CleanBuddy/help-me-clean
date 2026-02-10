import SwiftUI

/// The main tab bar interface shown after authentication.
///
/// Provides tabs for viewing bookings, creating a new booking,
/// accessing messages, and managing the user profile.
struct MainTabView: View {

    var body: some View {
        TabView {
            BookingListView()
                .tabItem {
                    Label("Rezervari", systemImage: "calendar.badge.clock")
                }

            NewBookingView()
                .tabItem {
                    Label("Rezerva", systemImage: "plus.circle.fill")
                }

            ChatListView()
                .tabItem {
                    Label("Mesaje", systemImage: "message.fill")
                }

            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }
        }
        .tint(AppTheme.primary)
    }
}
