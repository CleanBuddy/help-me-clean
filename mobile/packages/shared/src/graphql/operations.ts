import { gql } from '@apollo/client';

// Auth
export const SIGN_IN_WITH_GOOGLE = gql`
  mutation signInWithGoogle($idToken: String!, $role: UserRole!) {
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
      }
      isNewUser
    }
  }
`;

export const ME = gql`
  query me {
    me {
      id
      email
      fullName
      role
      status
      phone
      avatarUrl
    }
  }
`;

// Cleaner - Today's jobs
export const TODAYS_JOBS = gql`
  query todaysJobs {
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

// Cleaner - Assigned jobs
export const MY_ASSIGNED_JOBS = gql`
  query myAssignedJobs($status: BookingStatus) {
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

// Cleaner - Job actions
export const CONFIRM_BOOKING = gql`
  mutation confirmBooking($id: ID!) {
    confirmBooking(id: $id) {
      id
      status
    }
  }
`;

export const START_JOB = gql`
  mutation startJob($id: ID!) {
    startJob(id: $id) {
      id
      status
      startedAt
    }
  }
`;

export const COMPLETE_JOB = gql`
  mutation completeJob($id: ID!) {
    completeJob(id: $id) {
      id
      status
      completedAt
    }
  }
`;

// Cleaner profile
export const MY_CLEANER_PROFILE = gql`
  query myCleanerProfile {
    myCleanerProfile {
      id
      fullName
      phone
      email
      avatarUrl
      status
      ratingAvg
      totalJobsCompleted
    }
  }
`;

export const MY_CLEANER_STATS = gql`
  query myCleanerStats {
    myCleanerStats {
      totalJobsCompleted
      totalJobsThisMonth
      averageRating
      upcomingJobsCount
    }
  }
`;

// Company
export const MY_COMPANY = gql`
  query myCompany {
    myCompany {
      id
      companyName
      cui
      companyType
      status
      ratingAvg
      totalJobsCompleted
      maxServiceRadiusKm
      contactEmail
      contactPhone
      description
    }
  }
`;

export const COMPANY_BOOKINGS = gql`
  query companyBookings($status: BookingStatus, $first: Int) {
    companyBookings(status: $status, first: $first) {
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
        client {
          id
          fullName
          email
        }
        cleaner {
          id
          fullName
        }
        address {
          streetAddress
          city
        }
      }
      totalCount
    }
  }
`;

export const BOOKING_DETAIL = gql`
  query booking($id: ID!) {
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
      status
      paymentStatus
      startedAt
      completedAt
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

export const MY_CLEANERS = gql`
  query myCleaners {
    myCleaners {
      id
      fullName
      phone
      email
      status
      ratingAvg
      totalJobsCompleted
    }
  }
`;

export const INVITE_CLEANER = gql`
  mutation inviteCleaner($fullName: String!, $email: String!, $phone: String) {
    inviteCleaner(fullName: $fullName, email: $email, phone: $phone) {
      id
      fullName
      status
    }
  }
`;

export const ASSIGN_CLEANER = gql`
  mutation assignCleanerToBooking($bookingId: ID!, $cleanerId: ID!) {
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

export const UPDATE_COMPANY_PROFILE = gql`
  mutation updateCompanyProfile($input: UpdateCompanyInput!) {
    updateCompanyProfile(input: $input) {
      id
      description
      contactPhone
      maxServiceRadiusKm
    }
  }
`;

// Chat
export const MY_CHAT_ROOMS = gql`
  query myChatRooms {
    myChatRooms {
      id
      roomType
      lastMessage {
        id
        content
        messageType
        isRead
        createdAt
        sender {
          id
          fullName
        }
      }
      participants {
        user {
          id
          fullName
          avatarUrl
        }
        joinedAt
      }
      createdAt
    }
  }
`;

export const CHAT_ROOM_DETAIL = gql`
  query chatRoom($id: ID!) {
    chatRoom(id: $id) {
      id
      roomType
      participants {
        user {
          id
          fullName
          avatarUrl
        }
        joinedAt
      }
      messages {
        edges {
          id
          content
          messageType
          isRead
          createdAt
          sender {
            id
            fullName
            avatarUrl
          }
        }
      }
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation sendMessage($roomId: ID!, $content: String!) {
    sendMessage(roomId: $roomId, content: $content) {
      id
      content
      messageType
      isRead
      createdAt
      sender {
        id
        fullName
      }
    }
  }
`;

export const OPEN_BOOKING_CHAT = gql`
  mutation openBookingChat($bookingId: ID!) {
    openBookingChat(bookingId: $bookingId) {
      id
      roomType
    }
  }
`;

export const MARK_MESSAGES_READ = gql`
  mutation markMessagesAsRead($roomId: ID!) {
    markMessagesAsRead(roomId: $roomId)
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription messageSent($roomId: ID!) {
    messageSent(roomId: $roomId) {
      id
      content
      messageType
      isRead
      createdAt
      sender {
        id
        fullName
      }
    }
  }
`;
