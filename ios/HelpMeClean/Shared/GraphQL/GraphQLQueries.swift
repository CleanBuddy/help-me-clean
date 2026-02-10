import Foundation

/// Contains all GraphQL query and mutation strings used by the HelpMeClean client app.
enum GQL {

    // MARK: - Authentication

    /// Signs in using a Google ID token (or dev token) and returns auth payload.
    static let signInWithGoogle = """
    mutation signInWithGoogle($idToken: String!, $role: UserRole!) {
        signInWithGoogle(idToken: $idToken, role: $role) {
            token
            user { id email fullName role status phone avatarUrl preferredLanguage createdAt }
            isNewUser
        }
    }
    """

    /// Fetches the currently authenticated user's profile.
    static let me = """
    query me {
        me { id email fullName role status phone avatarUrl preferredLanguage createdAt }
    }
    """

    // MARK: - Bookings

    /// Fetches the authenticated client's bookings with optional status filter.
    static let myBookings = """
    query myBookings($status: BookingStatus, $first: Int) {
        myBookings(status: $status, first: $first) {
            edges {
                id referenceCode serviceType serviceName scheduledDate scheduledStartTime
                estimatedDurationHours status estimatedTotal paymentStatus createdAt
                company { id companyName }
                cleaner { id fullName }
                address { streetAddress city }
            }
            totalCount
        }
    }
    """

    /// Fetches full details for a single booking by ID.
    static let bookingDetail = """
    query booking($id: ID!) {
        booking(id: $id) {
            id referenceCode serviceType serviceName scheduledDate scheduledStartTime
            estimatedDurationHours propertyType numRooms numBathrooms areaSqm hasPets
            specialInstructions hourlyRate estimatedTotal finalTotal status paymentStatus
            startedAt completedAt cancelledAt cancellationReason createdAt
            company { id companyName contactEmail contactPhone }
            cleaner { id fullName phone }
            address { streetAddress city county postalCode floor apartment }
            review { id rating comment }
        }
    }
    """

    /// Creates a new booking request.
    static let createBooking = """
    mutation createBookingRequest($input: CreateBookingInput!) {
        createBookingRequest(input: $input) {
            id referenceCode status estimatedTotal serviceName
        }
    }
    """

    /// Cancels an existing booking with an optional reason.
    static let cancelBooking = """
    mutation cancelBooking($id: ID!, $reason: String) {
        cancelBooking(id: $id, reason: $reason) { id status }
    }
    """

    // MARK: - Addresses

    /// Fetches all saved addresses for the authenticated user.
    static let myAddresses = """
    query myAddresses {
        myAddresses { id label streetAddress city county postalCode floor apartment notes isDefault }
    }
    """

    // MARK: - Profile

    /// Updates the authenticated user's profile fields.
    static let updateProfile = """
    mutation updateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) { id fullName phone avatarUrl preferredLanguage }
    }
    """

    // MARK: - Services

    /// Fetches all available service definitions.
    static let serviceDefinitions = """
    query serviceDefinitions {
        serviceDefinitions {
            id serviceType nameRo descriptionRo basePricePerHour minHours icon isActive
        }
    }
    """

    // MARK: - Reviews

    /// Submits a review for a completed booking.
    static let submitReview = """
    mutation submitReview($bookingId: ID!, $rating: Int!, $comment: String) {
        submitReview(bookingId: $bookingId, rating: $rating, comment: $comment) {
            id rating comment createdAt
        }
    }
    """

    // MARK: - Chat

    /// Fetches all chat rooms for the authenticated user.
    static let myChatRooms = """
    query myChatRooms {
        myChatRooms {
            id roomType createdAt
            lastMessage { id content messageType isRead createdAt sender { id fullName } }
            participants { user { id fullName avatarUrl } joinedAt }
        }
    }
    """

    /// Fetches full details for a single chat room including messages.
    static let chatRoomDetail = """
    query chatRoom($id: ID!) {
        chatRoom(id: $id) {
            id roomType
            participants { user { id fullName avatarUrl } joinedAt }
            messages { edges { id content messageType isRead createdAt sender { id fullName avatarUrl } } }
        }
    }
    """

    /// Sends a new message in a chat room.
    static let sendMessage = """
    mutation sendMessage($roomId: ID!, $content: String!) {
        sendMessage(roomId: $roomId, content: $content) {
            id content messageType isRead createdAt sender { id fullName }
        }
    }
    """

    /// Opens or retrieves an existing chat room for a booking.
    static let openBookingChat = """
    mutation openBookingChat($bookingId: ID!) {
        openBookingChat(bookingId: $bookingId) { id roomType }
    }
    """

    /// Marks all messages in a chat room as read by the current user.
    static let markMessagesAsRead = """
    mutation markMessagesAsRead($roomId: ID!) {
        markMessagesAsRead(roomId: $roomId)
    }
    """
}
