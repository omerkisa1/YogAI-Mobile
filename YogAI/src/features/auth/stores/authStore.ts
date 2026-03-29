import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthState {
	user: FirebaseAuthTypes.User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	authProvider: string;
	setUser: (user: FirebaseAuthTypes.User | null, provider?: string) => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
	user: null,
	isLoading: true,
	isAuthenticated: false,
	authProvider: 'unknown',
	setUser: (user, provider) =>
		set({
			user,
			isAuthenticated: Boolean(user),
			authProvider: provider ?? 'unknown',
			isLoading: false,
		}),
	setLoading: isLoading => set({ isLoading }),
}));
