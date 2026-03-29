import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Plan } from '../types/plan';
import Badge from './Badge';
import Card from './Card';
import ProgressBar from './ProgressBar';

export interface PlanCardProps {
	plan: Plan;
	onPress: (planId: string) => void;
	onToggleFavorite?: (plan: Plan) => void;
	onTogglePin?: (plan: Plan) => void;
	onLongPress?: (plan: Plan) => void;
	actionsDisabled?: boolean;
	progress?: number;
}

const difficultyMeta: Record<Plan['difficulty'], { label: string; variant: 'success' | 'warning' | 'error' }> = {
	beginner: { label: 'Baslangic', variant: 'success' },
	intermediate: { label: 'Orta', variant: 'warning' },
	advanced: { label: 'Ileri', variant: 'error' },
};

const focusAreaLabelMap: Record<string, string> = {
	full_body: 'Tam Vucut',
	legs: 'Bacaklar',
	back: 'Sirt',
	core: 'Core',
	balance: 'Denge',
	flexibility: 'Esneklik',
	arms: 'Kollar',
	hips: 'Kalca',
};

const PlanCard = ({
	plan,
	onPress,
	onToggleFavorite,
	onTogglePin,
	onLongPress,
	actionsDisabled = false,
	progress = 0,
}: PlanCardProps) => {
	const difficulty = difficultyMeta[plan.difficulty];
	const focusArea = focusAreaLabelMap[plan.focus_area] ?? plan.focus_area;
	const analyzableCount = plan.analyzable_pose_count ?? 0;
	const totalPoses = plan.total_pose_count ?? plan.exercises?.length ?? 0;

	return (
		<Card
			variant="default"
			onPress={() => onPress(plan.id)}
			style={styles.card}
			accessibilityLabel={`${plan.title_tr || plan.title_en} plan karti`}
		>
			<Pressable
				onLongPress={onLongPress ? () => onLongPress(plan) : undefined}
				delayLongPress={260}
				accessibilityRole="button"
				accessibilityLabel="Plan seceneklerini ac"
			>
				<View style={styles.headerRow}>
					<Text numberOfLines={1} style={styles.title}>
						{plan.title_tr || plan.title_en}
					</Text>
					<View style={styles.actions}>
						<Pressable
							onPress={() => onToggleFavorite?.(plan)}
							disabled={actionsDisabled || !onToggleFavorite}
							style={styles.actionButton}
							accessibilityRole="button"
							accessibilityLabel="Favori durumu degistir"
						>
							<MaterialCommunityIcons
								name={plan.favorite ? 'star' : 'star-outline'}
								size={20}
								color={plan.favorite ? colors.warning : colors.textMuted}
							/>
						</Pressable>
						<Pressable
							onPress={() => onTogglePin?.(plan)}
							disabled={actionsDisabled || !onTogglePin}
							style={styles.actionButton}
							accessibilityRole="button"
							accessibilityLabel="Sabitleme durumu degistir"
						>
							<MaterialCommunityIcons
								name={plan.pin ? 'pin' : 'pin-outline'}
								size={20}
								color={plan.pin ? colors.accent : colors.textMuted}
							/>
						</Pressable>
					</View>
				</View>

				<View style={styles.badges}>
					<Badge text={difficulty.label} variant={difficulty.variant} size="sm" />
					<Badge text={focusArea} variant="primary" size="sm" />
				</View>

				<Text style={styles.metaText}>
					{plan.total_duration_min} dk • {totalPoses} hareket • {analyzableCount} analiz edilebilir
				</Text>

				<View style={styles.progressWrap}>
					<ProgressBar progress={progress} color={colors.primary} animated />
					<Text style={styles.progressLabel}>{Math.max(0, Math.round(progress))}% tamamlandi</Text>
				</View>
			</Pressable>
		</Card>
	);
};

const styles = StyleSheet.create({
	card: {
		gap: spacing.sm,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		...typography.bodyMedium,
		color: colors.text,
		flex: 1,
		marginRight: spacing.sm,
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
	},
	actionButton: {
		width: 30,
		height: 30,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: radius.full,
	},
	badges: {
		flexDirection: 'row',
		gap: spacing.xs,
		marginTop: spacing.xs,
	},
	metaText: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	progressWrap: {
		gap: spacing.xs,
		marginTop: spacing.xs,
	},
	progressLabel: {
		...typography.caption,
		color: colors.textMuted,
	},
});

export default PlanCard;
