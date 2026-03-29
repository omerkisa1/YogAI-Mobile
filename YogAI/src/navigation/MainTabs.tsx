import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import PlansScreen from '../screens/plans/PlansScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TrainingHistoryScreen from '../screens/training/TrainingHistoryScreen';
import { colors } from '../theme/colors';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
	return (
		<Tab.Navigator
			initialRouteName="Home"
			screenOptions={({ route }) => ({
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.text,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
				},
				tabBarActiveTintColor: colors.primaryLight,
				tabBarInactiveTintColor: colors.textMuted,
				tabBarIcon: ({ color, size }) => {
					const iconMap: Record<keyof MainTabParamList, string> = {
						Home: 'home-outline',
						Plans: 'list-outline',
						Training: 'barbell-outline',
						Profile: 'person-outline',
					};
					return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
			<Tab.Screen name="Plans" component={PlansScreen} options={{ title: 'Planlarim' }} />
			<Tab.Screen name="Training" component={TrainingHistoryScreen} options={{ title: 'Antrenman' }} />
			<Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
		</Tab.Navigator>
	);
};

export default MainTabs;
