import React, { useCallback, useMemo, useState } from 'react';
import {
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	SafeAreaView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useDeletePlan, useUpdatePlan } from '../../features/plans/hooks/useCreatePlan';
import { usePlans } from '../../features/plans/hooks/usePlans';
import BottomSheet from '../../shared/components/BottomSheet';
import Button from '../../shared/components/Button';
import Chip from '../../shared/components/Chip';
import EmptyState from '../../shared/components/EmptyState';
import ErrorView from '../../shared/components/ErrorView';
import PlanCard from '../../shared/components/PlanCard';
import SkeletonLoader from '../../shared/components/SkeletonLoader';
import { Plan } from '../../shared/types/plan';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, shadows, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type PlanFilter = 'all' | 'favorites' | 'beginner' | 'intermediate' | 'advanced';

interface FilterOption {
	key: PlanFilter;
	label: string;
}

const filterOptions: FilterOption[] = [
	{ key: 'all', label: 'Tumu' },
	{ key: 'favorites', label: 'Favoriler' },
	{ key: 'beginner', label: 'Baslangic' },
	{ key: 'intermediate', label: 'Orta' },
	{ key: 'advanced', label: 'Ileri' },
];

const PlansScreen = () => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const plansQuery = usePlans();
	const updatePlanMutation = useUpdatePlan();
	const deletePlanMutation = useDeletePlan();

	const [activeFilter, setActiveFilter] = useState<PlanFilter>('all');
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
	const [isRefreshing, setRefreshing] = useState(false);

	const plans = useMemo(() => (Array.isArray(plansQuery.data) ? plansQuery.data : []), [plansQuery.data]);

	const filteredPlans = useMemo(() => {
		switch (activeFilter) {
			case 'favorites':
				return plans.filter(plan => Boolean(plan.favorite));
			case 'beginner':
			case 'intermediate':
			case 'advanced':
				return plans.filter(plan => plan.difficulty === activeFilter);
			case 'all':
			default:
				return plans;
		}
	}, [activeFilter, plans]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await plansQuery.refetch();
		setRefreshing(false);
	}, [plansQuery]);

	const openPlanDetail = useCallback(
		(planId: string) => {
			navigation.navigate('PlanDetail', { planId });
		},
		[navigation],
	);

	const renderFilterItem = useCallback(
		({ item }: { item: FilterOption }) => (
			<Chip
				label={item.label}
				selected={activeFilter === item.key}
				onPress={() => setActiveFilter(item.key)}
				icon={item.key === 'favorites' ? 'star-outline' : undefined}
			/>
		),
		[activeFilter],
	);

	const toggleFavorite = useCallback(
		async (plan: Plan) => {
			try {
				await updatePlanMutation.mutateAsync({ id: plan.id, data: { favorite: !plan.favorite } });
			} catch {
				Toast.show({
					type: 'error',
					position: 'top',
					text1: 'İşlem Başarısız',
					text2: 'Favori bilgisi Güncellenemedi.',
				});
			}
		},
		[updatePlanMutation],
	);

	const togglePin = useCallback(
		async (plan: Plan) => {
			try {
				await updatePlanMutation.mutateAsync({ id: plan.id, data: { pin: !plan.pin } });
			} catch {
				Toast.show({
					type: 'error',
					position: 'top',
					text1: 'İşlem Başarısız',
					text2: 'Sabitleme bilgisi Güncellenemedi.',
				});
			}
		},
		[updatePlanMutation],
	);

	const renderPlanItem = useCallback(
		({ item }: { item: Plan }) => (
			<PlanCard
				plan={item}
				onPress={openPlanDetail}
				onToggleFavorite={toggleFavorite}
				onTogglePin={togglePin}
				onLongPress={setSelectedPlan}
				actionsDisabled={updatePlanMutation.isPending || deletePlanMutation.isPending}
				progress={0}
			/>
		),
		[deletePlanMutation.isPending, openPlanDetail, toggleFavorite, togglePin, updatePlanMutation.isPending],
	);

	const handleDelete = useCallback(
		(plan: Plan) => {
			Alert.alert('Planı sil', 'Bu planı silmek istediğinize emin misiniz?', [
				{ text: 'İptal', style: 'cancel' },
				{
					text: 'Sil',
					style: 'destructive',
					onPress: async () => {
						try {
							await deletePlanMutation.mutateAsync(plan.id);
							setSelectedPlan(null);
							Toast.show({
								type: 'success',
								position: 'top',
								text1: 'Plan silindi',
								text2: 'Plan listenizden kaldırıldı.',
							});
						} catch {
							Toast.show({
								type: 'error',
								position: 'top',
								text1: 'Silme Başarısız',
								text2: 'Plan silinemedi. Lütfen tekrar deneyin.',
							});
						}
					},
				},
			]);
		},
		[deletePlanMutation],
	);

	if (plansQuery.isLoading && !plansQuery.data) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.loadingContent}>
					{Array.from({ length: 3 }).map((_, index) => (
						<SkeletonLoader key={`plans-skeleton-${index}`} width="100%" height={176} borderRadius={radius.lg} />
					))}
				</View>
			</SafeAreaView>
		);
	}

	if (plansQuery.isError) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
				<View style={styles.errorWrap}>
					<ErrorView
						type="generic"
						title="Planlar Yüklenemedi"
						description="Liste şu anda getirilemiyor. Lütfen tekrar deneyin."
						onRetry={() => {
							void plansQuery.refetch();
						}}
					/>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<View style={styles.container}>
				<View style={styles.headerRow}>
					<Text style={styles.title}>Planlarım</Text>
					<Pressable style={styles.filterButton} accessibilityRole="button" accessibilityLabel="Filtre seçenekleri">
						<MaterialCommunityIcons name="filter-variant" size={22} color={colors.primary} />
					</Pressable>
				</View>

				<FlatList
					horizontal
					data={filterOptions}
					keyExtractor={item => item.key}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filterList}
					renderItem={renderFilterItem}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews
					getItemLayout={(_, index) => ({ length: 116, offset: 116 * index, index })}
					ListHeaderComponent={<View />}
					ListFooterComponent={<View style={styles.listFooterSpacer} />}
				/>

				<FlatList
					data={filteredPlans}
					keyExtractor={item => item.id}
					contentContainerStyle={styles.listContent}
					refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
					renderItem={renderPlanItem}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews
					getItemLayout={(_, index) => ({ length: 186, offset: 186 * index, index })}
					ListHeaderComponent={<View />}
					ListFooterComponent={<View style={styles.listFooterBottom} />}
					ListEmptyComponent={
						<EmptyState
							icon="calendar-plus"
							title="Henüz plan oluşturmadınız"
							description="Sağ alttaki buton ile ilk planınızı oluşturabilirsiniz."
						/>
					}
				/>

				<Pressable
					style={styles.fab}
					onPress={() => navigation.navigate('CreatePlan')}
					accessibilityRole="button"
					accessibilityLabel="Yeni plan oluştur"
				>
					<MaterialCommunityIcons name="plus" size={28} color={colors.textOnPrimary} />
				</Pressable>
			</View>

			<BottomSheet
				visible={Boolean(selectedPlan)}
				onClose={() => setSelectedPlan(null)}
				title="Plan İşlemleri"
			>
				<View style={styles.sheetActions}>
					<Button
						title={selectedPlan?.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
						onPress={() => {
							if (selectedPlan) {
								void toggleFavorite(selectedPlan);
							}
							setSelectedPlan(null);
						}}
						variant="ghost"
						size="md"
						fullWidth
						icon="star-outline"
						accessibilityLabel="Favori işlemi"
					/>
					<Button
						title={selectedPlan?.pin ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
						onPress={() => {
							if (selectedPlan) {
								void togglePin(selectedPlan);
							}
							setSelectedPlan(null);
						}}
						variant="ghost"
						size="md"
						fullWidth
						icon="pin-outline"
						accessibilityLabel="Sabitleme işlemi"
					/>
					<Button
						title="Planı Sil"
						onPress={() => {
							if (selectedPlan) {
								handleDelete(selectedPlan);
							}
						}}
						variant="danger"
						size="md"
						fullWidth
						icon="delete-outline"
						accessibilityLabel="Planı sil"
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
	loadingContent: {
		paddingHorizontal: spacing.base,
		paddingTop: spacing.base,
		gap: spacing.sm,
	},
	errorWrap: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing.base,
	},
	headerRow: {
		paddingHorizontal: spacing.base,
		paddingTop: spacing.sm,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	title: {
		...typography.h2,
		color: colors.text,
	},
	filterButton: {
		width: 38,
		height: 38,
		borderRadius: radius.full,
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterList: {
		paddingHorizontal: spacing.base,
		paddingVertical: spacing.base,
		gap: spacing.xs,
	},
	listContent: {
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.huge,
		gap: spacing.sm,
	},
	listFooterSpacer: {
		width: spacing.xs,
	},
	listFooterBottom: {
		height: spacing.xs,
	},
	fab: {
		position: 'absolute',
		right: spacing.base,
		bottom: spacing.base,
		width: 58,
		height: 58,
		borderRadius: radius.full,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		...shadows.lg,
	},
	sheetActions: {
		gap: spacing.sm,
		paddingBottom: spacing.base,
	},
});

export default PlansScreen;
