import SwiftUI

/// Displays the list of chat rooms for the authenticated user.
///
/// Each row shows the other participant's name, the last message preview, and a timestamp.
/// Navigating a row opens the full conversation in ``ChatDetailView``.
struct ChatListView: View {

    // MARK: - State

    @StateObject private var viewModel = ChatViewModel()

    /// The current user's ID, used to determine which participant is "the other one".
    private var currentUserId: String? {
        UserDefaults.standard.string(forKey: "helpmeclean_user_id")
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.rooms.isEmpty {
                    loadingView
                } else if viewModel.rooms.isEmpty {
                    emptyStateView
                } else {
                    roomListView
                }
            }
            .background(AppTheme.background)
            .navigationTitle("Mesaje")
        }
        .onAppear {
            Task { await viewModel.loadRooms() }
        }
    }

    // MARK: - Room List

    private var roomListView: some View {
        List(viewModel.rooms) { room in
            let otherName = otherParticipantName(in: room)
            NavigationLink(destination: ChatDetailView(roomId: room.id, otherUserName: otherName)) {
                roomRow(room: room, otherName: otherName)
            }
        }
        .listStyle(.plain)
        .refreshable {
            await viewModel.loadRooms()
        }
    }

    // MARK: - Room Row

    private func roomRow(room: ChatRoom, otherName: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            // Avatar circle with initials
            ZStack {
                Circle()
                    .fill(AppTheme.primary.opacity(0.15))
                    .frame(width: 48, height: 48)

                Text(initials(from: otherName))
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(AppTheme.primary)
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(otherName)
                        .font(.body)
                        .fontWeight(.semibold)
                        .foregroundColor(AppTheme.textPrimary)
                        .lineLimit(1)

                    Spacer()

                    if let createdAt = room.lastMessage?.createdAt {
                        Text(formattedDate(from: createdAt))
                            .font(.caption)
                            .foregroundColor(AppTheme.textSecondary)
                    }
                }

                if let lastMessage = room.lastMessage {
                    Text(lastMessage.content)
                        .font(.subheadline)
                        .foregroundColor(AppTheme.textSecondary)
                        .lineLimit(2)
                }
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Spacer()

            Image(systemName: "message.badge.fill")
                .font(.system(size: 52))
                .foregroundColor(.gray.opacity(0.3))

            Text("Niciun mesaj")
                .font(.title3)
                .fontWeight(.semibold)
                .foregroundColor(AppTheme.textPrimary)

            Text("Conversatiile cu curatatorii vor aparea aici dupa ce ai o rezervare activa.")
                .font(.subheadline)
                .foregroundColor(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 48)

            Spacer()
        }
        .frame(maxWidth: .infinity)
        .refreshable {
            await viewModel.loadRooms()
        }
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack {
            Spacer()
            ProgressView()
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Helpers

    /// Returns the display name of the participant who is not the current user.
    private func otherParticipantName(in room: ChatRoom) -> String {
        guard let participants = room.participants else { return "Conversatie" }

        if let other = participants.first(where: { $0.user.id != currentUserId }) {
            return other.user.fullName ?? "Utilizator"
        }

        // Fallback: return first participant's name
        return participants.first?.user.fullName ?? "Conversatie"
    }

    /// Extracts up to two initials from a full name string.
    private func initials(from name: String) -> String {
        let components = name.split(separator: " ")
        let result = components.prefix(2).compactMap { $0.first }.map { String($0).uppercased() }
        return result.joined()
    }

    /// Formats an ISO 8601 date string into a short display format.
    ///
    /// Shows "HH:mm" if the date is today, otherwise shows "dd MMM".
    private func formattedDate(from dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        var date = formatter.date(from: dateString)

        if date == nil {
            formatter.formatOptions = [.withInternetDateTime]
            date = formatter.date(from: dateString)
        }

        guard let parsedDate = date else { return "" }

        let displayFormatter = DateFormatter()

        if Calendar.current.isDateInToday(parsedDate) {
            displayFormatter.dateFormat = "HH:mm"
        } else {
            displayFormatter.dateFormat = "dd MMM"
        }

        return displayFormatter.string(from: parsedDate)
    }
}
