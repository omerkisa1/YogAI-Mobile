import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useProfile } from '../../features/profile/hooks/useProfile';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

const ProfileScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const profileQuery = useProfile();
	const { signOut, isSubmitting } = useAuth();

	if (profileQuery.isLoading) {
		return <LoadingScreen message="Profil yukleniyor..." />;
	}

	if (profileQuery.isError || !profileQuery.data) {
		return <ErrorView message="Profil bilgisi alinamadi." onRetry={profileQuery.refetch} />;
	}

	const profile = profileQuery.data;

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Cikis basarisiz',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<Card style={styles.infoCard}>
				<Text style={styles.name}>{profile.display_name}</Text>
				<Text style={styles.meta}>Seviye: {profile.level}</Text>
				<Text style={styles.meta}>Yas: {profile.age}</Text>
				<Text style={styles.meta}>Dil: {profile.preferred_language.toUpperCase()}</Text>
				<Text style={styles.meta}>Hedefler: {profile.goals.join(', ') || '-'}</Text>
				<Text style={styles.meta}>Sakatliklar: {profile.injuries.join(', ') || '-'}</Text>
			</Card>

			<View style={styles.actions}>
				<Button label="Profili Duzenle" onPress={() => navigation.navigate('EditProfile')} />
				<Button label="Cikis Yap" onPress={handleSignOut} loading={isSubmitting} variant="outline" />
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		padding: spacing.lg,
		gap: spacing.lg,
	},
	infoCard: {
		gap: spacing.sm,
	},
	name: {
		...typography.h2,
		color: colors.text,
	},
	meta: {
		...typography.body,
		color: colors.textSecondary,
	},
	actions: {
		gap: spacing.md,
	},
});

export default ProfileScreen;
