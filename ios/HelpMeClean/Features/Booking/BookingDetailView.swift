import SwiftUI

/// Displays full details for a single booking, including schedule, address,
/// property info, pricing, company/cleaner info, and cancellation option.
struct BookingDetailView: View {

    /// The ID of the booking to display.
    let bookingId: String

    @StateObject private var vm = BookingsViewModel()
    @State private var showCancelAlert = false
    @State private var showReviewSheet = false

    var body: some View {
        Group {
            if vm.isLoadingDetail {
                ProgressView()
                    .tint(AppTheme.primary)
            } else if let booking = vm.selectedBooking {
                ScrollView {
                    VStack(spacing: 16) {
                        // Header Card
                        VStack(spacing: 8) {
                            Text(booking.serviceName)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(AppTheme.textPrimary)

                            StatusBadgeView(status: booking.status)

                            Text("Ref: \(booking.referenceCode)")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                .fill(.white)
                                .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
                        )

                        // Schedule
                        DetailSection(title: "Programare", icon: "calendar") {
                            DetailRow(label: "Data", value: formatDate(booking.scheduledDate))
                            DetailRow(label: "Ora", value: booking.scheduledStartTime)
                            if let duration = booking.estimatedDurationHours {
                                DetailRow(label: "Durata", value: "\(Int(duration))h")
                            }
                        }

                        // Address
                        if let address = booking.address {
                            DetailSection(title: "Adresa", icon: "mappin.circle") {
                                DetailRow(label: "Strada", value: address.streetAddress)
                                DetailRow(
                                    label: "Oras",
                                    value: "\(address.city)\(address.county.map { ", \($0)" } ?? "")"
                                )
                                if let floor = address.floor {
                                    DetailRow(label: "Etaj", value: floor)
                                }
                                if let apt = address.apartment {
                                    DetailRow(label: "Apartament", value: apt)
                                }
                            }
                        }

                        // Property Details
                        if booking.propertyType != nil || booking.numRooms != nil {
                            DetailSection(title: "Proprietate", icon: "house") {
                                if let type = booking.propertyType {
                                    DetailRow(label: "Tip", value: type)
                                }
                                if let rooms = booking.numRooms {
                                    DetailRow(label: "Camere", value: "\(rooms)")
                                }
                                if let baths = booking.numBathrooms {
                                    DetailRow(label: "Bai", value: "\(baths)")
                                }
                                if let area = booking.areaSqm {
                                    DetailRow(label: "Suprafata", value: "\(area) mp")
                                }
                                if booking.hasPets == true {
                                    DetailRow(label: "Animale", value: "Da")
                                }
                            }
                        }

                        // Pricing
                        DetailSection(title: "Pret", icon: "creditcard") {
                            if let rate = booking.hourlyRate {
                                DetailRow(label: "Tarif/ora", value: formatCurrency(rate))
                            }
                            DetailRow(label: "Total estimat", value: formatCurrency(booking.estimatedTotal))
                            if let finalTotal = booking.finalTotal {
                                DetailRow(label: "Total final", value: formatCurrency(finalTotal))
                            }
                            if let payStatus = booking.paymentStatus {
                                DetailRow(label: "Plata", value: payStatus)
                            }
                        }

                        // Company
                        if let company = booking.company {
                            DetailSection(title: "Companie", icon: "building.2") {
                                DetailRow(label: "Nume", value: company.companyName ?? "--")
                                if let email = company.contactEmail {
                                    DetailRow(label: "Email", value: email)
                                }
                                if let phone = company.contactPhone {
                                    DetailRow(label: "Telefon", value: phone)
                                }
                            }
                        }

                        // Cleaner
                        if let cleaner = booking.cleaner {
                            DetailSection(title: "Curatator", icon: "person.fill") {
                                DetailRow(label: "Nume", value: cleaner.fullName ?? "--")
                                if let phone = cleaner.phone {
                                    DetailRow(label: "Telefon", value: phone)
                                }
                            }
                        }

                        // Special Instructions
                        if let instructions = booking.specialInstructions, !instructions.isEmpty {
                            DetailSection(title: "Instructiuni speciale", icon: "text.bubble") {
                                Text(instructions)
                                    .font(.subheadline)
                                    .foregroundColor(AppTheme.textSecondary)
                            }
                        }

                        // Review Section
                        if let review = booking.review {
                            DetailSection(title: "Recenzia ta", icon: "star.fill") {
                                HStack(spacing: 4) {
                                    ForEach(1...5, id: \.self) { star in
                                        Image(systemName: star <= review.rating ? "star.fill" : "star")
                                            .foregroundColor(
                                                star <= review.rating ? AppTheme.accent : Color.gray.opacity(0.3)
                                            )
                                    }
                                }
                                if let comment = review.comment, !comment.isEmpty {
                                    Text(comment)
                                        .font(.subheadline)
                                        .foregroundColor(AppTheme.textSecondary)
                                }
                            }
                        }

                        // Action Buttons
                        if booking.status == "COMPLETED" && booking.review == nil {
                            Button {
                                showReviewSheet = true
                            } label: {
                                Text("Lasa o recenzie")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(AppTheme.accent.opacity(0.15))
                                    .foregroundColor(AppTheme.accent)
                                    .cornerRadius(AppTheme.cornerRadius)
                            }
                            .padding(.top, 8)
                        }

                        if booking.status == "PENDING" || booking.status == "CONFIRMED" {
                            Button {
                                showCancelAlert = true
                            } label: {
                                Text("Anuleaza rezervarea")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(AppTheme.danger.opacity(0.1))
                                    .foregroundColor(AppTheme.danger)
                                    .cornerRadius(AppTheme.cornerRadius)
                            }
                            .padding(.top, 4)
                        }
                    }
                    .padding(16)
                }
                .background(AppTheme.background)
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 36))
                        .foregroundColor(.gray.opacity(0.4))
                    Text("Nu s-au putut incarca detaliile")
                        .foregroundColor(.gray)
                }
            }
        }
        .navigationTitle("Detalii rezervare")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await vm.loadBookingDetail(id: bookingId)
        }
        .alert("Anuleaza rezervarea?", isPresented: $showCancelAlert) {
            Button("Da, anuleaza", role: .destructive) {
                Task {
                    let _ = await vm.cancelBooking(id: bookingId, reason: "Anulat de client")
                    await vm.loadBookingDetail(id: bookingId)
                }
            }
            Button("Nu", role: .cancel) {}
        } message: {
            Text("Esti sigur ca vrei sa anulezi aceasta rezervare?")
        }
        .sheet(isPresented: $showReviewSheet) {
            ReviewView(bookingId: bookingId)
        }
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

// MARK: - Detail Section

/// A reusable card section used in the booking detail view.
struct DetailSection<Content: View>: View {

    let title: String
    let icon: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .foregroundColor(AppTheme.primary)
                Text(title)
                    .font(.headline)
                    .foregroundColor(AppTheme.textPrimary)
            }

            VStack(alignment: .leading, spacing: 8) {
                content
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .fill(.white)
                .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
        )
    }
}

// MARK: - Detail Row

/// A label-value row used within ``DetailSection``.
struct DetailRow: View {

    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundColor(AppTheme.textSecondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(AppTheme.textPrimary)
        }
    }
}
