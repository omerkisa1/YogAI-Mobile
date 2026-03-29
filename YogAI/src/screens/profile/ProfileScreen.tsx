import React, { useMemo } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
	Alert,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useProfile } from '../../features/profile/hooks/useProfile';
import Badge from '../../shared/components/Badge';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingView from '../../shared/components/LoadingView';
import { Goal } from '../../shared/types/profile';
import { Injury, Level } from '../../shared/types/plan';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const levelLabelMap: Record<Level, string> = {
	beginner: 'Baslangic',
	intermediate: 'Orta',
	advanced: 'Ileri',
};

const goalLabelMap: Record<Goal, string> = {
	flexibility: 'Esneklik',
	stress_relief: 'Stres Azaltma',
	strength: 'Guc',
	balance: 'Denge',
	mobility: 'Mobilite',
	posture: 'Postur',
};

const injuryLabelMap: Record<Injury, string> = {
	knee_injury: 'Diz',
	ankle_injury: 'Ayak Bilegi',
	herniated_disc: 'Bel Fitigi',
	low_back_pain: 'Bel',
	shoulder_injury: 'Omuz',
	wrist_injury: 'Bilek',
	neck_injury: 'Boyun',
	groin_injury: 'Kasik',
	hip_injury: 'Kalca',
};

const authProviderLabelMap: Record<string, string> = {
	google: 'google',
	email: 'email',
	unknown: 'unknown',
};

const languageLabelMap: Record<'tr' | 'en', string> = {
	tr: 'Turkce',
	en: 'English',
};

const ProfileScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const profileQuery = useProfile();
	const { signOut, isSubmitting, user, authProvider } = useAuth();

	const displayName = profileQuery.data?.display_name || user?.displayName || 'YogAI Kullanici';
	const email = user?.email || 'email bulunamadi';
	const avatarInitial = displayName.charAt(0).toUpperCase() || 'Y';

	const goals = useMemo(
		() => (profileQuery.data?.goals ?? []).map(goal => goalLabelMap[goal]).filter(Boolean),
		[profileQuery.data?.goals],
	);
	const injuries = useMemo(
		() => (profileQuery.data?.injuries ?? []).map(injury => injuryLabelMap[injury]).filter(Boolean),
		[profileQuery.data?.injuries],
	);

	const onSignOut = () => {
		Alert.alert('Cikis Yap', 'Hesabinizdan cikis yapmak istediginize emin misiniz?', [
			{ text: 'Iptal', style: 'cancel' },
			{
				text: 'Cikis Yap',
				style: 'destructive',
				onPress: async () => {
					try {
						await signOut();
					} catch {
						Toast.show({
							type: 'error',
							position: 'top',
							text1: 'Cikis basarisiz',
							text2: 'Lutfen tekrar deneyin.',
						});
					}
				},
			},
		]);
	};

	if (profileQuery.isLoading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<LoadingView message="Profil yukleniyor..." fullScreen />
			</SafeAreaView>
		);
	}

	if (profileQuery.isError || !profileQuery.data) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.errorWrap}>
					<ErrorView
						type="generic"
						title="Profil yuklenemedi"
						description="Profil bilgileri su anda getirilemiyor."
						onRetry={() => {
							void profileQuery.refetch();
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const profile = profileQuery.data;
	const authProviderLabel = authProviderLabelMap[authProvider] ?? 'unknown';
	const platformLabel = Platform.OS;
	const levelLabel = levelLabelMap[profile.level] ?? profile.level;
	const languageLabel = languageLabelMap[profile.preferred_language] ?? profile.preferred_language;

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.profileHeader}>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>{avatarInitial}</Text>
					</View>
					<Text style={styles.name}>{displayName}</Text>
					<Text style={styles.email}>{email}</Text>
					<View style={styles.badgeRow}>
						<Badge text={`platform: ${platformLabel}`} variant="info" icon="cellphone" />
						<Badge text={`auth: ${authProviderLabel}`} variant="secondary" icon="shield-account-outline" />
					</View>
				</View>

				<Card variant="elevated" style={styles.infoCard}>
					<View style={styles.infoLine}>
						<Text style={styles.infoKey}>Seviye</Text>
						<Badge text={levelLabel} variant="primary" />
					</View>
					<View style={styles.infoLine}>
						<Text style={styles.infoKey}>Yas</Text>
						<Text style={styles.infoValue}>{profile.age || '-'}</Text>
					</View>
					<View style={styles.infoLine}>
						<Text style={styles.infoKey}>Dil</Text>
						<Text style={styles.infoValue}>{languageLabel}</Text>
					</View>
					<View style={styles.infoLineTop}>
						<Text style={styles.infoKey}>Hedefler</Text>
						<Text style={styles.infoValue}>{goals.length > 0 ? goals.join(', ') : '-'}</Text>
					</View>
					<View style={styles.infoLineTop}>
						<Text style={styles.infoKey}>Sakatliklar</Text>
						<Text style={styles.infoValue}>{injuries.length > 0 ? injuries.join(', ') : '-'}</Text>
					</View>
				</Card>

				<Card variant="default" style={styles.actionsCard}>
					<Pressable
						onPress={() => navigation.navigate('EditProfile')}
						style={styles.actionItem}
						accessibilityRole="button"
						accessibilityLabel="Profili duzenle"
					>
						<Text style={styles.actionText}>Profili Duzenle</Text>
						<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
					</Pressable>
					<Pressable
						onPress={() =>
							Toast.show({ type: 'info', position: 'top', text1: 'Yakinda', text2: 'Bildirim ayarlari yakinda.' })
						}
						style={styles.actionItem}
						accessibilityRole="button"
						accessibilityLabel="Bildirim ayarlari"
					>
						<Text style={styles.actionText}>Bildirim Ayarlari</Text>
						<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
					</Pressable>
					<Pressable
						onPress={() =>
							Toast.show({ type: 'info', position: 'top', text1: 'Yakinda', text2: 'Hakkinda sayfasi yakinda.' })
						}
						style={styles.actionItem}
						accessibilityRole="button"
						accessibilityLabel="Hakkinda"
					>
						<Text style={styles.actionText}>Hakkinda</Text>
						<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
					</Pressable>
					<Pressable
						onPress={() =>
							Toast.show({
								type: 'info',
								position: 'top',
								text1: 'Yakinda',
								text2: 'Gizlilik politikasi yakinda.',
							})
						}
						style={styles.actionItem}
						accessibilityRole="button"
						accessibilityLabel="Gizlilik politikasi"
					>
						<Text style={styles.actionText}>Gizlilik Politikasi</Text>
						<MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
					</Pressable>
				</Card>

				<Button
					title="Cikis Yap"
					onPress={onSignOut}
					variant="outline"
					size="lg"
					fullWidth
					icon="logout"
					disabled={isSubmitting}
					loading={isSubmitting}
					accessibilityLabel="Cikis yap"
				/>

				<Text style={styles.version}>YogAI v1.0.0</Text>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.xxl,
		gap: spacing.base,
	},
	errorWrap: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing.base,
	},
	profileHeader: {
		alignItems: 'center',
		paddingTop: spacing.sm,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: radius.full,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.sm,
	},
	avatarText: {
		...typography.h2,
		color: colors.textOnPrimary,
	},
	name: {
		...typography.h2,
		color: colors.text,
	},
	email: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	badgeRow: {
		flexDirection: 'row',
		gap: spacing.xs,
		marginTop: spacing.sm,
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	infoCard: {
		gap: spacing.sm,
	},
	infoLine: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	infoLineTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	infoKey: {
		...typography.bodySmMedium,
		color: colors.textSecondary,
		flex: 1,
	},
	infoValue: {
		...typography.bodySm,
		color: colors.text,
		flex: 1.6,
		textAlign: 'right',
	},
	actionsCard: {
		paddingVertical: spacing.sm,
	},
	actionItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: spacing.sm,
	},
	actionText: {
		...typography.body,
		color: colors.text,
	},
	version: {
		...typography.caption,
		color: colors.textMuted,
		textAlign: 'center',
		marginTop: spacing.sm,
	},
});

export default ProfileScreen;
