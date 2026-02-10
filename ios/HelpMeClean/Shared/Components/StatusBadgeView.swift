import SwiftUI

/// A colored badge that displays the human-readable name for a booking status.
///
/// Usage:
/// ```swift
/// StatusBadgeView(status: "CONFIRMED")
/// ```
struct StatusBadgeView: View {

    /// The raw booking status string (e.g. "PENDING", "COMPLETED").
    let status: String

    private var config: (text: String, bgColor: Color, textColor: Color) {
        switch status {
        case "PENDING":
            return ("In asteptare", Color.orange.opacity(0.15), Color.orange)
        case "ASSIGNED":
            return ("Asignat", Color.blue.opacity(0.15), Color.blue)
        case "CONFIRMED":
            return ("Confirmat", Color.blue.opacity(0.15), Color.blue)
        case "IN_PROGRESS":
            return ("In desfasurare", AppTheme.primary.opacity(0.15), AppTheme.primary)
        case "COMPLETED":
            return ("Finalizat", AppTheme.secondary.opacity(0.15), AppTheme.secondary)
        case "CANCELLED_BY_CLIENT", "CANCELLED_BY_COMPANY", "CANCELLED_BY_ADMIN":
            return ("Anulat", AppTheme.danger.opacity(0.15), AppTheme.danger)
        default:
            return (status, Color.gray.opacity(0.15), Color.gray)
        }
    }

    var body: some View {
        Text(config.text)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(config.bgColor)
            )
            .foregroundColor(config.textColor)
    }
}

#Preview {
    VStack(spacing: 8) {
        StatusBadgeView(status: "PENDING")
        StatusBadgeView(status: "CONFIRMED")
        StatusBadgeView(status: "IN_PROGRESS")
        StatusBadgeView(status: "COMPLETED")
        StatusBadgeView(status: "CANCELLED_BY_CLIENT")
    }
    .padding()
}
