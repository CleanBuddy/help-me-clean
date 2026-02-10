import { gql } from '@apollo/client';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const SIGN_IN_WITH_GOOGLE = gql`
  mutation SignInWithGoogle($idToken: String!, $role: UserRole!) {
    signInWithGoogle(idToken: $idToken, role: $role) {
      token
      user {
        id
        email
        fullName
        role
        status
        phone
        avatarUrl
        preferredLanguage
        createdAt
      }
      isNewUser
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      token
      user {
        id
        email
        fullName
        role
        status
      }
      isNewUser
    }
  }
`;

// ─── User ────────────────────────────────────────────────────────────────────

export const ME = gql`
  query Me {
    me {
      id
      email
      fullName
      phone
      avatarUrl
      role
      status
      preferredLanguage
      createdAt
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      fullName
      phone
      avatarUrl
      role
      status
      preferredLanguage
      createdAt
    }
  }
`;

// ─── Services ────────────────────────────────────────────────────────────────

export const AVAILABLE_SERVICES = gql`
  query AvailableServices {
    availableServices {
      id
      serviceType
      nameRo
      nameEn
      descriptionRo
      descriptionEn
      basePricePerHour
      minHours
      icon
    }
  }
`;

export const AVAILABLE_EXTRAS = gql`
  query AvailableExtras {
    availableExtras {
      id
      nameRo
      nameEn
      price
      icon
    }
  }
`;

export const ESTIMATE_PRICE = gql`
  query EstimatePrice($input: PriceEstimateInput!) {
    estimatePrice(input: $input) {
      hourlyRate
      estimatedHours
      subtotal
      extras {
        extra {
          nameRo
          price
        }
        quantity
        lineTotal
      }
      total
    }
  }
`;

// ─── Client Bookings ────────────────────────────────────────────────────────

export const CREATE_BOOKING_REQUEST = gql`
  mutation CreateBookingRequest($input: CreateBookingInput!) {
    createBookingRequest(input: $input) {
      id
      referenceCode
      status
      estimatedTotal
    }
  }
`;

export const MY_BOOKINGS = gql`
  query MyBookings($status: BookingStatus, $first: Int, $after: String) {
    myBookings(status: $status, first: $first, after: $after) {
      edges {
        id
        referenceCode
        serviceType
        serviceName
        scheduledDate
        scheduledStartTime
        estimatedTotal
        status
        createdAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const CLIENT_BOOKING_DETAIL = gql`
  query ClientBookingDetail($id: ID!) {
    booking(id: $id) {
      id
      referenceCode
      serviceType
      serviceName
      scheduledDate
      scheduledStartTime
      estimatedDurationHours
      estimatedTotal
      finalTotal
      status
      specialInstructions
      propertyType
      numRooms
      numBathrooms
      areaSqm
      hasPets
      paymentStatus
      paidAt
      createdAt
      address {
        streetAddress
        city
        county
        floor
        apartment
      }
      company {
        id
        companyName
        contactPhone
      }
      client {
        id
        fullName
        email
        phone
      }
      cleaner {
        id
        fullName
        phone
      }
      review {
        id
        rating
        comment
        createdAt
      }
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($id: ID!, $reason: String) {
    cancelBooking(id: $id, reason: $reason) {
      id
      referenceCode
      status
    }
  }
`;

export const PAY_FOR_BOOKING = gql`
  mutation PayForBooking($id: ID!) {
    payForBooking(id: $id) {
      id
      paymentStatus
      paidAt
    }
  }
`;

export const SUBMIT_REVIEW = gql`
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      id
      rating
      comment
      createdAt
    }
  }
`;

// ─── Client Addresses & Payment ─────────────────────────────────────────────

export const MY_ADDRESSES = gql`
  query MyAddresses {
    myAddresses {
      id
      label
      streetAddress
      city
      county
      postalCode
      floor
      apartment
      coordinates {
        latitude
        longitude
      }
      isDefault
    }
  }
