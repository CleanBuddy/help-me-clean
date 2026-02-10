import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // webClientId is required to get an idToken on Android.
    // On iOS, the iosClientId from the plugin config is used automatically.
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('No ID token received from Google Sign-In');
  }

  return response.data.idToken;
}

export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore sign-out errors (user may not be signed in via Google)
  }
}
