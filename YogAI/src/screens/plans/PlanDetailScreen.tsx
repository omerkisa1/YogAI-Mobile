import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	Animated,
	Pressable,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useDeletePlan, useUpdatePlan } from '../../features/plans/hooks/useCreatePlan';
import { usePlan } from '../../features/plans/hooks/usePlan';
import { useStartTrainingSession } from '../../features/training/hooks/useTraining';
import Badge from '../../shared/components/Badge';
import BottomSheet from '../../shared/components/BottomSheet';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import DifficultyIndicator from '../../shared/components/DifficultyIndicator';
import ErrorView from '../../shared/components/ErrorView';
import LoadingView from '../../shared/components/LoadingView';
import ProgressBar from '../../shared/components/ProgressBar';
import { Exercise, Plan } from '../../shared/types/plan';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanDetail'>;

const categoryColorMap: Record<string, string> = {
	standing: colors.categoryStanding,
	seated: colors.categorySeated,
	prone: colors.categoryProne,
	supine: colors.categorySupine,
	inversion: colors.categoryInversion,
};

const levelLabelMap: Record<Plan['difficulty'], string> = {
	beginner: 'Baslangic',
	intermediate: 'Orta',
	advanced: 'Ileri',
};

const focusLabelMap: Record<string, string> = {
	full_body: 'Tam Vucut',
	legs: 'Bacaklar',
	back: 'Sirt',
	core: 'Core',
	balance: 'Denge',
	flexibility: 'Esneklik',
	arms: 'Kollar',
	hips: 'Kalca',
};

const difficultyToScale = (level: Plan['difficulty']) => {
	switch (level) {
		case 'beginner':
			return 1;
		case 'intermediate':
			return 3;
		case 'advanced':
		default:
			return 5;
	}
};

const ExerciseItem = ({
	exercise,
	index,
	expanded,
	onToggle,
	animatedValue,
	difficultyScale,
}: {
	exercise: Exercise;
	index: number;
	expanded: boolean;
	onToggle: () => void;
	animatedValue: Animated.Value;
	difficultyScale: number;
}) => {
	const animatedHeight = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 140],
	});
	const animatedOpacity = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 1],
	});
	const categoryColor = categoryColorMap[exercise.category] ?? colors.textMuted;
	const categoryLabel = exercise.category || 'unknown';

	return (
		<Pressable
			onPress={onToggle}
			style={styles.exercisePressable}
			accessibilityRole="button"
			accessibilityLabel={`${exercise.name_tr || exercise.name_en} acilir kart`}
		>
			<Card variant="default" style={styles.exerciseCard}>
				<Text style={styles.exerciseTitle}>
					{index + 1}. {exercise.name_tr || exercise.name_en}
				</Text>
				<View style={styles.exerciseMetaRow}>
					<Badge text={categoryLabel} backgroundColor={`${categoryColor}22`} textColor={categoryColor} />
					<DifficultyIndicator difficulty={difficultyScale} size="sm" />
				</View>
				<Text style={styles.exerciseDuration}>{exercise.duration_min} dakika</Text>
				<View style={styles.analyzableRow}>
					<MaterialCommunityIcons
						name={exercise.is_analyzable ? 'camera-outline' : 'camera-off-outline'}
						size={18}
						color={exercise.is_analyzable ? colors.primary : colors.textMuted}
					/>
					<Text style={[styles.analyzableText, exercise.is_analyzable && styles.analyzableTextActive]}>
						{exercise.is_analyzable ? 'Analiz edilebilir' : 'Analiz edilemez'}
					</Text>
				</View>

				<Animated.View style={[styles.exerciseDescriptionWrap, { maxHeight: animatedHeight, opacity: animatedOpacity }]}>
					<Text style={styles.exerciseDescription}>{exercise.instructions_tr || exercise.instructions_en}</Text>
				</Animated.View>

				<View style={styles.expandHintRow}>
					<Text style={styles.expandHintText}>{expanded ? 'Ayrintiyi daralt' : 'Ayrintiyi genislet'}</Text>
					<MaterialCommunityIcons
						name={expanded ? 'chevron-up' : 'chevron-down'}
						size={18}
						color={colors.textMuted}
					/>
				</View>
			</Card>
		</Pressable>
	);
};