`;

export const ADD_ADDRESS = gql`
  mutation AddAddress($input: AddAddressInput!) {
    addAddress(input: $input) {
      id
      label
      streetAddress
      city
      county
      postalCode
      floor
      apartment
      coordinates {
        latitude
        longitude
      }
      isDefault
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      id
      label
      streetAddress
      city
      county
      postalCode
      floor
      apartment
      coordinates {
        latitude
        longitude
      }
      isDefault
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

export const SET_DEFAULT_ADDRESS = gql`
  mutation SetDefaultAddress($id: ID!) {
    setDefaultAddress(id: $id) {
      id
      isDefault
    }
  }
`;

export const MY_PAYMENT_METHODS = gql`
  query MyPaymentMethods {
    myPaymentMethods {
      id
      cardLastFour
      cardBrand
      isDefault
    }
  }
`;

// ─── Chat ────────────────────────────────────────────────────────────────────

export const MY_CHAT_ROOMS = gql`
  query MyChatRooms {
    myChatRooms {
      id
      roomType
      lastMessage {
        id
        content
        messageType
        isRead
        createdAt
        sender { id fullName }
      }
      participants {
        user { id fullName avatarUrl }
        joinedAt
      }
      createdAt
    }
  }
`;

export const CHAT_ROOM_DETAIL = gql`
  query ChatRoomDetail($id: ID!) {
    chatRoom(id: $id) {
      id
      roomType
      participants {
        user { id fullName avatarUrl role }
        joinedAt
      }
      messages {
        edges {
          id
          content
          messageType
          isRead
          createdAt
          sender { id fullName avatarUrl }
        }
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($roomId: ID!, $content: String!) {
    sendMessage(roomId: $roomId, content: $content) {
      id
      content
      messageType
      isRead
      createdAt
      sender { id fullName }
    }
  }
`;

export const OPEN_BOOKING_CHAT = gql`
  mutation OpenBookingChat($bookingId: ID!) {
    openBookingChat(bookingId: $bookingId) {
      id
      roomType
    }
  }
`;

export const MARK_MESSAGES_READ = gql`
  mutation MarkMessagesRead($roomId: ID!) {
    markMessagesAsRead(roomId: $roomId)
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription MessageSent($roomId: ID!) {
    messageSent(roomId: $roomId) {
      id
      content
      messageType
      isRead
      createdAt
      sender { id fullName }
    }
  }
`;

export const ALL_CHAT_ROOMS = gql`
  query AllChatRooms {
    allChatRooms {
      id
      roomType
      createdAt
      participants {
        user { id fullName avatarUrl }
        joinedAt
      }
      lastMessage {
        id
        content
        messageType
        createdAt
        sender { id fullName }
      }
    }
  }
`;

export const ALL_USERS = gql`
  query AllUsers {
    allUsers {
      id
      fullName
      email
      role
      status
      avatarUrl
    }
  }
`;

export const CREATE_ADMIN_CHAT_ROOM = gql`
  mutation CreateAdminChatRoom($userIds: [ID!]!) {
    createAdminChatRoom(userIds: $userIds) {
      id
      roomType
    }
  }
`;

export const COMPANY_CHAT_ROOMS = gql`
  query CompanyChatRooms {
    companyChatRooms {
      id
      roomType
      createdAt
      participants {
        user { id fullName avatarUrl }
        joinedAt
      }
      lastMessage {
        id
        content
        messageType
        createdAt
        sender { id fullName }
      }
    }
  }
`;

// ─── Company ────────────────────────────────────────────────────────────────

export const MY_COMPANY = gql`
  query MyCompany {
    myCompany {
      id
      companyName
      cui
      companyType
      legalRepresentative
      contactEmail
      contactPhone
      address
      city
      county
      description
      logoUrl
      status
      rejectionReason
      maxServiceRadiusKm
      ratingAvg
      totalJobsCompleted
      createdAt
    }
  }
`;

export const APPLY_AS_COMPANY = gql`
  mutation ApplyAsCompany($input: CompanyApplicationInput!) {
    applyAsCompany(input: $input) {
      company {
        id
        companyName
        status
      }
      claimToken
    }
  }
`;

export const CLAIM_COMPANY = gql`
  mutation ClaimCompany($claimToken: String!) {
    claimCompany(claimToken: $claimToken) {
      id
      companyName
      status
    }
  }
`;

export const UPDATE_COMPANY_PROFILE = gql`
  mutation UpdateCompanyProfile($input: UpdateCompanyInput!) {
    updateCompanyProfile(input: $input) {
      id
      companyName
      description
      contactPhone
      maxServiceRadiusKm
    }
  }
`;

// ─── Cleaners ────────────────────────────────────────────────────────────────

export const MY_CLEANERS = gql`
  query MyCleaners {
    myCleaners {
      id
      userId
      fullName
      phone
      email
      avatarUrl
      status
      isCompanyAdmin
      inviteToken
      ratingAvg
      totalJobsCompleted
      createdAt
    }
  }
`;

export const INVITE_CLEANER = gql`
  mutation InviteCleaner($input: InviteCleanerInput!) {
    inviteCleaner(input: $input) {
      id
      fullName
      email
      status
      inviteToken
    }
  }
`;

export const INVITE_SELF_AS_CLEANER = gql`
  mutation InviteSelfAsCleaner {
    inviteSelfAsCleaner {
      id
      fullName
      status
      isCompanyAdmin
    }
  }
`;

export const UPDATE_CLEANER_STATUS = gql`
  mutation UpdateCleanerStatus($id: ID!, $status: CleanerStatus!) {
    updateCleanerStatus(id: $id, status: $status) {
      id
      fullName
      status
    }
  }
`;

// ─── Company Bookings ────────────────────────────────────────────────────────

export const COMPANY_BOOKINGS = gql`
  query CompanyBookings($status: BookingStatus, $first: Int, $after: String) {
    companyBookings(status: $status, first: $first, after: $after) {
      edges {
        id
        referenceCode
        serviceType
        serviceName
        scheduledDate
        scheduledStartTime
        estimatedTotal
        status
        createdAt
        client {
          id
          fullName
          phone
        }
        cleaner {
          id
          fullName
        }
        address {
          streetAddress
          city
          county
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const COMPANY_BOOKING_DETAIL = gql`
  query CompanyBookingDetail($id: ID!) {
    booking(id: $id) {
      id
      referenceCode
      serviceType
      serviceName
      scheduledDate
      scheduledStartTime
      estimatedDurationHours
      estimatedTotal
      finalTotal
      status
      specialInstructions
      numRooms
      numBathrooms
      areaSqm
      hasPets
      paymentStatus
      createdAt
      startedAt
      completedAt
      cancelledAt
      cancellationReason
      client {
        id
        fullName
        email
        phone
      }
      address {
        streetAddress
        city
        county
        floor
        apartment
      }
      cleaner {
        id
        fullName
        phone
      }
    }
  }
`;

export const ASSIGN_CLEANER = gql`
  mutation AssignCleaner($bookingId: ID!, $cleanerId: ID!) {
    assignCleanerToBooking(bookingId: $bookingId, cleanerId: $cleanerId) {
      id
      status
      cleaner {
        id
        fullName
      }
    }
  }
`;

// ─── Admin Stats ─────────────────────────────────────────────────────────────

export const PLATFORM_STATS = gql`
  query PlatformStats {
    platformStats {
      totalClients
      totalCompanies
      totalCleaners
      totalBookings
      totalRevenue
      platformCommissionTotal
      averageRating
      bookingsThisMonth
      revenueThisMonth
      newClientsThisMonth
      newCompaniesThisMonth
    }
  }
`;

export const BOOKINGS_BY_STATUS = gql`
  query BookingsByStatus {
    bookingsByStatus {
      status
      count
    }
  }
`;

export const REVENUE_BY_MONTH = gql`
  query RevenueByMonth($months: Int) {
    revenueByMonth(months: $months) {
      month
      revenue
      commission
      bookingCount
    }
  }
`;

export const COMPANY_PERFORMANCE = gql`
  query CompanyPerformance($first: Int) {
    companyPerformance(first: $first) {
      company {
        id
        companyName
        cui
        status
        ratingAvg
        totalJobsCompleted
        city
        county
      }
      totalBookings
      totalRevenue
      averageRating
      completionRate
    }
  }
`;

export const PENDING_COMPANY_APPLICATIONS = gql`
  query PendingCompanyApplications {
    pendingCompanyApplications {
      id
      companyName
      cui
      companyType
      legalRepresentative
      contactEmail
      contactPhone
      address
      city
      county
      description
      status
      createdAt
    }
  }
`;

// ─── Admin Companies ─────────────────────────────────────────────────────────

export const COMPANIES = gql`
  query Companies($status: CompanyStatus, $first: Int, $after: String) {
    companies(status: $status, first: $first, after: $after) {
      edges {
        id
        companyName
        cui
        companyType
        status
        ratingAvg
        totalJobsCompleted
        contactEmail
        contactPhone
        city
        county
        createdAt
      }
      totalCount
    }
  }
`;

export const COMPANY = gql`
  query Company($id: ID!) {
    company(id: $id) {
      id
      companyName
      cui
      companyType
      legalRepresentative
      contactEmail
      contactPhone
      address
      city
      county
      description
      logoUrl
      status
      rejectionReason
      maxServiceRadiusKm
      ratingAvg
      totalJobsCompleted
      createdAt
    }
  }
`;

// ─── Admin Bookings ──────────────────────────────────────────────────────────

export const ALL_BOOKINGS = gql`
  query AllBookings($status: BookingStatus, $companyId: ID, $first: Int, $after: String) {
    allBookings(status: $status, companyId: $companyId, first: $first, after: $after) {
      edges {
        id
        referenceCode
        serviceType
        serviceName
        scheduledDate
        scheduledStartTime
        estimatedDurationHours
        status
        estimatedTotal
        paymentStatus
        createdAt
        client {
          id
          fullName
          email
        }
        company {
          id
          companyName
        }
      }
      totalCount
    }
  }
`;

export const ADMIN_BOOKING_DETAIL = gql`
  query AdminBookingDetail($id: ID!) {
    booking(id: $id) {
      id
      referenceCode
      serviceType
      serviceName
      scheduledDate
      scheduledStartTime
      estimatedDurationHours
      propertyType
      numRooms
      numBathrooms
      areaSqm
      hasPets
      specialInstructions
      hourlyRate
      estimatedTotal
      finalTotal
      platformCommissionPct
      status
      paymentStatus
      startedAt
      completedAt
      cancelledAt
      cancellationReason
      createdAt
      client {
        id
        fullName
        email
        phone
      }
      company {
        id
        companyName
        contactEmail
      }
      cleaner {
        id
        fullName
        phone
      }
      address {
        streetAddress
        city
        county
        postalCode
        floor
        apartment
      }
    }
  }
`;

export const ALL_CLEANERS = gql`
  query AllCleaners {
    allCleaners {
      id
      fullName
      email
      phone
      status
      ratingAvg
      totalJobsCompleted
      company {
        id
        companyName
      }
    }
  }
`;

// ─── Admin Mutations ─────────────────────────────────────────────────────────

export const APPROVE_COMPANY = gql`
  mutation ApproveCompany($id: ID!) {
    approveCompany(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_COMPANY = gql`
  mutation RejectCompany($id: ID!, $reason: String!) {
    rejectCompany(id: $id, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

export const SUSPEND_COMPANY = gql`
  mutation SuspendCompany($id: ID!, $reason: String!) {
    suspendCompany(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const ADMIN_CANCEL_BOOKING = gql`
  mutation AdminCancelBooking($id: ID!, $reason: String!) {
    adminCancelBooking(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($id: ID!, $reason: String!) {
    suspendUser(id: $id, reason: $reason) {
      id
      status
    }
  }
`;

export const REACTIVATE_USER = gql`
  mutation ReactivateUser($id: ID!) {
    reactivateUser(id: $id) {
      id
      status
    }
  }
`;

// ─── Admin CMS: Platform Settings ───────────────────────────────────────────

export const PLATFORM_SETTINGS = gql`
  query PlatformSettings {
    platformSettings {
      key
      value
      valueType
      description
      updatedAt
    }
  }
`;

export const UPDATE_PLATFORM_SETTING = gql`
  mutation UpdatePlatformSetting($key: String!, $value: String!) {
    updatePlatformSetting(key: $key, value: $value) {
      key
      value
      valueType
      description
      updatedAt
    }
  }
`;

// ─── Admin CMS: Service Management ──────────────────────────────────────────

export const ALL_SERVICES = gql`
  query AllServices {
    allServices {
      id
      serviceType
      nameRo
      nameEn
      basePricePerHour
      minHours
      icon
      isActive
    }
  }
`;

export const ALL_EXTRAS = gql`
  query AllExtras {
    allExtras {
      id
      nameRo
      nameEn
      price
      icon
      isActive
    }
  }
`;

export const UPDATE_SERVICE_DEFINITION = gql`
  mutation UpdateServiceDefinition($input: UpdateServiceDefinitionInput!) {
    updateServiceDefinition(input: $input) {
      id
      nameRo
      nameEn
      basePricePerHour
      minHours
      isActive
    }
  }
`;

export const CREATE_SERVICE_DEFINITION = gql`
  mutation CreateServiceDefinition($input: CreateServiceDefinitionInput!) {
    createServiceDefinition(input: $input) {
      id
      serviceType
      nameRo
      nameEn
      basePricePerHour
      minHours
      isActive
    }
  }
`;

export const UPDATE_SERVICE_EXTRA = gql`
  mutation UpdateServiceExtra($input: UpdateServiceExtraInput!) {
    updateServiceExtra(input: $input) {
      id
      nameRo
      nameEn
      price
      isActive
    }
  }
`;

export const CREATE_SERVICE_EXTRA = gql`
  mutation CreateServiceExtra($input: CreateServiceExtraInput!) {
    createServiceExtra(input: $input) {
      id
      nameRo
      nameEn
      price
      isActive
    }
  }
`;

// ─── Admin CMS: User Management ─────────────────────────────────────────────

export const SEARCH_USERS = gql`
  query SearchUsers($query: String, $role: UserRole, $status: UserStatus, $limit: Int, $offset: Int) {
    searchUsers(query: $query, role: $role, status: $status, limit: $limit, offset: $offset) {
      users {
        id
        fullName
        email
        phone
        avatarUrl
        role
        status
        createdAt
      }
      totalCount
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      fullName
      email
      phone
      avatarUrl
      role
      status
      preferredLanguage
      createdAt
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: ID!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const ADMIN_UPDATE_USER_PROFILE = gql`
  mutation AdminUpdateUserProfile($userId: ID!, $fullName: String!, $phone: String) {
    adminUpdateUserProfile(userId: $userId, fullName: $fullName, phone: $phone) {
      id
      fullName
      phone
    }
  }
`;

// ─── Admin CMS: Company Management ──────────────────────────────────────────

export const SEARCH_COMPANIES = gql`
  query SearchCompanies($query: String, $status: CompanyStatus, $limit: Int, $offset: Int) {
    searchCompanies(query: $query, status: $status, limit: $limit, offset: $offset) {
      edges {
        id
        companyName
        cui
        companyType
        status
        ratingAvg
        totalJobsCompleted
        contactEmail
        contactPhone
        city
        county
        createdAt
      }
      totalCount
    }
  }
`;

export const COMPANY_FINANCIAL_SUMMARY = gql`
  query CompanyFinancialSummary($companyId: ID!) {
    companyFinancialSummary(companyId: $companyId) {
      completedBookings
      totalRevenue
      totalCommission
      netPayout
    }
  }
`;

export const ADMIN_UPDATE_COMPANY_PROFILE = gql`
  mutation AdminUpdateCompanyProfile($input: AdminUpdateCompanyInput!) {
    adminUpdateCompanyProfile(input: $input) {
      id
      companyName
      cui
      address
      contactPhone
      contactEmail
    }
  }
`;

export const ADMIN_UPDATE_COMPANY_STATUS = gql`
  mutation AdminUpdateCompanyStatus($id: ID!, $status: CompanyStatus!) {
    adminUpdateCompanyStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

// ─── Admin CMS: Analytics ───────────────────────────────────────────────────

export const REVENUE_BY_DATE_RANGE = gql`
  query RevenueByDateRange($from: String!, $to: String!) {
    revenueByDateRange(from: $from, to: $to) {
      date
      bookingCount
      revenue
      commission
    }
  }
`;

export const REVENUE_BY_SERVICE_TYPE = gql`
  query RevenueByServiceType($from: String!, $to: String!) {
    revenueByServiceType(from: $from, to: $to) {
      serviceType
      bookingCount
      revenue
    }
  }
`;

export const TOP_COMPANIES_BY_REVENUE = gql`
  query TopCompaniesByRevenue($from: String!, $to: String!, $limit: Int) {
    topCompaniesByRevenue(from: $from, to: $to, limit: $limit) {
      id
      companyName
      bookingCount
      revenue
      commission
    }
  }
`;

export const PLATFORM_TOTALS = gql`
  query PlatformTotals {
    platformTotals {
      totalCompleted
      totalBookings
      totalRevenue
      totalCommission
      uniqueClients
      activeCompanies
    }
  }
`;

// ─── Admin CMS: Bookings Search ─────────────────────────────────────────────

export const SEARCH_BOOKINGS = gql`
  query SearchBookings($query: String, $status: BookingStatus, $limit: Int, $offset: Int) {
    searchBookings(query: $query, status: $status, limit: $limit, offset: $offset) {
      edges {
        id
        referenceCode
        serviceType
        serviceName
        scheduledDate
        scheduledStartTime
        estimatedTotal
        status
        paymentStatus
        createdAt
        client {
          id
          fullName
          email
        }
        company {
          id
          companyName
        }
      }
      totalCount
    }
  }
`;

// ─── Admin CMS: Review Moderation ───────────────────────────────────────────

export const ALL_REVIEWS = gql`
  query AllReviews($limit: Int, $offset: Int) {
    allReviews(limit: $limit, offset: $offset) {
      reviews {
        id
        rating
        comment
        reviewType
        createdAt
        booking {
          id
          referenceCode
        }
        reviewer {
          id
          fullName
        }
      }
      totalCount
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

// ─── Cleaner ──────────────────────────────────────────────────────────────────

export const TODAYS_JOBS = gql`
  query TodaysJobs {
    todaysJobs {
      id
      referenceCode
      serviceType
      serviceName
      scheduledDate
      scheduledStartTime
      estimatedDurationHours
      status
      address {
        streetAddress
        city
        floor
        apartment
      }
      client {
        fullName
        phone
      }
    }
  }
`;

export const MY_ASSIGNED_JOBS = gql`
  query MyAssignedJobs($status: BookingStatus) {
    myAssignedJobs(status: $status) {
      id
      referenceCode
      serviceType
      serviceName
      scheduledDate
      scheduledStartTime
      estimatedDurationHours
      status
      address {
        streetAddress
        city
      }
      client {
        fullName
      }
    }
  }
`;

export const MY_CLEANER_PROFILE = gql`
  query MyCleanerProfile {
    myCleanerProfile {
      id
      fullName
      phone
      email
      avatarUrl
      status
      ratingAvg
      totalJobsCompleted
      company {
        id
        companyName
      }
    }
  }
`;

export const MY_CLEANER_STATS = gql`
  query MyCleanerStats {
    myCleanerStats {
      totalJobsCompleted
      thisMonthJobs
      averageRating
      totalReviews
      thisMonthEarnings
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token) {
      id
      fullName
      status
      company {
        id
        companyName
      }
    }
  }
`;

export const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailability($slots: [AvailabilitySlotInput!]!) {
    updateAvailability(slots: $slots) {
      id
      dayOfWeek
      startTime
      endTime
      isAvailable
    }
  }
`;

export const CONFIRM_BOOKING = gql`
  mutation ConfirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      id
      status
    }
  }
`;

export const START_JOB = gql`
  mutation StartJob($id: ID!) {
    startJob(id: $id) {
      id
      status
      startedAt
    }
  }
`;

export const COMPLETE_JOB = gql`
  mutation CompleteJob($id: ID!) {
    completeJob(id: $id) {
      id
      status
      completedAt
    }
  }
`;
