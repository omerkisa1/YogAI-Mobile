import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { colors } from '../theme/colors';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
	return (
		<Stack.Navigator
			initialRouteName="Login"
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.text,
				contentStyle: { backgroundColor: colors.background },
			}}
		>
			<Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giris' }} />
			<Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayit Ol' }} />
		</Stack.Navigator>
	);
};

export default AuthStack;
