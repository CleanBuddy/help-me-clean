import SwiftUI

/// A form for submitting a star rating and optional comment for a completed booking.
struct ReviewView: View {

    /// The ID of the booking being reviewed.
    let bookingId: String

    @State private var rating = 0
    @State private var comment = ""
    @State private var isSubmitting = false
    @State private var error: String?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("Cum a fost experienta ta?")
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(AppTheme.textPrimary)

                // Star Rating
                HStack(spacing: 12) {
                    ForEach(1...5, id: \.self) { star in
                        Button {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                rating = star
                            }
                        } label: {
                            Image(systemName: star <= rating ? "star.fill" : "star")
                                .font(.system(size: 36))
                                .foregroundColor(
                                    star <= rating ? AppTheme.accent : Color.gray.opacity(0.3)
                                )
                        }
                    }
                }
                .padding(.vertical, 8)

                // Rating description
                if rating > 0 {
                    Text(ratingDescription)
                        .font(.subheadline)
                        .foregroundColor(AppTheme.textSecondary)
                }

                // Comment
                VStack(alignment: .leading, spacing: 6) {
                    Text("Comentariu (optional)")
                        .font(.subheadline)
                        .foregroundColor(AppTheme.textSecondary)

                    TextField("Spune-ne mai multe...", text: $comment, axis: .vertical)
                        .lineLimit(4...8)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                }

                if let error = error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(AppTheme.danger)
                }

                Spacer()

                // Submit Button
                Button {
                    submitReview()
                } label: {
                    HStack(spacing: 8) {
                        if isSubmitting {
                            ProgressView()
                                .tint(.white)
                                .scaleEffect(0.9)
                        }
                        Text(isSubmitting ? "Se trimite..." : "Trimite recenzia")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(rating > 0 ? AppTheme.primary : Color.gray.opacity(0.3))
                    .foregroundColor(.white)
                    .cornerRadius(AppTheme.cornerRadius)
                }
                .disabled(rating == 0 || isSubmitting)
            }
            .padding(24)
            .background(AppTheme.background)
            .navigationTitle("Recenzie")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Anuleaza") {
                        dismiss()
                    }
                    .foregroundColor(AppTheme.textSecondary)
                }
            }
        }
    }

    // MARK: - Helpers

    /// A descriptive label for the selected rating.
    private var ratingDescription: String {
        switch rating {
        case 1: return "Foarte slab"
        case 2: return "Slab"
        case 3: return "Acceptabil"
        case 4: return "Bun"
        case 5: return "Excelent"
        default: return ""
        }
    }

    /// Submits the review via the GraphQL API.
    private func submitReview() {
        guard rating > 0 else { return }

        isSubmitting = true
        error = nil

        var variables: [String: Any] = [
            "bookingId": bookingId,
            "rating": rating,
        ]

        let trimmedComment = comment.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmedComment.isEmpty {
            variables["comment"] = trimmedComment
        }

        Task {
            do {
                let _: SubmitReviewResponse = try await GraphQLClient.shared.execute(
                    query: GQL.submitReview,
                    variables: variables
                )
                dismiss()
            } catch {
                self.error = "Nu s-a putut trimite recenzia. Incearca din nou."
                isSubmitting = false
            }
        }
    }
}
