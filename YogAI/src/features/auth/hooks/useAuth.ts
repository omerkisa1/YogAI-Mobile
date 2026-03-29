import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
	const user = useAuthStore(state => state.user);
	const isAuthenticated = useAuthStore(state => state.isAuthenticated);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const signInWithGoogle = async () => {
		setIsSubmitting(true);
		try {
			await authService.signInWithGoogle();
		} finally {
			setIsSubmitting(false);
		}
	};

	const registerWithEmail = async (email: string, password: string) => {
		setIsSubmitting(true);
		try {
			await authService.registerWithEmail(email, password);
		} finally {
			setIsSubmitting(false);
		}
	};

	const signInWithEmail = async (email: string, password: string) => {
		setIsSubmitting(true);
		try {
			await authService.signInWithEmail(email, password);
		} finally {
			setIsSubmitting(false);
		}
	};

	const signOut = async () => {
		setIsSubmitting(true);
		try {
			await authService.signOut();
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		user,
		isAuthenticated,
		isSubmitting,
		signInWithGoogle,
		registerWithEmail,
		signInWithEmail,
		signOut,
	};
};