const PlanDetailScreen = ({ route, navigation }: Props) => {
	const { planId } = route.params;
	const insets = useSafeAreaInsets();
	const planQuery = usePlan(planId);
	const updatePlanMutation = useUpdatePlan();
	const deletePlanMutation = useDeletePlan();
	const startSessionMutation = useStartTrainingSession();

	const [isDeleteSheetVisible, setDeleteSheetVisible] = useState(false);
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
	const animationValuesRef = useRef<Record<string, Animated.Value>>({});

	const plan = planQuery.data;

	const getAnimatedValue = (key: string) => {
		if (!animationValuesRef.current[key]) {
			animationValuesRef.current[key] = new Animated.Value(0);
		}

		return animationValuesRef.current[key];
	};

	const toggleExpanded = (key: string) => {
		const nextExpanded = !expandedItems[key];
		setExpandedItems(prev => ({ ...prev, [key]: nextExpanded }));

		Animated.timing(getAnimatedValue(key), {
			toValue: nextExpanded ? 1 : 0,
			duration: 220,
			useNativeDriver: false,
		}).start();
	};

	useLayoutEffect(() => {
		if (!plan) {
			return;
		}

		navigation.setOptions({
			headerRight: () => (
				<View style={styles.headerActions}>
					<Pressable
						onPress={() => {
							updatePlanMutation.mutate({ id: planId, data: { favorite: !plan.favorite } });
						}}
						style={styles.headerActionButton}
						accessibilityRole="button"
						accessibilityLabel="Favori degistir"
					>
						<MaterialCommunityIcons
							name={plan.favorite ? 'star' : 'star-outline'}
							size={22}
							color={plan.favorite ? colors.warning : colors.primary}
						/>
					</Pressable>
					<Pressable
						onPress={() => {
							updatePlanMutation.mutate({ id: planId, data: { pin: !plan.pin } });
						}}
						style={styles.headerActionButton}
						accessibilityRole="button"
						accessibilityLabel="Sabitleme degistir"
					>
						<MaterialCommunityIcons
							name={plan.pin ? 'pin' : 'pin-outline'}
							size={22}
							color={plan.pin ? colors.accent : colors.primary}
						/>
					</Pressable>
					<Pressable
						onPress={() => setDeleteSheetVisible(true)}
						style={styles.headerActionButton}
						accessibilityRole="button"
						accessibilityLabel="Plan menu"
					>
						<MaterialCommunityIcons name="dots-vertical" size={22} color={colors.primary} />
					</Pressable>
				</View>
			),
		});
	}, [navigation, plan, planId, updatePlanMutation]);

	const onDeletePlan = async () => {
		try {
			await deletePlanMutation.mutateAsync(planId);
			setDeleteSheetVisible(false);
			Toast.show({
				type: 'success',
				position: 'top',
				text1: 'Plan silindi',
				text2: 'Plan listenizden kaldirildi.',
			});
			navigation.goBack();
		} catch {
			Toast.show({
				type: 'error',
				position: 'top',
				text1: 'Silme basarisiz',
				text2: 'Plan silinemedi. Lutfen tekrar deneyin.',
			});
		}
	};

	const onStartTraining = async () => {
		if (!plan) {
			return;
		}

		try {
			const session = await startSessionMutation.mutateAsync(plan.id);
			Toast.show({
				type: 'success',
				position: 'top',
				text1: 'Antrenman basladi',
				text2: 'Kamera entegrasyonu sonraki adimda aktif olacak.',
			});
			navigation.navigate('TrainingSession', { planId: plan.id, sessionId: session.session_id });
		} catch {
			Toast.show({
				type: 'error',
				position: 'top',
				text1: 'Antrenman baslatilamadi',
				text2: 'Lutfen tekrar deneyin.',
			});
		}
	};

	if (planQuery.isLoading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<LoadingView message="Plan detayi yukleniyor..." fullScreen />
			</SafeAreaView>
		);
	}

	if (planQuery.isError || !plan) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.errorWrap}>
					<ErrorView
						type="notfound"
						title="Plan bulunamadi"
						description="Plan detaylari su anda getirilemiyor."
						onRetry={() => {
							void planQuery.refetch();
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	const difficultyScale = difficultyToScale(plan.difficulty);
	const analyzableCount = plan.analyzable_pose_count ?? 0;
	const totalPoses = plan.total_pose_count || plan.exercises.length || 1;
	const analyzableProgress = (analyzableCount / totalPoses) * 100;
	const levelLabel = levelLabelMap[plan.difficulty];
	const focusLabel = focusLabelMap[plan.focus_area] ?? plan.focus_area;

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>{plan.title_tr || plan.title_en}</Text>
				<View style={styles.topBadges}>
					<Badge text={levelLabel} variant="primary" />
					<Badge text={focusLabel} variant="secondary" />
					<Badge text={`${plan.total_duration_min} dk`} variant="info" />
				</View>
				<Text style={styles.description}>{plan.description_tr || plan.description_en}</Text>

				<Card variant="elevated" style={styles.analysisCard}>
					<View style={styles.analysisHeader}>
						<MaterialCommunityIcons name="camera" size={22} color={colors.primary} />
						<Text style={styles.analysisTitle}>
							{analyzableCount} / {totalPoses} hareket kamera ile analiz edilebilir
						</Text>
					</View>
					<ProgressBar progress={analyzableProgress} color={colors.primary} />
				</Card>

				<Text style={styles.sectionTitle}>Egzersiz Listesi</Text>
				<View style={styles.exerciseList}>
					{plan.exercises.map((exercise, index) => {
						const key = `${exercise.pose_id}-${index}`;
						const expanded = Boolean(expandedItems[key]);
						const animatedValue = getAnimatedValue(key);

						return (
							<ExerciseItem
								key={key}
								exercise={exercise}
								index={index}
								expanded={expanded}
								onToggle={() => toggleExpanded(key)}
								animatedValue={animatedValue}
								difficultyScale={difficultyScale}
							/>
						);
					})}
				</View>
			</ScrollView>

			<View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
				<Button
					title="Antrenmani Baslat"
					onPress={onStartTraining}
					variant="primary"
					size="lg"
					fullWidth
					icon="play-circle-outline"
					loading={startSessionMutation.isPending}
					disabled={startSessionMutation.isPending}
					accessibilityLabel="Antrenmani baslat"
				/>
			</View>

			<BottomSheet
				visible={isDeleteSheetVisible}
				onClose={() => setDeleteSheetVisible(false)}
				title="Plani Sil"
			>
				<Text style={styles.deletePrompt}>Bu plani silmek istediginize emin misiniz?</Text>
				<View style={styles.deleteActions}>
					<Button
						title="Iptal"
						onPress={() => setDeleteSheetVisible(false)}
						variant="ghost"
						size="md"
						fullWidth
						accessibilityLabel="Plan silmeyi iptal et"
					/>
					<Button
						title="Sil"
						onPress={() => {
							void onDeletePlan();
						}}
						variant="danger"
						size="md"
						fullWidth
						loading={deletePlanMutation.isPending}
						disabled={deletePlanMutation.isPending}
						accessibilityLabel="Plani sil"
					/>
				</View>
			</BottomSheet>
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
		paddingTop: spacing.sm,
	},
	errorWrap: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing.base,
	},
	headerActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
	},
	headerActionButton: {
		width: 30,
		height: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		...typography.h2,
		color: colors.text,
	},
	topBadges: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.xs,
		marginTop: spacing.sm,
		marginBottom: spacing.sm,
	},
	description: {
		...typography.body,
		color: colors.textSecondary,
	},
	analysisCard: {
		marginTop: spacing.base,
		gap: spacing.sm,
	},
	analysisHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	analysisTitle: {
		...typography.bodySmMedium,
		color: colors.text,
		flex: 1,
	},
	sectionTitle: {
		...typography.h4,
		color: colors.text,
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},
	exerciseList: {
		gap: spacing.sm,
	},
	exercisePressable: {
		borderRadius: radius.lg,
	},
	exerciseCard: {
		gap: spacing.xs,
	},
	exerciseTitle: {
		...typography.bodyMedium,
		color: colors.text,
	},
	exerciseMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: spacing.xs,
	},
	exerciseDuration: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	analyzableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
	},
	analyzableText: {
		...typography.captionMedium,
		color: colors.textMuted,
	},
	analyzableTextActive: {
		color: colors.primary,
	},
	exerciseDescriptionWrap: {
		overflow: 'hidden',
	},
	exerciseDescription: {
		...typography.bodySm,
		color: colors.textSecondary,
		paddingTop: spacing.xs,
	},
	expandHintRow: {
		marginTop: spacing.xs,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	expandHintText: {
		...typography.caption,
		color: colors.textMuted,
	},
	bottomBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: spacing.sm,
		paddingHorizontal: spacing.base,
		backgroundColor: colors.surface,
		borderTopWidth: 1,
		borderTopColor: colors.borderLight,
	},
	deletePrompt: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginBottom: spacing.base,
	},
	deleteActions: {
		gap: spacing.sm,
	},
});

export default PlanDetailScreen;
