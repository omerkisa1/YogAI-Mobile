import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTrainingSessions } from '../../features/training/hooks/useTraining';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import { TrainingSession } from '../../shared/types/training';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const TrainingHistoryScreen = () => {
	const sessionsQuery = useTrainingSessions();

	if (sessionsQuery.isLoading) {
		return <LoadingScreen message="Antrenman gecmisi yukleniyor..." />;
	}

	if (sessionsQuery.isError) {
		return <ErrorView message="Antrenman gecmisi alinamadi." onRetry={sessionsQuery.refetch} />;
	}

	const sessions = sessionsQuery.data ?? [];

	if (sessions.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyTitle}>Henuz antrenman gecmisi yok.</Text>
				<Text style={styles.emptySubtitle}>Bir plan baslatarak gecmisinizi olusturun.</Text>
			</View>
		);
	}

	const renderItem = ({ item }: { item: TrainingSession }) => {
		return (
			<Card style={styles.card}>
				<Text style={styles.cardTitle}>Plan: {item.plan_id}</Text>
				<Text style={styles.cardMeta}>Durum: {item.status}</Text>
				<Text style={styles.cardMeta}>Baslangic: {new Date(item.started_at).toLocaleString()}</Text>
				<Text style={styles.cardMeta}>Ortalama Dogruluk: %{Math.round(item.average_accuracy ?? 0)}</Text>
			</Card>
		);
	};

	return (
		<FlatList
			style={styles.container}
			contentContainerStyle={styles.listContent}
			data={sessions}
			keyExtractor={item => item.id}
			renderItem={renderItem}
			onRefresh={sessionsQuery.refetch}
			refreshing={sessionsQuery.isRefetching}
		/>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	listContent: {
		padding: spacing.lg,
		gap: spacing.md,
		paddingBottom: spacing.xxl,
	},
	card: {
		gap: spacing.xs,
	},
	cardTitle: {
		...typography.body,
		color: colors.text,
	},
	cardMeta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.lg,
		backgroundColor: colors.background,
		gap: spacing.sm,
	},
	emptyTitle: {
		...typography.h3,
		color: colors.text,
		textAlign: 'center',
	},
	emptySubtitle: {
		...typography.body,
		color: colors.textSecondary,
		textAlign: 'center',
	},
});

export default TrainingHistoryScreen;
