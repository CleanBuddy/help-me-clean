import SwiftUI

/// Manages booking list and detail state for the HelpMeClean client app.
///
/// Provides methods to load, filter, and cancel bookings via the GraphQL API.
@MainActor
class BookingsViewModel: ObservableObject {

    // MARK: - Published State

    /// The list of bookings for the current user.
    @Published var bookings: [Booking] = []

    /// The total number of bookings matching the current filter.
    @Published var totalCount = 0

    /// Whether the booking list is currently loading.
    @Published var isLoading = false

    /// An error message to display to the user, if any.
    @Published var error: String?

    /// The currently selected booking for detail view.
    @Published var selectedBooking: Booking?

    /// Whether a booking detail is currently loading.
    @Published var isLoadingDetail = false

    // MARK: - Private

    private let client = GraphQLClient.shared

    // MARK: - Public Methods

    /// Loads the user's bookings, optionally filtered by status.
    ///
    /// - Parameter status: An optional booking status string to filter results.
    func loadBookings(status: String? = nil) async {
        isLoading = true
        error = nil

        do {
            var variables: [String: Any] = ["first": AppConfig.BookingDefaults.paginationLimit]
            if let status = status {
                variables["status"] = status
            }
            let response: MyBookingsResponse = try await client.execute(
                query: GQL.myBookings,
                variables: variables
            )
            bookings = response.myBookings.edges
            totalCount = response.myBookings.totalCount
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    /// Loads full details for a specific booking.
    ///
    /// - Parameter id: The booking ID to fetch details for.
    func loadBookingDetail(id: String) async {
        isLoadingDetail = true

        do {
            let response: BookingDetailResponse = try await client.execute(
                query: GQL.bookingDetail,
                variables: ["id": id]
            )
            selectedBooking = response.booking
        } catch {
            self.error = error.localizedDescription
        }

        isLoadingDetail = false
    }

    /// Cancels a booking with an optional reason.
    ///
    /// - Parameters:
    ///   - id: The booking ID to cancel.
    ///   - reason: An optional cancellation reason.
    /// - Returns: `true` if the cancellation succeeded, `false` otherwise.
    func cancelBooking(id: String, reason: String?) async -> Bool {
        do {
            var variables: [String: Any] = ["id": id]
            if let reason = reason {
                variables["reason"] = reason
            }
            let _: CancelBookingResponse = try await client.execute(
                query: GQL.cancelBooking,
                variables: variables
            )
            await loadBookings()
            return true
        } catch {
            self.error = error.localizedDescription
            return false
        }
    }
}
