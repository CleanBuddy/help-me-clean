// ---------------------------------------------------------------------------
// Global test setup for the HelpMeClean Company App (React Native / Expo)
// ---------------------------------------------------------------------------

// ---- @react-native-google-signin mock ------------------------------------
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-google-id-token' } }),
    signOut: jest.fn().mockResolvedValue(null),
    isSignedIn: jest.fn().mockResolvedValue(false),
  },
}));

// ---- expo-secure-store mock ------------------------------------------------
jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
});

// ---- @react-navigation/native mock ----------------------------------------
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: { orderId: 'test-order-1' },
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// ---- @react-navigation/native-stack mock -----------------------------------
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

// ---- @react-navigation/bottom-tabs mock ------------------------------------
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
}));

// ---- @apollo/client mock ---------------------------------------------------
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client');
  return {
    ...actual,
    useQuery: jest.fn(() => ({
      data: undefined,
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    })),
    useLazyQuery: jest.fn(() => [jest.fn(), { data: undefined, loading: false }]),
    useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
    useApolloClient: jest.fn(() => ({
      clearStore: jest.fn(),
    })),
    gql: actual.gql ?? jest.fn((str: TemplateStringsArray) => str),
  };
});

// ---- @helpmeclean-mobile/shared mock ---------------------------------------
jest.mock('@helpmeclean-mobile/shared', () => ({
  ME: 'ME_QUERY',
  SIGN_IN_WITH_GOOGLE: 'SIGN_IN_WITH_GOOGLE_MUTATION',
  MY_COMPANY: 'MY_COMPANY_QUERY',
  COMPANY_BOOKINGS: 'COMPANY_BOOKINGS_QUERY',
  BOOKING_DETAIL: 'BOOKING_DETAIL_QUERY',
  MY_CLEANERS: 'MY_CLEANERS_QUERY',
  INVITE_CLEANER: 'INVITE_CLEANER_MUTATION',
  ASSIGN_CLEANER: 'ASSIGN_CLEANER_MUTATION',
  TODAYS_JOBS: 'TODAYS_JOBS_QUERY',
  MY_ASSIGNED_JOBS: 'MY_ASSIGNED_JOBS_QUERY',
  CONFIRM_BOOKING: 'CONFIRM_BOOKING_MUTATION',
  START_JOB: 'START_JOB_MUTATION',
  COMPLETE_JOB: 'COMPLETE_JOB_MUTATION',
  MY_CLEANER_PROFILE: 'MY_CLEANER_PROFILE_QUERY',
  MY_CLEANER_STATS: 'MY_CLEANER_STATS_QUERY',
  UPDATE_COMPANY_PROFILE: 'UPDATE_COMPANY_PROFILE_MUTATION',
  createApolloClient: jest.fn(),
  setTokenGetter: jest.fn(),
  COLORS: {},
  SPACING: {},
}));

// ---- React Native Alert mock -----------------------------------------------
const { Alert } = require('react-native');
Alert.alert = jest.fn();

// ---- NativeWind mock -------------------------------------------------------
jest.mock('nativewind', () => ({
  styled: (component: unknown) => component,
}));

// ---- Silence RN Animated warnings in tests ---------------------------------
// NativeAnimatedHelper path varies by RN version; safe to skip if missing.
