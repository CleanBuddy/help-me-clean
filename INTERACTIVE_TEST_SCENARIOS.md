# Interactive Test Scenarios for Claude Code

This document defines multi-user flow scenarios that Claude can follow step-by-step
using Playwright MCP to interactively test the running HelpMeClean.ro applications.

## Prerequisites

Before running any scenario, ensure all services are running:

```bash
# Terminal 1: Database
docker-compose up -d postgres

# Terminal 2: Backend
cd backend && make migrate-up && make run    # http://localhost:8080

# Terminal 3: Web apps
cd web && npm run dev                         # :3000 :3001 :3002
```

## Authentication Methods

### Google Auth (Primary)
Uses real Google OAuth via `@react-oauth/google`. Requires a Google account.
The persistent browser profile (`--user-data-dir`) saves the Google session.

**First-time setup:** Claude clicks "Sign in with Google" → user manually
authenticates in the popup → session is saved for future runs.

### Dev Mode (Fallback)
Available in development builds only. No Google account needed.

1. Navigate to `/autentificare`
2. Click "Foloseste Dev Mode" toggle at bottom of the card
3. Fill the "Adresa de email (Dev Mode)" field
4. Click "Conecteaza-te (Dev)" button

**Dev auth users:**

| Role | Email | App |
|------|-------|-----|
| CLIENT | `test-e2e@helpmeclean.ro` | client-web (:3000) |
| COMPANY_ADMIN | `company-admin@helpmeclean.ro` | company-dashboard (:3001) |
| GLOBAL_ADMIN | `admin@helpmeclean.ro` | admin-dashboard (:3002) |
| CLEANER | `cleaner@helpmeclean.ro` | (via API) |

---

## Scenario 0: Google Auth Verification

**Goal:** Verify Google OAuth login works for all user types.

### 0.1 Client Login (port 3000)

1. Navigate to `http://localhost:3000/autentificare`
2. **Verify:** Page shows heading "Autentificare"
3. **Verify:** Google Sign-In button is visible (320px wide, rectangular)
4. **Verify:** "Foloseste Dev Mode" toggle is visible at bottom
5. Click the Google Sign-In button
6. User completes Google authentication in popup
7. **Verify:** Redirected away from `/autentificare`
8. **Verify:** `localStorage.token` is set
9. **Screenshot:** Logged-in home page showing user name in header
10. Test logout (find logout button/menu) → verify return to login page
11. Re-login → verify One Tap auto-authenticates

### 0.2 Company Admin Login (port 3001)

1. Navigate to `http://localhost:3001/autentificare`
2. **Verify:** Page shows heading "Company Dashboard"
3. Click the Google Sign-In button
4. User completes Google authentication
5. **Verify:** Redirected to company dashboard
6. **Verify:** User role shows COMPANY_ADMIN in profile/settings
7. **Screenshot:** Company dashboard logged-in state

### 0.3 Global Admin Login (port 3002)

1. Navigate to `http://localhost:3002/autentificare`
2. **Verify:** Page shows heading "Admin Panel"
3. Click the Google Sign-In button
4. User completes Google authentication
5. **Verify:** Redirected to admin dashboard
6. **Verify:** User role shows GLOBAL_ADMIN in profile/settings
7. **Screenshot:** Admin dashboard logged-in state

### 0.4 Dev Mode Verification

For each app (:3000, :3001, :3002):
1. Navigate to `/autentificare`
2. Click "Foloseste Dev Mode" toggle
3. **Verify:** Email input and "Conecteaza-te (Dev)" button appear
4. Fill email with the appropriate dev user
5. Click "Conecteaza-te (Dev)"
6. **Verify:** Login succeeds, redirect occurs
7. Click "Foloseste Google Auth" toggle
8. **Verify:** Google button reappears
9. **Screenshot:** Both modes

---

## Scenario 1: Complete Booking Lifecycle

**Goal:** Test the full booking journey across all 3 web apps.
**Booking status flow:** `PENDING → ASSIGNED → CONFIRMED → IN_PROGRESS → COMPLETED`

### 1.1 Client Creates Booking (port 3000)

1. Login on `http://localhost:3000` (Google Auth or Dev Mode)
2. Navigate to `/rezervare`
3. **Verify:** Heading "Rezerva o curatenie" is visible

