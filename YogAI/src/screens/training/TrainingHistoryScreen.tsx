import React, { useCallback, useMemo, useState } from 'react';
import {
	FlatList,
	Pressable,
	RefreshControl,
	SafeAreaView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTrainingSessions, useTrainingStats } from '../../features/training/hooks/useTraining';
import Card from '../../shared/components/Card';
import EmptyState from '../../shared/components/EmptyState';
import ErrorView from '../../shared/components/ErrorView';
import ProgressBar from '../../shared/components/ProgressBar';
import SkeletonLoader from '../../shared/components/SkeletonLoader';
import { TrainingSession } from '../../shared/types/training';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const formatDate = (dateStr: string) => {
	const date = new Date(dateStr);
	return date.toLocaleDateString('tr-TR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

const formatMinutes = (seconds?: number) => {
	if (!seconds) {
		return '0dk';
	}

	return `${Math.max(1, Math.round(seconds / 60))}dk`;
};

const formatHours = (seconds?: number) => {
	if (!seconds) {
		return '0';
	}

	return (seconds / 3600).toFixed(1);
};

const TrainingHistoryScreen = () => {
	const sessionsQuery = useTrainingSessions();
	const statsQuery = useTrainingStats();
	const [refreshing, setRefreshing] = useState(false);

	const sessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);
	const stats = statsQuery.data ?? {
		total_sessions: 0,
		total_duration_sec: 0,
		average_accuracy: 0,
		current_streak: 0,
	};

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await Promise.allSettled([sessionsQuery.refetch(), statsQuery.refetch()]);
		setRefreshing(false);
	}, [sessionsQuery, statsQuery]);

	if ((sessionsQuery.isLoading && !sessionsQuery.data) || (statsQuery.isLoading && !statsQuery.data)) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.loadingWrap}>
					<SkeletonLoader width="100%" height={132} borderRadius={radius.lg} />
					<SkeletonLoader width="100%" height={128} borderRadius={radius.lg} />
					<SkeletonLoader width="100%" height={128} borderRadius={radius.lg} />
				</View>
			</SafeAreaView>
		);
	}

	if (sessionsQuery.isError || statsQuery.isError) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.errorWrap}>
					<ErrorView
						type="generic"
						title="Antrenman verileri yuklenemedi"
						description="Lutfen internet baglantinizi kontrol ederek tekrar deneyin."
						onRetry={() => {
							void onRefresh();
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const renderSessionItem = ({ item }: { item: TrainingSession }) => {
		const sessionAccuracy = Math.round(item.average_accuracy ?? 0);
		const durationLabel = formatMinutes(item.total_duration_sec);
		const completedMoveCount = item.results?.length ?? 0;

		return (
			<Pressable
				onPress={() => {
					Toast.show({
						type: 'info',
						position: 'top',
						text1: 'Detay yakinda',
						text2: 'Antrenman detay ekrani sonraki adimda eklenecek.',
					});
				}}
				style={styles.sessionPressable}
				accessibilityRole="button"
				accessibilityLabel="Antrenman oturumu detay"
			>
				<Card variant="default" style={styles.sessionCard}>
					<Text style={styles.sessionTitle}>Plan #{item.plan_id.slice(0, 8)}</Text>
					<Text style={styles.sessionMeta}>{formatDate(item.started_at)} • {durationLabel}</Text>
					<Text style={styles.sessionScore}>Skor: %{sessionAccuracy}</Text>
					<ProgressBar progress={sessionAccuracy} color={colors.success} />
					<Text style={styles.sessionMoves}>{completedMoveCount} hareket tamamlandi</Text>
				</Card>
			</Pressable>
		);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<FlatList
				data={sessions}
				keyExtractor={item => item.id}
				renderItem={renderSessionItem}
				contentContainerStyle={styles.listContent}
				maxToRenderPerBatch={10}
				windowSize={5}
				removeClippedSubviews
				getItemLayout={(_, index) => ({ length: 142, offset: 142 * index, index })}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
				ListHeaderComponent={
					<View>
						<Text style={styles.pageTitle}>Antrenmanlarim</Text>
						<Card variant="elevated" style={styles.statsCard}>
							<Text style={styles.statsLine}>Toplam: {stats.total_sessions} antrenman</Text>
							<Text style={styles.statsLine}>Ortalama skor: %{Math.round(stats.average_accuracy)}</Text>
							<Text style={styles.statsLine}>Toplam sure: {formatHours(stats.total_duration_sec)} saat</Text>
							<ProgressBar progress={Math.round(stats.average_accuracy)} color={colors.primary} />
						</Card>
					</View>
				}
				ListEmptyComponent={
					<EmptyState
						icon="meditation"
						title="Henuz antrenman yapmadiniz"
						description="Ilk antrenmaniniza baslayarak ilerlemenizi takip edin."
					/>
				}
				ListFooterComponent={<View style={styles.listFooter} />}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	loadingWrap: {
		paddingHorizontal: spacing.base,
		paddingTop: spacing.base,
		gap: spacing.sm,
	},
	errorWrap: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing.base,
	},
	listContent: {
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.xxl,
		gap: spacing.sm,
	},
	listFooter: {
		height: spacing.xs,
	},
	pageTitle: {
		...typography.h2,
		color: colors.text,
		marginTop: spacing.sm,
		marginBottom: spacing.sm,
	},
	statsCard: {
		gap: spacing.sm,
		marginBottom: spacing.base,
	},
	statsLine: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	sessionPressable: {
		borderRadius: radius.lg,
	},
	sessionCard: {
		gap: spacing.xs,
	},
	sessionTitle: {
		...typography.bodyMedium,
		color: colors.text,
	},
	sessionMeta: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	sessionScore: {
		...typography.bodySmMedium,
		color: colors.text,
		marginTop: spacing.xs,
	},
	sessionMoves: {
		...typography.caption,
		color: colors.textMuted,
	},
});

export default TrainingHistoryScreen;
