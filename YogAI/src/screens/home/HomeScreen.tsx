import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePlans } from '../../features/plans/hooks/usePlans';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { useTrainingStats } from '../../features/training/hooks/useTraining';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import Button from '../../shared/components/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

const HomeScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const profileQuery = useProfile();
	const plansQuery = usePlans();
	const statsQuery = useTrainingStats();

	const isLoading = profileQuery.isLoading || plansQuery.isLoading || statsQuery.isLoading;
	const hasError = profileQuery.isError || plansQuery.isError || statsQuery.isError;

	if (isLoading) {
		return <LoadingScreen message="Ana sayfa hazirlaniyor..." />;
	}

	if (hasError) {
		return (
			<ErrorView
				message="Ana sayfa verileri alinamadi."
				onRetry={() => {
					profileQuery.refetch();
					plansQuery.refetch();
					statsQuery.refetch();
				}}
			/>
		);
	}

	const profileName = profileQuery.data?.display_name || 'Yogi';
	const stats = statsQuery.data ?? {
		total_sessions: 0,
		average_accuracy: 0,
		total_duration_sec: 0,
		current_streak: 0,
	};

	const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];
	const latestPlans = plans.slice(0, 3);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<Text style={styles.welcome}>Merhaba, {profileName} 👋</Text>

			<Card>
				<Text style={styles.sectionTitle}>Istatistikler</Text>
				<View style={styles.statsGrid}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{stats.total_sessions}</Text>
						<Text style={styles.statLabel}>Antrenman</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>%{Math.round(stats.average_accuracy ?? 0)}</Text>
						<Text style={styles.statLabel}>Ortalama</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{(stats.total_duration_sec / 3600).toFixed(1)}</Text>
						<Text style={styles.statLabel}>Saat</Text>
					</View>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>🔥 {stats.current_streak}</Text>
						<Text style={styles.statLabel}>Seri</Text>
					</View>
				</View>
			</Card>

			<Text style={styles.sectionHeader}>Son Planlarim</Text>
			{latestPlans.length === 0 ? (
				<Card>
					<Text style={styles.emptyText}>Henüz planiniz yok. Hemen olusturun!</Text>
				</Card>
			) : (
				latestPlans.map(plan => (
					<Card key={plan.id} style={styles.planCard} onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}>
						<Text style={styles.planTitle}>{plan.title_tr || plan.title_en}</Text>
						<Text style={styles.planMeta}>
							{plan.difficulty} • {plan.focus_area} • {plan.total_duration_min}dk
						</Text>
					</Card>
				))
			)}

			<Button label="+ Yeni Plan Olustur" onPress={() => navigation.navigate('CreatePlan')} />
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
		gap: spacing.md,
	},
	welcome: {
		...typography.h2,
		color: colors.text,
	},
	sectionTitle: {
		...typography.h3,
		color: colors.text,
		marginBottom: spacing.md,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		rowGap: spacing.md,
	},
	statItem: {
		width: '50%',
		gap: spacing.xs,
	},
	statValue: {
		...typography.h2,
		color: colors.primaryLight,
	},
	statLabel: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	sectionHeader: {
		...typography.h3,
		color: colors.text,
	},
	planCard: {
		gap: spacing.xs,
	},
	planTitle: {
		...typography.body,
		color: colors.text,
	},
	planMeta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	emptyText: {
		...typography.body,
		color: colors.textSecondary,
		textAlign: 'center',
	},
});

export default HomeScreen;
