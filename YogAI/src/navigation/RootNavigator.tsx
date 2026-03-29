import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../features/auth/stores/authStore';
import CreatePlanScreen from '../screens/plans/CreatePlanScreen';
import PlanDetailScreen from '../screens/plans/PlanDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TrainingScreen from '../screens/training/TrainingScreen';
import AppSplash from '../shared/components/AppSplash';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthenticatedNavigator = () => {
	return (
		<Stack.Navigator
			initialRouteName="MainTabs"
			screenOptions={({ navigation }) => ({
				headerShadowVisible: false,
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.primary,
				headerTitleStyle: {
					...typography.h4,
					color: colors.text,
				},
				headerBackTitleVisible: false,
				headerLeft: ({ canGoBack }) => {
					if (!canGoBack) {
						return null;
					}

					return (
						<Pressable
							onPress={navigation.goBack}
							style={styles.backButton}
							accessibilityRole="button"
							accessibilityLabel="Geri"
						>
							<MaterialCommunityIcons name="chevron-left" size={26} color={colors.primary} />
						</Pressable>
					);
				},
				contentStyle: { backgroundColor: colors.background },
			})}
		>
			<Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
			<Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'Plan Detayı' }} />
			<Stack.Screen name="CreatePlan" component={CreatePlanScreen} options={{ title: 'Plan Oluştur' }} />
			<Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Profili Düzenle' }} />
			<Stack.Screen name="TrainingSession" component={TrainingScreen} options={{ title: 'Antrenman' }} />
		</Stack.Navigator>
	);
};

const RootNavigator = () => {
	const isLoading = useAuthStore(state => state.isLoading);
	const isAuthenticated = useAuthStore(state => state.isAuthenticated);

	if (isLoading) {
		return <AppSplash />;
	}

	if (!isAuthenticated) {
		return <AuthStack />;
	}

	return <AuthenticatedNavigator />;
};

const styles = StyleSheet.create({
	backButton: {
		paddingRight: spacing.xs,
		paddingVertical: spacing.xs,
	},
});

export default RootNavigator;