**Step 0 — Select Service:**
4. **Verify:** "Alege tipul de serviciu" text visible
5. Wait for service cards to load (`.grid .cursor-pointer`)
6. Click the first service card
7. **Verify:** "Continua" button becomes enabled
8. Click "Continua"

**Step 1 — Property Details:**
9. **Verify:** "Detalii proprietate" text visible
10. **Verify:** Property type select defaults to "Apartament"
11. **Verify:** Room and bathroom counters visible
12. Click "Continua"

**Step 2 — Schedule:**
13. **Verify:** "Alege data si ora" text visible
14. Fill date input with a future date (e.g., 5 days from now, format YYYY-MM-DD)
15. Select time "10:00" from the time dropdown
16. Click "Continua"

**Step 3 — Address:**
17. **Verify:** "Adresa de curatenie" text visible
18. Fill "Strada si numar" with "Str. Victoriei nr. 42"
19. Fill "Oras" with "Bucuresti"
20. Select "Bucuresti" from the county dropdown (last select on page)
21. Click "Continua"

**Step 4 — Summary:**
22. **Verify:** "Sumar si confirmare" text visible
23. **Verify:** Address, date, time, and property details shown correctly
24. **Verify:** "Estimare pret" section exists
25. If not logged in: fill "Nume complet", "Email", "Telefon" guest fields
26. Click "Confirma rezervarea"

**Success:**
27. **Verify:** "Rezervare confirmata!" text visible (wait up to 15s)
28. **Verify:** "Comanda ta a fost plasata cu succes." text visible
29. **Capture:** Reference code from `.font-mono` element → **save for later steps**
30. **Screenshot:** Success page with reference code

### 1.2 Company Admin Sees Booking (port 3001)

1. Login on `http://localhost:3001` (Google Auth or Dev Mode with `company-admin@helpmeclean.ro`)
2. Click "Comenzi" in navigation
3. **Verify:** URL is `/comenzi`
4. **Verify:** Heading "Comenzi" visible
5. Click "In asteptare" tab
6. **Verify:** Tab has active styling (`bg-primary` class)
7. Wait for bookings to load
8. **Verify:** The booking from step 1.1 appears (match by reference code or address)
9. **Screenshot:** Orders list showing the new booking
10. Click on the booking to view details
11. **Screenshot:** Booking detail page

### 1.3 Company Admin Assigns Cleaner (port 3001)

1. On the booking detail page from 1.2
2. Look for "Atribuie curatator" or assign cleaner button
3. Click it
4. Select a cleaner from the dropdown/list
5. Confirm assignment
6. **Verify:** Booking status changes to "ASSIGNED"
7. **Screenshot:** Updated booking with cleaner assigned

### 1.4 Admin Monitors Booking (port 3002)

1. Login on `http://localhost:3002` (Google Auth or Dev Mode with `admin@helpmeclean.ro`)
2. Click "Rezervari" in sidebar navigation
3. **Verify:** URL is `/rezervari`
4. Wait for bookings to load
5. **Verify:** The booking from step 1.1 appears
6. **Verify:** Status shows correctly (ASSIGNED or whatever current state is)
7. Click on the booking
8. **Screenshot:** Admin booking detail view
9. **Verify:** All booking details match what the client entered

### 1.5 Cross-App Data Verification

1. Compare screenshots from 1.1, 1.2, 1.4
2. **Verify:** Reference code matches across all views
3. **Verify:** Service type, address, and schedule are consistent
4. **Verify:** Status labels are appropriate for each user's perspective

---

## Scenario 2: Company Onboarding

**Goal:** Test the company application → admin approval → cleaner invitation flow.
**Company status flow:** `PENDING_REVIEW → APPROVED`

### 2.1 Company Applies to Join (port 3001)

1. Open a NEW browser context (fresh session, no existing login)
2. Navigate to `http://localhost:3001/autentificare`
3. Login with Google (new Google account) or Dev Mode with a unique email
4. Look for company registration/application page
5. Fill the application form:
   - Company Name: "Test Company E2E"
   - CUI: "RO12345678"
   - Company Type: "SRL"
   - Legal Representative: "Ion Popescu"
   - Contact Email: unique email
   - Contact Phone: "+40 700 000 001"
   - Address: "Str. Exemplu nr. 1"
   - City: "Bucuresti"
   - County: "Bucuresti"
   - Description: "Companie de curatenie test E2E"
