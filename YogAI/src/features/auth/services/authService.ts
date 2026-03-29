import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

GoogleSignin.configure({
	webClientId: 'FIREBASE_WEB_CLIENT_ID',
});

export const authService = {
	// --- Existing: Google Sign-In ---
	signInWithGoogle: async () => {
		await GoogleSignin.hasPlayServices();
		const signInResult = await GoogleSignin.signIn();
		const idToken = signInResult.data?.idToken;
		if (!idToken) {
			throw new Error('Google Sign-In failed: no idToken');
		}
		const credential = auth.GoogleAuthProvider.credential(idToken);
		const userCredential = await auth().signInWithCredential(credential);
		return { userCredential, provider: 'google' as const };
	},

	// --- New: Email/Password Register ---
	registerWithEmail: async (email: string, password: string, displayName: string) => {
		const userCredential = await auth().createUserWithEmailAndPassword(email, password);
		await userCredential.user.updateProfile({ displayName });
		return { userCredential, provider: 'email' as const };
	},

	// --- New: Email/Password Login ---
	signInWithEmail: async (email: string, password: string) => {
		const userCredential = await auth().signInWithEmailAndPassword(email, password);
		return { userCredential, provider: 'email' as const };
	},

	// --- New: Password Reset ---
	resetPassword: async (email: string) => {
		await auth().sendPasswordResetEmail(email);
	},

	// --- Existing: Sign Out ---
	signOut: async () => {
		try {
			await GoogleSignin.signOut();
		} catch {
			// Ignore Google sign-out errors when user did not sign in with Google.
		}
		return auth().signOut();
	},

	getCurrentUser: () => auth().currentUser,

	getIdToken: async () => {
		const user = auth().currentUser;
		if (!user) {
			return null;
		}
		return user.getIdToken(true);
	},

	// --- New: Platform info ---
	getPlatform: (): string => {
		return Platform.OS;
	},

	// --- New: Auth provider info ---
	getAuthProvider: (): string => {
		const user = auth().currentUser;
		if (!user) {
			return 'unknown';
		}

		const providers = user.providerData;
		if (providers.some(p => p.providerId === 'google.com')) {
			return 'google';
		}
		if (providers.some(p => p.providerId === 'password')) {
			return 'email';
		}
		return 'unknown';
	},
};
