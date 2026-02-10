import './global.css';
import { ApolloProvider } from '@apollo/client';
import * as SecureStore from 'expo-secure-store';
import { createApolloClient, setTokenGetter } from '@helpmeclean-mobile/shared';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { configureGoogleSignIn } from './src/services/googleAuth';

configureGoogleSignIn();

setTokenGetter(async () => {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
});

const client = createApolloClient('http://localhost:8080/query');

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ApolloProvider>
  );
}