6. Submit the application
7. **Verify:** Success message / confirmation shown
8. **Verify:** Company status is "PENDING_REVIEW"
9. **Screenshot:** Application submitted confirmation

### 2.2 Admin Reviews & Approves Company (port 3002)

1. Login on `http://localhost:3002` as admin
2. Click "Companii" in sidebar (`aside` element → link with name "Companii")
3. **Verify:** URL is `/companii`
4. Click "In asteptare" tab
5. **Verify:** "Test Company E2E" appears in the pending list
6. Click on the company to view details
7. **Screenshot:** Company application detail
8. **Verify:** All submitted data is displayed correctly
9. Click "Aproba" button
10. **Verify:** Company status changes to "APPROVED"
11. **Screenshot:** Approved company

### 2.3 Company Invites Cleaners (port 3001)

1. Login on `http://localhost:3001` as the company admin from 2.1
2. Navigate to `/echipa` (Team page)
3. Click "Invita curatator" button
4. Fill cleaner details:
   - Name: "Maria Ionescu"
   - Email: unique email
   - Phone: "+40 700 000 002"
5. Submit invitation
6. **Verify:** Cleaner appears in team list with status "INVITED"
7. **Screenshot:** Team page with invited cleaner

---

## Scenario 3: Guest Booking (No Auth)

**Goal:** Verify the complete booking flow works without any authentication.

### 3.1 Create Guest Booking (port 3000)

1. Open a NEW browser context (no login session)
2. Navigate to `http://localhost:3000/rezervare`
3. **Verify:** Heading "Rezerva o curatenie" visible

**Follow same booking wizard as Scenario 1.1, Steps 4-21**

**Step 4 — Summary (Guest-specific):**
4. **Verify:** "Sumar si confirmare" text visible
5. **Verify:** "Datele tale de contact" section visible (guest contact fields)
6. Fill "Nume complet" with "Guest User E2E"
7. Fill "Email" with a unique email (e.g., `e2e-{timestamp}@helpmeclean.ro`)
8. Fill "Telefon" with "+40 712 345 678"
9. Click "Confirma rezervarea"

**Success:**
10. **Verify:** "Rezervare confirmata!" text visible
11. **Verify:** "Comanda ta a fost plasata cu succes." text visible
12. **Capture:** Reference code from `.font-mono` element
13. **Screenshot:** Guest booking success page

### 3.2 Admin Verifies Guest Booking (port 3002)

1. Login on `http://localhost:3002` as admin
2. Navigate to `/rezervari`
3. Wait for bookings to load
4. **Verify:** Guest booking appears (match by reference code)
5. Click on the booking
6. **Verify:** Guest contact info displayed (name, email, phone)
7. **Screenshot:** Admin view of guest booking

---

## Quick Reference: UI Labels (Romanian)

| English | Romanian (UI Label) |
|---------|-------------------|
| Login | Autentificare |
| Sign in | Conecteaza-te |
| Continue | Continua |
| Back | Inapoi |
| Confirm booking | Confirma rezervarea |
| Booking confirmed | Rezervare confirmata! |
| Orders | Comenzi |
| Pending | In asteptare |
| Confirmed | Confirmate |
| In progress | In desfasurare |
| Completed | Finalizate |
| Cancelled | Anulate |
| Companies | Companii |
| Approved | Aprobate |
| Team | Echipa |
| Invite cleaner | Invita curatator |
| Approve | Aproba |
| Bookings | Rezervari |
| Use Dev Mode | Foloseste Dev Mode |
| Use Google Auth | Foloseste Google Auth |
| Select service | Alege tipul de serviciu |
| Property details | Detalii proprietate |
| Choose date and time | Alege data si ora |
| Cleaning address | Adresa de curatenie |
| Summary and confirmation | Sumar si confirmare |
| Your contact details | Datele tale de contact |
| Street and number | Strada si numar |
| City | Oras |
| Price estimate | Estimare pret |
| Back to home | Inapoi la pagina principala |
