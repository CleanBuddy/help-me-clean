import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import TeamScreen from '../screens/TeamScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  OrderDetail: { orderId: string };
  Chat: { roomId: string; otherUserName: string };
};

type TabParamList = {
  Acasa: undefined;
  Comenzi: undefined;
  Mesaje: undefined;
  Echipa: undefined;
  Setari: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Acasa: '🏠',
    Comenzi: '📋',
    Mesaje: '💬',
    Echipa: '👥',
    Setari: '⚙️',
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
        name="Acasa"
        component={HomeScreen}
        options={{ tabBarLabel: 'Acasa' }}
      />
      <Tab.Screen
        name="Comenzi"
        component={OrdersScreen}
        options={{ tabBarLabel: 'Comenzi' }}
      />
      <Tab.Screen
        name="Mesaje"
        component={MessagesScreen}
        options={{ tabBarLabel: 'Mesaje' }}
      />
      <Tab.Screen
        name="Echipa"
        component={TeamScreen}
        options={{ tabBarLabel: 'Echipa' }}
      />
      <Tab.Screen
        name="Setari"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Setari' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFBFC',
        }}
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
              name="OrderDetail"
              component={OrderDetailScreen}
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
