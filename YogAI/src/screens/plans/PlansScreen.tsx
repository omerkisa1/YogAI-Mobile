import React from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useDeletePlan } from '../../features/plans/hooks/useCreatePlan';
import { usePlans } from '../../features/plans/hooks/usePlans';
import { Plan } from '../../shared/types/plan';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

const PlansScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const plansQuery = usePlans();
	const deletePlanMutation = useDeletePlan();

	const handleDelete = (planId: string) => {
		Alert.alert('Plani Sil', 'Bu plani silmek istediginize emin misiniz?', [
			{ text: 'Vazgec', style: 'cancel' },
			{
				text: 'Sil',
				style: 'destructive',
				onPress: () => {
					deletePlanMutation.mutate(planId);
				},
			},
		]);
	};

	const renderPlan = ({ item }: { item: Plan }) => {
		return (
			<Card
				style={styles.planCard}
				onPress={() => navigation.navigate('PlanDetail', { planId: item.id })}
			>
				<Pressable onLongPress={() => handleDelete(item.id)} delayLongPress={400}>
					<View style={styles.planRow}>
						<View style={styles.planInfo}>
							<Text style={styles.planTitle}>{item.title_tr || item.title_en}</Text>
							<Text style={styles.planMeta}>
								{item.total_duration_min}dk • {item.difficulty} • {item.focus_area}
							</Text>
						</View>
						<Ionicons
							name={item.favorite ? 'heart' : 'heart-outline'}
							color={item.favorite ? colors.error : colors.textMuted}
							size={20}
						/>
					</View>
				</Pressable>
			</Card>
		);
	};

	if (plansQuery.isLoading) {
		return <LoadingScreen message="Planlar yukleniyor..." />;
	}

	if (plansQuery.isError) {
		return <ErrorView message="Planlar alinamadi." onRetry={plansQuery.refetch} />;
	}

	const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];

	return (
		<View style={styles.container}>
			{plans.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyTitle}>Henüz planiniz yok.</Text>
					<Text style={styles.emptySubtitle}>Hemen olusturun!</Text>
				</View>
			) : (
				<FlatList
					data={plans}
					keyExtractor={item => item.id}
					renderItem={renderPlan}
					contentContainerStyle={styles.listContent}
					refreshControl={<RefreshControl refreshing={plansQuery.isRefetching} onRefresh={plansQuery.refetch} />}
				/>
			)}

			<Pressable style={styles.fab} onPress={() => navigation.navigate('CreatePlan')}>
				<Ionicons name="add" size={28} color={colors.text} />
			</Pressable>
		</View>
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
	planCard: {
		padding: spacing.md,
	},
	planRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	planInfo: {
		flex: 1,
		marginRight: spacing.sm,
		gap: spacing.xs,
	},
	planTitle: {
		...typography.h3,
		color: colors.text,
	},
	planMeta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	emptyContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
	},
	emptyTitle: {
		...typography.h3,
		color: colors.text,
	},
	emptySubtitle: {
		...typography.body,
		color: colors.textSecondary,
	},
	fab: {
		position: 'absolute',
		right: spacing.lg,
		bottom: spacing.lg,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000000',
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
		elevation: 8,
	},
});

export default PlansScreen;
