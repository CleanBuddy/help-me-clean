import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import TodayScreen from '../screens/TodayScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ChatScreen from '../screens/ChatScreen';

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  JobDetail: { jobId: string };
  Chat: { roomId: string; otherUserName: string };
};

type TabParamList = {
  Azi: undefined;
  Program: undefined;
  Mesaje: undefined;
  Profil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Azi: '📋',
    Program: '📅',
    Mesaje: '💬',
    Profil: '👤',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#E5E7EB' },
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="Azi"
        component={TodayScreen}
        options={{ tabBarLabel: 'Azi' }}
      />
      <Tab.Screen
        name="Program"
        component={ScheduleScreen}
        options={{ tabBarLabel: 'Program' }}
      />
      <Tab.Screen
        name="Mesaje"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Mesaje' }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFBFC' }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="JobDetail"
              component={JobDetailScreen}
              options={{
                headerShown: true,
                title: 'Detalii comanda',
                headerTintColor: '#2563EB',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({
                headerShown: true,
                title: route.params.otherUserName,
                headerTintColor: '#2563EB',
              })}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
