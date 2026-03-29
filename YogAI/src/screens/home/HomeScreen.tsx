import React, { useCallback, useMemo, useState } from 'react';
import {
	FlatList,
	Pressable,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useUpdatePlan } from '../../features/plans/hooks/useCreatePlan';
import { usePlans } from '../../features/plans/hooks/usePlans';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { useTrainingStats } from '../../features/training/hooks/useTraining';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import EmptyState from '../../shared/components/EmptyState';
import ErrorView from '../../shared/components/ErrorView';
import PlanCard from '../../shared/components/PlanCard';
import SkeletonLoader from '../../shared/components/SkeletonLoader';
import { Plan } from '../../shared/types/plan';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface StatCardData {
	id: string;
	icon: string;
	label: string;
	value: string;
}

interface QuickStartPreset {
	id: string;
	icon: string;
	title: string;
	subtitle: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	duration: number;
}

const dailyMessages = [
	'Bugun harika bir gun yoga icin',
	'Nefesine odaklan, bedenini dinle',
	'Her pratik seni guclendirir',
	'Kucuk adimlar, buyuk degisimler',
	'Bedenin sana tesekkur edecek',
] as const;

const quickStartPresets: QuickStartPreset[] = [
	{
		id: 'quick-beginner',
		icon: 'leaf',
		title: 'Baslangic',
		subtitle: '15dk • Tam Vucut',
		level: 'beginner',
		duration: 15,
	},
	{
		id: 'quick-intermediate',
		icon: 'tree',
		title: 'Orta Seviye',
		subtitle: '25dk • Denge',
		level: 'intermediate',
		duration: 25,
	},
	{
		id: 'quick-advanced',
		icon: 'fire',
		title: 'Ileri Seviye',
		subtitle: '35dk • Guc Akisi',
		level: 'advanced',
		duration: 35,
	},
];

const formatHours = (seconds: number) => {
	if (!seconds) {
		return '0';
	}

	return (seconds / 3600).toFixed(1);
};

const getDailyMessage = () => {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	const day = Math.floor(diff / 86400000);
	return dailyMessages[day % dailyMessages.length];
};

const HomeScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const tabNavigation = useNavigation<NavigationProp<MainTabParamList>>();
	const queryClient = useQueryClient();
	const [refreshing, setRefreshing] = useState(false);

	const profileQuery = useProfile();
	const plansQuery = usePlans();
	const statsQuery = useTrainingStats();
	const updatePlanMutation = useUpdatePlan();

	const profileName = profileQuery.data?.display_name || 'Yogi';
	const avatarInitial = profileName.charAt(0).toUpperCase() || 'Y';
	const dailyMessage = useMemo(() => getDailyMessage(), []);

	const stats = statsQuery.data ?? {
		total_sessions: 0,
		total_duration_sec: 0,
		average_accuracy: 0,
		current_streak: 0,
	};

	const statCards = useMemo<StatCardData[]>(
		() => [
			{ id: 'total-sessions', icon: 'calendar', label: 'Antrenman', value: `${stats.total_sessions ?? 0}` },
			{ id: 'total-hours', icon: 'timer-outline', label: 'Saat', value: formatHours(stats.total_duration_sec ?? 0) },
			{ id: 'avg-score', icon: 'target', label: 'Ort.Skor', value: `%${Math.round(stats.average_accuracy ?? 0)}` },
			{ id: 'streak', icon: 'fire', label: 'Seri', value: `${stats.current_streak ?? 0}` },
		],
		[stats],
	);

	const allPlans = useMemo(() => (Array.isArray(plansQuery.data) ? plansQuery.data : []), [plansQuery.data]);
	const latestPlans = useMemo(() => allPlans.slice(0, 3), [allPlans]);

	const hasCriticalError = profileQuery.isError || plansQuery.isError;
	const isInitialLoading =
		(profileQuery.isLoading && !profileQuery.data) ||
		(plansQuery.isLoading && !plansQuery.data) ||
		(statsQuery.isLoading && !statsQuery.data);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.allSettled([profileQuery.refetch(), plansQuery.refetch(), statsQuery.refetch()]);
		setRefreshing(false);
	}, [profileQuery, plansQuery, statsQuery]);

	const handleOpenPlan = useCallback(
		(planId: string) => {
			navigation.navigate('PlanDetail', { planId });
		},
		[navigation],
	);

	const togglePlanMeta = useCallback(
		async (plan: Plan, data: { favorite?: boolean; pin?: boolean }) => {
			try {
				await updatePlanMutation.mutateAsync({ id: plan.id, data });
				await queryClient.invalidateQueries({ queryKey: ['plans'] });
			} catch {
				Toast.show({
					type: 'error',
					position: 'top',
					text1: 'Islem basarisiz',
					text2: 'Plan bilgisi guncellenemedi.',
				});
			}
		},
		[queryClient, updatePlanMutation],
	);

	const onToggleFavorite = useCallback(
		(plan: Plan) => {
			void togglePlanMeta(plan, { favorite: !plan.favorite });
		},
		[togglePlanMeta],
	);

	const onTogglePin = useCallback(
		(plan: Plan) => {
			void togglePlanMeta(plan, { pin: !plan.pin });
		},
		[togglePlanMeta],
	);

	const renderStatCard = useCallback(
		({ item }: { item: StatCardData }) => (
			<Card variant="elevated" style={styles.statCard}>
				<MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
				<Text style={styles.statValue}>{item.value}</Text>
				<Text style={styles.statLabel}>{item.label}</Text>
			</Card>
		),
		[],
	);

	const renderQuickStartCard = useCallback(
		({ item }: { item: QuickStartPreset }) => (
			<Card variant="default" style={styles.quickStartCard}>
				<MaterialCommunityIcons name={item.icon} size={24} color={colors.primary} />
				<Text style={styles.quickStartTitle}>{item.title}</Text>
				<Text style={styles.quickStartSubtitle}>{item.subtitle}</Text>
				<Button
					title="Baslat"
					onPress={() =>
						navigation.navigate('CreatePlan', {
							presetLevel: item.level,
							presetDuration: item.duration,
						})
					}
					variant="ghost"
					size="sm"
					icon="arrow-right"
					iconPosition="right"
					fullWidth={false}
					accessibilityLabel={`${item.title} hizli antrenman baslat`}
				/>
			</Card>
		),
		[navigation],
	);

	if (hasCriticalError) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.errorContainer}>
					<ErrorView
						type="generic"
						title="Ana sayfa yuklenemedi"
						description="Veriler su anda getirilemiyor. Lutfen tekrar deneyin."
						onRetry={() => {
							void onRefresh();
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.topBar}>
					<View>
						<Text style={styles.greeting}>Merhaba, {profileName}</Text>
						<Text style={styles.dailyMessage}>{dailyMessage}</Text>
					</View>
					<View style={styles.avatar}>
						<Text style={styles.avatarText}>{avatarInitial}</Text>
					</View>
				</View>

				{isInitialLoading ? (
					<View style={styles.statsSkeletonRow}>
						{Array.from({ length: 4 }).map((_, index) => (
							<SkeletonLoader key={`stat-skeleton-${index}`} width={148} height={122} borderRadius={radius.lg} />
						))}
					</View>
				) : (
					<FlatList
						horizontal
						data={statCards}
						keyExtractor={item => item.id}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.statListContent}
						renderItem={renderStatCard}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews
						getItemLayout={(_, index) => ({ length: 156, offset: 156 * index, index })}
						ListHeaderComponent={<View />}
						ListFooterComponent={<View style={styles.listFooterSpacer} />}
					/>
				)}

				<View style={styles.sectionHeaderRow}>
					<Text style={styles.sectionTitle}>Hizli Antrenman</Text>
				</View>
				<FlatList
					horizontal
					data={quickStartPresets}
					keyExtractor={item => item.id}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.quickStartList}
					renderItem={renderQuickStartCard}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews
					getItemLayout={(_, index) => ({ length: 224, offset: 224 * index, index })}
					ListHeaderComponent={<View />}
					ListFooterComponent={<View style={styles.listFooterSpacer} />}
				/>

				<View style={styles.sectionHeaderRow}>
					<Text style={styles.sectionTitle}>Planlarim</Text>
					<Pressable
						onPress={() => tabNavigation.navigate('Plans')}
						accessibilityRole="button"
						accessibilityLabel="Tum planlari gor"
					>
						<Text style={styles.viewAllText}>Tumunu Gor</Text>
					</Pressable>
				</View>

				{plansQuery.isLoading && !plansQuery.data ? (
					<View style={styles.planSkeletonColumn}>
						{Array.from({ length: 3 }).map((_, index) => (
							<SkeletonLoader key={`plan-skeleton-${index}`} width="100%" height={164} borderRadius={radius.lg} />
						))}
					</View>
				) : latestPlans.length === 0 ? (
					<EmptyState
						icon="calendar-plus"
						title="Henuz planiniz yok"
						description="Ilk planinizi olusturarak kisisel yoga yolculugunuza baslayin."
						actionLabel="Ilk Plani Olustur"
						onAction={() => navigation.navigate('CreatePlan')}
					/>
				) : (
					<View style={styles.planList}>
						{latestPlans.map(plan => (
							<PlanCard
								key={plan.id}
								plan={plan}
								onPress={handleOpenPlan}
								onToggleFavorite={onToggleFavorite}
								onTogglePin={onTogglePin}
								actionsDisabled={updatePlanMutation.isPending}
								progress={0}
							/>
						))}
					</View>
				)}
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
	},
	errorContainer: {
		flex: 1,
		paddingHorizontal: spacing.base,
		justifyContent: 'center',
	},
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: spacing.sm,
		marginBottom: spacing.base,
	},
	greeting: {
		...typography.h3,
		color: colors.text,
	},
	dailyMessage: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: radius.full,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		...typography.bodyMedium,
		color: colors.textOnPrimary,
	},
	statsSkeletonRow: {
		flexDirection: 'row',
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	statListContent: {
		paddingRight: spacing.base,
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	statCard: {
		width: 148,
		minHeight: 122,
		justifyContent: 'space-between',
	},
	statValue: {
		...typography.h2,
		color: colors.text,
		marginTop: spacing.sm,
	},
	statLabel: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	sectionHeaderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: spacing.sm,
	},
	sectionTitle: {
		...typography.h4,
		color: colors.text,
	},
	viewAllText: {
		...typography.bodySmMedium,
		color: colors.primary,
	},
	quickStartList: {
		paddingBottom: spacing.base,
		gap: spacing.sm,
	},
	quickStartCard: {
		width: 216,
		minHeight: 150,
		justifyContent: 'space-between',
	},
	listFooterSpacer: {
		width: spacing.xs,
	},
	quickStartTitle: {
		...typography.bodyMedium,
		color: colors.text,
		marginTop: spacing.sm,
	},
	quickStartSubtitle: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	planSkeletonColumn: {
		gap: spacing.sm,
	},
	planList: {
		gap: spacing.sm,
	},
});

export default HomeScreen;
