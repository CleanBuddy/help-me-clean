import Foundation

// MARK: - User

/// Represents an authenticated user in the HelpMeClean system.
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let fullName: String
    let role: String
    let status: String
    var phone: String?
    var avatarUrl: String?
    var preferredLanguage: String?
    var createdAt: String?
}

// MARK: - Authentication

/// The payload returned after a successful sign-in operation.
struct AuthPayload: Codable {
    let token: String
    let user: User
    let isNewUser: Bool
}

/// Wrapper for the signInWithGoogle mutation response.
struct SignInResponse: Codable {
    let signInWithGoogle: AuthPayload
}

/// Wrapper for the me query response.
struct MeResponse: Codable {
    let me: User
}

// MARK: - Booking

/// Represents a cleaning service booking with all associated details.
struct Booking: Codable, Identifiable {
    let id: String
    let referenceCode: String
    var serviceType: String?
    let serviceName: String
    let scheduledDate: String
    let scheduledStartTime: String
    var estimatedDurationHours: Double?
    var propertyType: String?
    var numRooms: Int?
    var numBathrooms: Int?
    var areaSqm: Int?
    var hasPets: Bool?
    var specialInstructions: String?
    var hourlyRate: Double?
    let estimatedTotal: Double
    var finalTotal: Double?
    let status: String
    var paymentStatus: String?
    var startedAt: String?
    var completedAt: String?
    var cancelledAt: String?
    var cancellationReason: String?
    var createdAt: String?
    var company: CompanyRef?
    var cleaner: CleanerRef?
    var address: AddressInfo?
    var review: ReviewInfo?
}

/// A lightweight reference to a cleaning company.
struct CompanyRef: Codable {
    let id: String
    var companyName: String?
    var contactEmail: String?
    var contactPhone: String?
}

/// A lightweight reference to a cleaner (worker).
struct CleanerRef: Codable {
    let id: String
    var fullName: String?
    var phone: String?
}

/// Represents a physical address for a booking or saved location.
struct AddressInfo: Codable, Identifiable {
    let id: String?
    var label: String?
    let streetAddress: String
    let city: String
    var county: String?
    var postalCode: String?
    var floor: String?
    var apartment: String?
    var notes: String?
    var isDefault: Bool?
}

/// Represents a client review for a completed booking.
struct ReviewInfo: Codable {
    let id: String
    let rating: Int
    var comment: String?
}

// MARK: - Booking Connection (Pagination)

/// Paginated connection wrapper for booking lists.
struct BookingConnection: Codable {
    let edges: [Booking]
    let totalCount: Int
}

// MARK: - Response Wrappers

/// Wrapper for the myBookings query response.
struct MyBookingsResponse: Codable {
    let myBookings: BookingConnection
}

/// Wrapper for the booking detail query response.
struct BookingDetailResponse: Codable {
    let booking: Booking
}

/// Wrapper for the createBookingRequest mutation response.
struct CreateBookingResponse: Codable {
    let createBookingRequest: Booking
}

/// Wrapper for the myAddresses query response.
struct MyAddressesResponse: Codable {
    let myAddresses: [AddressInfo]
}

// MARK: - Service Definition

/// Describes a cleaning service offered by the platform.
struct ServiceDefinition: Codable, Identifiable {
    let id: String
    let serviceType: String
    let nameRo: String
    var descriptionRo: String?
    let basePricePerHour: Double
    let minHours: Double
    var icon: String?
    var isActive: Bool?
}

/// Wrapper for the serviceDefinitions query response.
struct ServiceDefinitionsResponse: Codable {
    let serviceDefinitions: [ServiceDefinition]
}

// MARK: - Cancel Booking Response

/// Wrapper for the cancelBooking mutation response.
struct CancelBookingResponse: Codable {
    let cancelBooking: CancelBookingResult
}

/// The result of a booking cancellation.
struct CancelBookingResult: Codable {
    let id: String
    let status: String
}

// MARK: - Submit Review Response

/// Wrapper for the submitReview mutation response.
struct SubmitReviewResponse: Codable {
    let submitReview: SubmitReviewResult
}

/// The result of a review submission.
struct SubmitReviewResult: Codable {
    let id: String
    let rating: Int
    var comment: String?
    var createdAt: String?
}

// MARK: - Booking Status Helpers

/// Enumeration of all possible booking statuses.
enum BookingStatus: String {
    case pending = "PENDING"
    case assigned = "ASSIGNED"
    case confirmed = "CONFIRMED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelledByClient = "CANCELLED_BY_CLIENT"
    case cancelledByCompany = "CANCELLED_BY_COMPANY"
    case cancelledByAdmin = "CANCELLED_BY_ADMIN"

    /// A human-readable Romanian display name for the status.
    var displayName: String {
        switch self {
        case .pending: return "In asteptare"
        case .assigned: return "Asignat"
        case .confirmed: return "Confirmat"
        case .inProgress: return "In desfasurare"
        case .completed: return "Finalizat"
        case .cancelledByClient, .cancelledByCompany, .cancelledByAdmin: return "Anulat"
        }
    }

    /// Whether this status represents a cancelled booking.
    var isCancelled: Bool {
        switch self {
        case .cancelledByClient, .cancelledByCompany, .cancelledByAdmin:
            return true
        default:
            return false
        }
    }
}

// MARK: - Chat

/// Represents a single message in a chat conversation.
struct ChatMessage: Codable, Identifiable {
    let id: String
    let content: String
    var messageType: String?
    var isRead: Bool?
    var createdAt: String?
    var sender: UserRef?
}

/// A lightweight reference to a user, used in chat participants and message senders.
struct UserRef: Codable {
    let id: String
    var fullName: String?
    var avatarUrl: String?
}

/// Represents a participant in a chat room.
struct ChatParticipant: Codable {
    let user: UserRef
    var joinedAt: String?
}

/// Paginated connection wrapper for chat messages.
struct ChatMessageConnection: Codable {
    let edges: [ChatMessage]
}

/// Represents a chat room containing participants and messages.
struct ChatRoom: Codable, Identifiable {
    let id: String
    let roomType: String
    var createdAt: String?
    var lastMessage: ChatMessage?
    var participants: [ChatParticipant]?
    var messages: ChatMessageConnection?
}

/// Wrapper for the myChatRooms query response.
struct MyChatRoomsResponse: Codable {
    let myChatRooms: [ChatRoom]
}

/// Wrapper for the chatRoom detail query response.
struct ChatRoomDetailResponse: Codable {
    let chatRoom: ChatRoom
}

/// Wrapper for the sendMessage mutation response.
struct SendMessageResponse: Codable {
    let sendMessage: ChatMessage
}

/// Wrapper for the openBookingChat mutation response.
struct OpenBookingChatResponse: Codable {
    let openBookingChat: ChatRoom
}

/// Wrapper for the markMessagesAsRead mutation response.
struct MarkMessagesReadResponse: Codable {
    let markMessagesAsRead: Bool
}
