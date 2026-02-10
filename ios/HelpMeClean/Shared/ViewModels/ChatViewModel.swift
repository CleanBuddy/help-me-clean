import SwiftUI

/// Manages chat state for the HelpMeClean client app.
///
/// Provides methods to load chat rooms, send and receive messages, and manage
/// a polling timer for near-real-time message updates without WebSocket support.
@MainActor
class ChatViewModel: ObservableObject {

    // MARK: - Published State

    /// The list of chat rooms for the current user.
    @Published var rooms: [ChatRoom] = []

    /// The messages in the currently active chat room.
    @Published var messages: [ChatMessage] = []

    /// The participants in the currently active chat room.
    @Published var participants: [ChatParticipant] = []

    /// Whether a network request is currently in progress.
    @Published var isLoading = false

    /// Whether a message is currently being sent.
    @Published var isSending = false

    /// An error message to display to the user, if any.
    @Published var error: String?

    // MARK: - Private

    private let client = GraphQLClient.shared
    private var pollingTimer: Timer?

    // MARK: - Room Methods

    /// Loads all chat rooms for the authenticated user.
    func loadRooms() async {
        isLoading = true
        error = nil

        do {
            let response: MyChatRoomsResponse = try await client.execute(
                query: GQL.myChatRooms
            )
            rooms = response.myChatRooms
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    /// Opens or retrieves an existing chat room for the given booking.
    ///
    /// - Parameter bookingId: The booking ID to open a chat for.
    /// - Returns: The chat room ID if successful, `nil` otherwise.
    func openBookingChat(bookingId: String) async -> String? {
        do {
            let response: OpenBookingChatResponse = try await client.execute(
                query: GQL.openBookingChat,
                variables: ["bookingId": bookingId]
            )
            return response.openBookingChat.id
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }

    // MARK: - Message Methods

    /// Loads all messages for the specified chat room.
    ///
    /// - Parameter roomId: The chat room ID to fetch messages for.
    func loadMessages(roomId: String) async {
        do {
            let response: ChatRoomDetailResponse = try await client.execute(
                query: GQL.chatRoomDetail,
                variables: ["id": roomId]
            )
            messages = response.chatRoom.messages?.edges ?? []
            participants = response.chatRoom.participants ?? []
        } catch {
            self.error = error.localizedDescription
        }
    }

    /// Sends a text message in the specified chat room.
    ///
    /// Appends the sent message to the local messages array on success.
    ///
    /// - Parameters:
    ///   - roomId: The chat room ID to send the message in.
    ///   - content: The message text content.
    func sendMessage(roomId: String, content: String) async {
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        isSending = true

        do {
            let response: SendMessageResponse = try await client.execute(
                query: GQL.sendMessage,
                variables: ["roomId": roomId, "content": trimmed]
            )
            messages.append(response.sendMessage)
        } catch {
            self.error = error.localizedDescription
        }

        isSending = false
    }

    /// Marks all messages in the specified chat room as read.
    ///
    /// - Parameter roomId: The chat room ID whose messages should be marked as read.
    func markAsRead(roomId: String) async {
        do {
            let _: MarkMessagesReadResponse = try await client.execute(
                query: GQL.markMessagesAsRead,
                variables: ["roomId": roomId]
            )
        } catch {
            // Silently ignore mark-as-read failures to avoid disrupting the user experience.
        }
    }

    // MARK: - Polling

    /// Starts polling for new messages at the specified interval.
    ///
    /// - Parameters:
    ///   - roomId: The chat room ID to poll for messages.
    ///   - interval: The polling interval in seconds. Defaults to 3 seconds.
    func startPolling(roomId: String, interval: TimeInterval = 3.0) {
        stopPolling()
        pollingTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            Task { @MainActor in
                await self.loadMessages(roomId: roomId)
            }
        }
    }

    /// Stops the active polling timer.
    func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }
}
