import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BaseToast, ErrorToast, ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import RootNavigator from '../navigation/RootNavigator';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../features/auth/stores/authStore';
import { queryClient } from '../shared/api/queryClient';
import OfflineBanner from '../shared/components/OfflineBanner';
import { useAppState } from '../shared/hooks/useAppState';
import { useNetworkStatus } from '../shared/hooks/useNetworkStatus';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const linking: LinkingOptions<RootStackParamList> = {
	prefixes: ['yogai://', 'https://yogai.app'],
	config: {
		screens: {
			MainTabs: {
				screens: {
					Home: 'home',
					Plans: 'plans',
					Training: 'training',
					Profile: 'profile',
				},
			},
			PlanDetail: 'plans/:planId',
			CreatePlan: 'plans/create',
			EditProfile: 'profile/edit',
			TrainingSession: 'training/session/:sessionId/:planId',
		},
	},
};

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

const buildToast = (
	color: string,
	iconName: string,
	props: ToastConfigParams<{
		text1?: string;
		text2?: string;
	}>,
) => {
	return (
		<BaseToast
			{...props}
			style={{
				borderLeftColor: color,
				borderLeftWidth: 5,
				backgroundColor: colors.surface,
			}}
			contentContainerStyle={{ paddingHorizontal: 12 }}
			text1Style={{
				...typography.bodySmMedium,
				color: colors.text,
			}}
			text2Style={{
				...typography.caption,
				color: colors.textSecondary,
			}}
			renderLeadingIcon={() => <MaterialCommunityIcons name={iconName} color={color} size={18} />}
		/>
	);
};

const toastConfig: ToastConfig = {
	success: props => buildToast(colors.success, 'check-circle-outline', props),
	error: props => (
		<ErrorToast
			{...props}
			style={{
				borderLeftColor: colors.error,
				borderLeftWidth: 5,
				backgroundColor: colors.surface,
			}}
			contentContainerStyle={{ paddingHorizontal: 12 }}
			text1Style={{
				...typography.bodySmMedium,
				color: colors.text,
			}}
			text2Style={{
				...typography.caption,
				color: colors.textSecondary,
			}}
			renderLeadingIcon={() => <MaterialCommunityIcons name="alert-circle-outline" color={colors.error} size={18} />}
		/>
	),
	info: props => buildToast(colors.info, 'information-outline', props),
};

const App = () => {
	const { isOffline, isOnline } = useNetworkStatus();

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(user => {
			useAuthStore.getState().setUser(user, getProviderFromUser(user));
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		onlineManager.setOnline(isOnline);
	}, [isOnline]);

	useAppState((nextState, previousState) => {
		const wasBackgrounded = previousState === 'background' || previousState === 'inactive';
		const isActive = nextState === 'active';

		focusManager.setFocused(isActive);

		if (wasBackgrounded && isActive) {
			void queryClient.refetchQueries({ type: 'active' });
		}

		if (nextState === 'background') {
			void queryClient.cancelQueries();
		}
	});

	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<OfflineBanner visible={isOffline} />
				<NavigationContainer linking={linking}>
					<RootNavigator />
				</NavigationContainer>
				<Toast config={toastConfig} position="top" visibilityTime={3000} topOffset={56} autoHide />
			</QueryClientProvider>
		</SafeAreaProvider>
	);
};

export default App;
