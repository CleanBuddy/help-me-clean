import SwiftUI

/// Displays the list of the current user's bookings with optional status filtering.
///
/// Supports pull-to-refresh and navigates to ``BookingDetailView`` on row tap.
struct BookingListView: View {

    @StateObject private var vm = BookingsViewModel()
    @State private var selectedStatus: String?

    /// Filter options displayed as horizontal chips.
    private let statusFilters: [(value: String?, label: String)] = [
        (nil, "Toate"),
        ("PENDING", "In asteptare"),
        ("CONFIRMED", "Confirmate"),
        ("IN_PROGRESS", "In desfasurare"),
        ("COMPLETED", "Finalizate"),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Horizontal status filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(statusFilters, id: \.label) { filter in
                            Button {
                                selectedStatus = filter.value
                                Task { await vm.loadBookings(status: filter.value) }
                            } label: {
                                Text(filter.label)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(
                                        RoundedRectangle(cornerRadius: 10)
                                            .fill(
                                                selectedStatus == filter.value
                                                    ? AppTheme.primary
                                                    : Color.gray.opacity(0.1)
                                            )
                                    )
                                    .foregroundColor(
                                        selectedStatus == filter.value
                                            ? .white
                                            : AppTheme.textSecondary
                                    )
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }

                // Content
                if vm.isLoading {
                    Spacer()
                    ProgressView()
                        .tint(AppTheme.primary)
                    Spacer()
                } else if vm.bookings.isEmpty {
                    Spacer()
                    emptyStateView
                    Spacer()
                } else {
                    List {
                        ForEach(vm.bookings) { booking in
                            NavigationLink(value: booking.id) {
                                BookingRowView(booking: booking)
                            }
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Rezervari")
            .navigationDestination(for: String.self) { bookingId in
                BookingDetailView(bookingId: bookingId)
            }
            .task {
                await vm.loadBookings()
            }
            .refreshable {
                await vm.loadBookings(status: selectedStatus)
            }
        }
    }

    // MARK: - Subviews

    private var emptyStateView: some View {
        VStack(spacing: 12) {
            Image(systemName: "calendar.badge.exclamationmark")
                .font(.system(size: 48))
                .foregroundColor(.gray.opacity(0.4))

            Text("Nicio rezervare")
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)

            Text("Rezervarile tale vor aparea aici.")
                .font(.subheadline)
                .foregroundColor(AppTheme.textSecondary)
        }
    }
}

// MARK: - Booking Row

/// A single row in the booking list showing summary information.
struct BookingRowView: View {

    let booking: Booking

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(booking.serviceName)
                    .font(.headline)
                    .foregroundColor(AppTheme.textPrimary)
                Spacer()
                StatusBadgeView(status: booking.status)
            }

            HStack(spacing: 16) {
                Label(formatDate(booking.scheduledDate), systemImage: "calendar")
                Label(booking.scheduledStartTime, systemImage: "clock")
            }
            .font(.caption)
            .foregroundColor(AppTheme.textSecondary)

            if let address = booking.address {
                Label("\(address.streetAddress), \(address.city)", systemImage: "mappin")
                    .font(.caption)
                    .foregroundColor(AppTheme.textSecondary)
            }

            HStack {
                Text(booking.referenceCode)
                    .font(.caption2)
                    .foregroundColor(.gray)
                Spacer()
                Text(formatCurrency(booking.estimatedTotal))
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(AppTheme.primary)
            }
        }
        .padding(.vertical, 4)
    }

    // MARK: - Helpers

    private func formatDate(_ dateStr: String) -> String {
        let parts = dateStr.prefix(10).split(separator: "-")
        guard parts.count == 3 else { return dateStr }
        return "\(parts[2]).\(parts[1]).\(parts[0])"
    }

    private func formatCurrency(_ value: Double) -> String {
        return String(format: "%.0f RON", value)
    }
}
