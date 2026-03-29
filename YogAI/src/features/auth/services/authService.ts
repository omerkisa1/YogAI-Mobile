import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
	webClientId: 'FIREBASE_WEB_CLIENT_ID',
});

export const authService = {
	signInWithGoogle: async () => {
		await GoogleSignin.hasPlayServices();
		const signInResult = await GoogleSignin.signIn();
		const idToken = signInResult.data?.idToken;
		if (!idToken) {
			throw new Error('Google Sign-In failed: no idToken');
		}
		const credential = auth.GoogleAuthProvider.credential(idToken);
		return auth().signInWithCredential(credential);
	},

	registerWithEmail: (email: string, password: string) => {
		return auth().createUserWithEmailAndPassword(email, password);
	},

	signInWithEmail: (email: string, password: string) => {
		return auth().signInWithEmailAndPassword(email, password);
	},

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
};
