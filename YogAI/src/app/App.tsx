import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNBootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';
import RootNavigator from '../navigation/RootNavigator';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../features/auth/stores/authStore';
import { queryClient } from '../shared/api/queryClient';
import OfflineBanner from '../shared/components/OfflineBanner';
import { useAppState } from '../shared/hooks/useAppState';
import { useNetworkStatus } from '../shared/hooks/useNetworkStatus';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
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
		<View style={[styles.toastCard, { borderLeftColor: color }]}>
			<View style={styles.toastIconWrap}>
				<MaterialCommunityIcons name={iconName} color={color} size={18} />
			</View>
			<View style={styles.toastTextWrap}>
				{props.text1 ? <Text style={styles.toastTitle}>{props.text1}</Text> : null}
				{props.text2 ? <Text style={styles.toastDescription}>{props.text2}</Text> : null}
			</View>
		</View>
	);
};

const toastConfig: ToastConfig = {
	success: props => buildToast(colors.success, 'check-circle', props),
	error: props => buildToast(colors.error, 'alert-circle', props),
	info: props => buildToast(colors.info, 'information', props),
};

const App = () => {
	const { isOffline, isOnline } = useNetworkStatus();

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(user => {
			useAuthStore.getState().setUser(user, getProviderFromUser(user));
			RNBootSplash.hide({ fade: true }).catch(() => undefined);
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

const styles = StyleSheet.create({
	toastCard: {
		minHeight: 64,
		borderRadius: 16,
		borderLeftWidth: 4,
		backgroundColor: colors.surface,
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.sm,
		marginHorizontal: spacing.base,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#1A1A2E',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 3,
	},
	toastIconWrap: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.sm,
	},
	toastTextWrap: {
		flex: 1,
	},
	toastTitle: {
		...typography.bodySmMedium,
		color: colors.text,
	},
	toastDescription: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.xxs,
	},
});
