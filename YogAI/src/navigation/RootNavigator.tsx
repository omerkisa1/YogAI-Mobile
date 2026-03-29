import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../features/auth/stores/authStore';
import CreatePlanScreen from '../screens/plans/CreatePlanScreen';
import PlanDetailScreen from '../screens/plans/PlanDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TrainingScreen from '../screens/training/TrainingScreen';
import LoadingScreen from '../shared/components/LoadingScreen';
import { colors } from '../theme/colors';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthenticatedNavigator = () => {
	return (
		<Stack.Navigator
			initialRouteName="MainTabs"
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.text,
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
			<Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: 'Plan Detayi' }} />
			<Stack.Screen name="CreatePlan" component={CreatePlanScreen} options={{ title: 'Plan Olustur' }} />
			<Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Profili Duzenle' }} />
			<Stack.Screen name="TrainingSession" component={TrainingScreen} options={{ title: 'Antrenman' }} />
		</Stack.Navigator>
	);
};

const RootNavigator = () => {
	const isLoading = useAuthStore(state => state.isLoading);
	const isAuthenticated = useAuthStore(state => state.isAuthenticated);

	if (isLoading) {
		return <LoadingScreen message="Kimlik dogrulama kontrol ediliyor..." />;
	}

	if (!isAuthenticated) {
		return <AuthStack />;
	}

	return <AuthenticatedNavigator />;
};

export default RootNavigator;
