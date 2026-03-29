import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDeletePlan, useUpdatePlan } from '../../features/plans/hooks/useCreatePlan';
import { usePlan } from '../../features/plans/hooks/usePlan';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetail'>;

const PlanDetailScreen = ({ route, navigation }: Props) => {
	const { planId } = route.params;
	const planQuery = usePlan(planId);
	const updatePlanMutation = useUpdatePlan();
	const deletePlanMutation = useDeletePlan();

	if (planQuery.isLoading) {
		return <LoadingScreen message="Plan detayi yukleniyor..." />;
	}

	if (planQuery.isError || !planQuery.data) {
		return <ErrorView message="Plan detayi getirilemedi." onRetry={planQuery.refetch} />;
	}

	const plan = planQuery.data;

	const onToggleFavorite = () => {
		updatePlanMutation.mutate({ id: planId, data: { favorite: !Boolean(plan.favorite) } });
	};

	const onTogglePin = () => {
		updatePlanMutation.mutate({ id: planId, data: { pin: !Boolean(plan.pin) } });
	};

	const onDelete = () => {
		Alert.alert('Plani Sil', 'Bu plani silmek istediginize emin misiniz?', [
			{ text: 'Vazgec', style: 'cancel' },
			{
				text: 'Sil',
				style: 'destructive',
				onPress: async () => {
					try {
						await deletePlanMutation.mutateAsync(planId);
						navigation.goBack();
					} catch {
						Toast.show({
							type: 'error',
							text1: 'Silme basarisiz',
						});
					}
				},
			},
		]);
	};

	const onStartTraining = () => {
		if (__DEV__) {
			console.log('Kamera entegrasyonu yakinda. Plan ID:', planId);
		}
		Toast.show({
			type: 'info',
			text1: 'Yakinda',
			text2: 'Kamera entegrasyonu yakinda eklenecek.',
		});
	};

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View style={styles.topRow}>
				<Text style={styles.title}>{plan.title_tr || plan.title_en}</Text>
				<View style={styles.iconRow}>
					<Pressable onPress={onToggleFavorite} style={styles.iconButton}>
						<Ionicons name={plan.favorite ? 'star' : 'star-outline'} size={22} color={colors.warning} />
					</Pressable>
					<Pressable onPress={onTogglePin} style={styles.iconButton}>
						<Ionicons name={plan.pin ? 'pin' : 'pin-outline'} size={22} color={colors.primaryLight} />
					</Pressable>
				</View>
			</View>

			<Text style={styles.meta}>
				{plan.difficulty} • {plan.focus_area} • {plan.total_duration_min}dk
			</Text>
			<Text style={styles.meta}>📷 {plan.analyzable_pose_count}/{plan.total_pose_count} poz analiz edilebilir</Text>
			<Text style={styles.description}>{plan.description_tr || plan.description_en}</Text>

			<Text style={styles.sectionTitle}>Egzersizler</Text>
			{plan.exercises.map((exercise, index) => (
				<Card key={`${exercise.pose_id}-${index}`} style={styles.exerciseCard}>
					<Text style={styles.exerciseTitle}>
						{index + 1}. {exercise.name_tr || exercise.name_en} ({exercise.duration_min}dk)
					</Text>
					<Text style={styles.exerciseMeta}>
						{exercise.is_analyzable ? '📷 Analiz edilebilir' : '❌ Analiz edilemez'}
					</Text>
				</Card>
			))}

			<Button label="▶ Antrenmani Baslat" onPress={onStartTraining} />
			<Button
				label="Plani Sil"
				onPress={onDelete}
				variant="outline"
				loading={deletePlanMutation.isPending}
			/>
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
		paddingBottom: spacing.xxl,
	},
	topRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: spacing.sm,
	},
	title: {
		...typography.h2,
		color: colors.text,
		flex: 1,
	},
	iconRow: {
		flexDirection: 'row',
		gap: spacing.xs,
	},
	iconButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
	},
	meta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	description: {
		...typography.body,
		color: colors.text,
	},
	sectionTitle: {
		...typography.h3,
		color: colors.text,
		marginTop: spacing.sm,
	},
	exerciseCard: {
		gap: spacing.xs,
	},
	exerciseTitle: {
		...typography.body,
		color: colors.text,
	},
	exerciseMeta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
});

export default PlanDetailScreen;
