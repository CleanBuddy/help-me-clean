import Foundation

/// Centralized configuration for the HelpMeClean iOS app.
///
/// All environment-specific and tunable constants live here so they can be
/// updated in a single place without hunting through the codebase.
enum AppConfig {

    // MARK: - API

    enum API {
        static let endpoint = URL(string: "http://localhost:8080/query")!
        static let timeoutRequest: TimeInterval = 30
        static let timeoutResource: TimeInterval = 60
    }

    // MARK: - Auth

    enum Auth {
        static let tokenStorageKey = "authToken"
        static let devTokenPrefix = "dev_"
        static let defaultRole = "CLIENT"
        static let googleClientID = "794597417467-fhv7oset50pld7mlnd0ttumpr1spm8gi.apps.googleusercontent.com"
        static let useDevAuth = true // Set to false for production
    }

    // MARK: - Booking Defaults

    enum BookingDefaults {
        static let defaultCity = "Bucuresti"
        static let defaultRooms = 2
        static let defaultBathrooms = 1
        static let defaultTime = "10:00"
        static let scheduleDateOffsetDays = 3
        static let paginationLimit = 50

        static let timeSlots = [
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00",
        ]

        static let services: [(type: String, name: String, icon: String, price: String)] = [
            ("STANDARD_CLEANING", "Curatenie Standard", "sparkles", "De la 50 RON/ora"),
            ("DEEP_CLEANING", "Curatenie Generala", "sparkle", "De la 80 RON/ora"),
            ("MOVE_IN_OUT_CLEANING", "Curatenie Mutare", "box.truck", "De la 90 RON/ora"),
            ("OFFICE_CLEANING", "Curatenie Birou", "building.2", "De la 60 RON/ora"),
            ("WINDOW_CLEANING", "Spalat Geamuri", "window.shade.open", "De la 40 RON/ora"),
        ]
    }
}
