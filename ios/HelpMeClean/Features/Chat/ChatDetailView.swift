import SwiftUI

/// Displays the message conversation for a specific chat room.
///
/// Shows message bubbles aligned by sender (current user on the right, others on the left),
/// a text input bar at the bottom, and polls for new messages every 3 seconds.
struct ChatDetailView: View {

    // MARK: - Properties

    /// The chat room ID to display messages for.
    let roomId: String

    /// The display name of the other participant, used as the navigation title.
    let otherUserName: String

    // MARK: - State

    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""

    /// The current user's ID, used to determine message alignment.
    private var currentUserId: String? {
        UserDefaults.standard.string(forKey: "helpmeclean_user_id")
    }

    // MARK: - Body

    var body: some View {
        VStack(spacing: 0) {
            messageList
            inputBar
        }
        .background(AppTheme.background)
        .navigationTitle(otherUserName)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await viewModel.loadMessages(roomId: roomId)
                await viewModel.markAsRead(roomId: roomId)
                viewModel.startPolling(roomId: roomId)
            }
        }
        .onDisappear {
            viewModel.stopPolling()
        }
    }

    // MARK: - Message List

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.messages) { message in
                        messageBubble(for: message)
                            .id(message.id)
                    }
                }
                .padding(.horizontal, AppTheme.spacing)
                .padding(.vertical, 8)
            }
            .onChange(of: viewModel.messages.count) { _ in
                if let lastId = viewModel.messages.last?.id {
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo(lastId, anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Message Bubble

    private func messageBubble(for message: ChatMessage) -> some View {
        let isSent = message.sender?.id == currentUserId

        return HStack {
            if isSent { Spacer(minLength: 60) }

            VStack(alignment: isSent ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .font(.body)
                    .foregroundColor(isSent ? .white : AppTheme.textPrimary)

                if let createdAt = message.createdAt {
                    Text(formattedTime(from: createdAt))
                        .font(.caption2)
                        .foregroundColor(isSent ? .white.opacity(0.7) : AppTheme.textSecondary)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isSent ? AppTheme.primary : Color(.systemGray5))
            .cornerRadius(AppTheme.cornerRadius)

            if !isSent { Spacer(minLength: 60) }
        }
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField("Scrie un mesaj...", text: $messageText)
                .textFieldStyle(.plain)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(Color(.systemGray6))
                .cornerRadius(AppTheme.cornerRadius)

            Button {
                let text = messageText
                messageText = ""
                Task {
                    await viewModel.sendMessage(roomId: roomId, content: text)
                }
            } label: {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 20))
                    .foregroundColor(
                        messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                        ? AppTheme.textSecondary
                        : AppTheme.primary
                    )
            }
            .disabled(messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.isSending)
        }
        .padding(.horizontal, AppTheme.spacing)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
    }

    // MARK: - Helpers

    /// Formats an ISO 8601 date string into a short time display (e.g. "14:30").
    private func formattedTime(from dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: dateString) {
            let timeFormatter = DateFormatter()
            timeFormatter.dateFormat = "HH:mm"
            return timeFormatter.string(from: date)
        }

        // Fallback: try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: dateString) {
            let timeFormatter = DateFormatter()
            timeFormatter.dateFormat = "HH:mm"
            return timeFormatter.string(from: date)
        }

        return ""
    }
}
