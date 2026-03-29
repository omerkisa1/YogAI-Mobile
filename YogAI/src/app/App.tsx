import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { queryClient } from '../shared/api/queryClient';
import RootNavigator from '../navigation/RootNavigator';
import { useAuthStore } from '../features/auth/stores/authStore';

const getProviderFromUser = (user: ReturnType<typeof auth>['currentUser']) => {
	if (!user) {
		return 'unknown';
	}

	if (user.providerData.some(provider => provider.providerId === 'google.com')) {
		return 'google';
	}
	if (user.providerData.some(provider => provider.providerId === 'password')) {
		return 'email';
	}
	return 'unknown';
};

const App = () => {
	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(user => {
			useAuthStore.getState().setUser(user, getProviderFromUser(user));
		});

		return unsubscribe;
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<NavigationContainer>
				<RootNavigator />
			</NavigationContainer>
			<Toast />
		</QueryClientProvider>
	);
};

export default App;
