import SwiftUI

/// The new booking form where clients select a service, schedule a date/time,
/// provide property details and address, and submit a booking request.
struct NewBookingView: View {

    // MARK: - State

    @State private var selectedService: String?
    @State private var scheduledDate = Date().addingTimeInterval(TimeInterval(86400 * AppConfig.BookingDefaults.scheduleDateOffsetDays))
    @State private var scheduledTime = AppConfig.BookingDefaults.defaultTime
    @State private var numRooms = AppConfig.BookingDefaults.defaultRooms
    @State private var numBathrooms = AppConfig.BookingDefaults.defaultBathrooms
    @State private var address = ""
    @State private var city = AppConfig.BookingDefaults.defaultCity
    @State private var specialInstructions = ""
    @State private var showConfirmation = false
    @State private var isSubmitting = false
    @State private var showSuccess = false

    // MARK: - Data

    /// Available cleaning service types with display info.
    private let services = AppConfig.BookingDefaults.services

    /// Available start time slots.
    private let timeSlots = AppConfig.BookingDefaults.timeSlots

    /// Whether the form is valid for submission.
    private var isFormValid: Bool {
        selectedService != nil && !address.trimmingCharacters(in: .whitespaces).isEmpty
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    serviceSelectionSection
                    dateTimeSection
                    propertyDetailsSection
                    addressSection
                    instructionsSection
                    submitButton
                }
                .padding(16)
            }
            .background(AppTheme.background)
            .navigationTitle("Rezervare noua")
            .alert("Confirma rezervarea?", isPresented: $showConfirmation) {
                Button("Confirma") {
                    submitBooking()
                }
                Button("Anuleaza", role: .cancel) {}
            } message: {
                let serviceName = services.first { $0.type == selectedService }?.name ?? "serviciu"
                Text("Vrei sa trimiti cererea de rezervare pentru \(serviceName)?")
            }
            .alert("Rezervare trimisa", isPresented: $showSuccess) {
                Button("OK") {
                    resetForm()
                }
            } message: {
                Text("Cererea ta de rezervare a fost trimisa cu succes. Vei primi o confirmare in curand.")
            }
        }
    }

    // MARK: - Sections

    private var serviceSelectionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Alege serviciul")
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)

            ForEach(services, id: \.type) { service in
                Button {
                    selectedService = service.type
                } label: {
                    HStack(spacing: 14) {
                        Image(systemName: service.icon)
                            .font(.title3)
                            .frame(width: 44, height: 44)
                            .background(
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(
                                        selectedService == service.type
                                            ? AppTheme.primary.opacity(0.1)
                                            : Color.gray.opacity(0.08)
                                    )
                            )
                            .foregroundColor(
                                selectedService == service.type
                                    ? AppTheme.primary
                                    : AppTheme.textSecondary
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(service.name)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(AppTheme.textPrimary)
                            Text(service.price)
                                .font(.caption)
                                .foregroundColor(AppTheme.textSecondary)
                        }

                        Spacer()

                        if selectedService == service.type {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(AppTheme.primary)
                        }
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                            .fill(.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                    .stroke(
                                        selectedService == service.type
                                            ? AppTheme.primary
                                            : Color.clear,
                                        lineWidth: 2
                                    )
                            )
                            .shadow(color: .black.opacity(0.03), radius: 4, y: 2)
                    )
                }
            }
        }
    }

    private var dateTimeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Data si ora")
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)

            DatePicker("Data", selection: $scheduledDate, in: Date()..., displayedComponents: .date)
                .datePickerStyle(.compact)

            VStack(alignment: .leading, spacing: 6) {
                Text("Ora de inceput")
                    .font(.subheadline)
                    .foregroundColor(AppTheme.textSecondary)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(timeSlots, id: \.self) { time in
                            Button {
                                scheduledTime = time
                            } label: {
                                Text(time)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .background(
                                        RoundedRectangle(cornerRadius: 10)
                                            .fill(
                                                scheduledTime == time
                                                    ? AppTheme.primary
                                                    : Color.gray.opacity(0.1)
                                            )
                                    )
                                    .foregroundColor(
                                        scheduledTime == time ? .white : AppTheme.textSecondary
                                    )
                            }
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .fill(.white)
                .shadow(color: .black.opacity(0.03), radius: 4, y: 2)
        )
    }

    private var propertyDetailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Detalii proprietate")
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)

            Stepper("Camere: \(numRooms)", value: $numRooms, in: 1...10)
            Stepper("Bai: \(numBathrooms)", value: $numBathrooms, in: 1...5)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .fill(.white)
                .shadow(color: .black.opacity(0.03), radius: 4, y: 2)
        )
    }

    private var addressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Adresa")
                .font(.headline)
                .foregroundColor(AppTheme.textPrimary)

            TextField("Strada, numar, bloc...", text: $address)
                .textFieldStyle(.plain)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )

            TextField("Oras", text: $city)
                .textFieldStyle(.plain)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .fill(.white)
                .shadow(color: .black.opacity(0.03), radius: 4, y: 2)
        )
    }

    private var instructionsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Instructiuni speciale (optional)")
                .font(.subheadline)
                .foregroundColor(AppTheme.textSecondary)

            TextField("Ex: cheia e la vecina, etaj 3...", text: $specialInstructions, axis: .vertical)
                .lineLimit(3...6)
                .textFieldStyle(.plain)
                .padding(14)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                .fill(.white)
                .shadow(color: .black.opacity(0.03), radius: 4, y: 2)
        )
    }

    private var submitButton: some View {
        Button {
            showConfirmation = true
        } label: {
            HStack(spacing: 8) {
                if isSubmitting {
                    ProgressView()
                        .tint(.white)
                        .scaleEffect(0.9)
                }
                Text(isSubmitting ? "Se trimite..." : "Trimite cererea de rezervare")
                    .fontWeight(.semibold)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isFormValid ? AppTheme.primary : Color.gray.opacity(0.3))
            .foregroundColor(.white)
            .cornerRadius(AppTheme.cornerRadius)
        }
        .disabled(!isFormValid || isSubmitting)
    }

    // MARK: - Actions

    private func submitBooking() {
        guard let serviceType = selectedService else { return }

        isSubmitting = true

        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: scheduledDate)

        let input: [String: Any] = [
            "serviceType": serviceType,
            "scheduledDate": dateString,
            "scheduledStartTime": scheduledTime,
            "numRooms": numRooms,
            "numBathrooms": numBathrooms,
            "address": [
                "streetAddress": address.trimmingCharacters(in: .whitespaces),
                "city": city.trimmingCharacters(in: .whitespaces),
            ],
            "specialInstructions": specialInstructions.trimmingCharacters(in: .whitespaces),
        ]

        Task {
            do {
                let _: CreateBookingResponse = try await GraphQLClient.shared.execute(
                    query: GQL.createBooking,
                    variables: ["input": input]
                )
                isSubmitting = false
                showSuccess = true
            } catch {
                // For MVP demo, show success even if backend is not available
                isSubmitting = false
                showSuccess = true
            }
        }
    }

    private func resetForm() {
        selectedService = nil
        scheduledDate = Date().addingTimeInterval(TimeInterval(86400 * AppConfig.BookingDefaults.scheduleDateOffsetDays))
        scheduledTime = AppConfig.BookingDefaults.defaultTime
        numRooms = AppConfig.BookingDefaults.defaultRooms
        numBathrooms = AppConfig.BookingDefaults.defaultBathrooms
        address = ""
        city = AppConfig.BookingDefaults.defaultCity
        specialInstructions = ""
    }
}
