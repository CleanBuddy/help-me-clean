import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { loginWithGoogle, loginDev } = useAuth();
  const [devMode, setDevMode] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      Alert.alert('Eroare', 'Autentificarea Google a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Eroare', 'Te rugam sa introduci adresa de email.');
      return;
    }
    setLoading(true);
    try {
      await loginDev(email.trim());
    } catch {
      Alert.alert('Eroare', 'Autentificarea a esuat. Te rugam sa incerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAFBFC]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-blue-50 items-center justify-center mb-5">
            <Text className="text-3xl">🏢</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900">HelpMeClean</Text>
          <Text className="text-base text-gray-500 mt-1">Company App</Text>
        </View>

        <View className="bg-white rounded-2xl p-6 border border-gray-200">
          {!devMode ? (
            <TouchableOpacity
              className={`py-3.5 rounded-xl items-center flex-row justify-center border border-gray-300 ${loading ? 'bg-gray-100' : 'bg-white'}`}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text className="text-gray-700 font-semibold text-base">
                {loading ? 'Se conecteaza...' : 'Conecteaza-te cu Google'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Adresa de email (Dev Mode)
              </Text>
              <TextInput
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900"
                placeholder="admin@companie.ro"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                className={`mt-4 py-3.5 rounded-xl items-center ${loading ? 'bg-blue-400' : 'bg-primary'}`}
                onPress={handleDevLogin}
                disabled={loading}
              >
                <Text className="text-white font-semibold text-base">
                  {loading ? 'Se conecteaza...' : 'Conecteaza-te (Dev)'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {__DEV__ && (
          <TouchableOpacity
            onPress={() => setDevMode(!devMode)}
            className="mt-4 items-center"
          >
            <Text className="text-xs text-gray-400 underline">
              {devMode ? 'Foloseste Google Auth' : 'Foloseste Dev Mode'}
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
