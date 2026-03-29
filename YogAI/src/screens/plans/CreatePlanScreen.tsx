import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	Animated,
	Easing,
	FlatList,
	Pressable,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useCreatePlan } from '../../features/plans/hooks/useCreatePlan';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import Chip from '../../shared/components/Chip';
import ErrorView from '../../shared/components/ErrorView';
import {
	AppLanguage,
	CreatePlanRequest,
	FocusArea,
	Injury,
	Level,
} from '../../shared/types/plan';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePlan'>;

interface LevelOption {
	key: Level;
	label: string;
	description: string;
	icon: string;
}

interface FocusOption {
	key: FocusArea;
	label: string;
}

interface InjuryOption {
	key: Injury;
	label: string;
}

const levelOptions: LevelOption[] = [
	{ key: 'beginner', label: 'Baslangic', description: 'Yumusak akis', icon: 'leaf' },
	{ key: 'intermediate', label: 'Orta', description: 'Denge ve guc', icon: 'tree' },
	{ key: 'advanced', label: 'Ileri', description: 'Yuksek yogunluk', icon: 'fire' },
];

const durationOptions = [10, 15, 20, 25, 30, 45, 60] as const;

const focusOptions: FocusOption[] = [
	{ key: 'full_body', label: 'Tam Vucut' },
	{ key: 'legs', label: 'Bacaklar' },
	{ key: 'back', label: 'Sirt' },
	{ key: 'core', label: 'Core' },
	{ key: 'balance', label: 'Denge' },
	{ key: 'flexibility', label: 'Esneklik' },
	{ key: 'arms', label: 'Kollar' },
	{ key: 'hips', label: 'Kalca' },
];

const injuryOptions: InjuryOption[] = [
	{ key: 'knee_injury', label: 'Diz' },
	{ key: 'ankle_injury', label: 'Ayak Bilegi' },
	{ key: 'herniated_disc', label: 'Bel Fitigi' },
	{ key: 'low_back_pain', label: 'Bel' },
	{ key: 'shoulder_injury', label: 'Omuz' },
	{ key: 'wrist_injury', label: 'Bilek' },
	{ key: 'neck_injury', label: 'Boyun' },
	{ key: 'groin_injury', label: 'Kasik' },
	{ key: 'hip_injury', label: 'Kalca' },
];

const languageOptions: { key: AppLanguage; label: string }[] = [
	{ key: 'tr', label: 'Turkce' },
	{ key: 'en', label: 'English' },
];

const CreatePlanScreen = ({ navigation, route }: Props) => {
	const createPlanMutation = useCreatePlan();
	const pulseAnim = useRef(new Animated.Value(1)).current;
	const [inlineValidationError, setInlineValidationError] = React.useState<string | null>(null);
	const [showServerError, setShowServerError] = React.useState(false);

	const { control, handleSubmit, watch, setValue } = useForm<CreatePlanRequest>({
		defaultValues: {
			level: route.params?.presetLevel ?? 'beginner',
			duration: route.params?.presetDuration ?? 20,
			focus_area: 'full_body',
			injuries: [],
			language: 'tr',
		},
	});

	const selectedLevel = watch('level');
	const selectedDuration = watch('duration');
	const selectedFocus = watch('focus_area');
	const selectedInjuries = watch('injuries');
	const selectedLanguage = watch('language');

	useEffect(() => {
		if (route.params?.presetLevel) {
			setValue('level', route.params.presetLevel);
		}
		if (route.params?.presetDuration) {
			setValue('duration', route.params.presetDuration);
		}
	}, [route.params?.presetDuration, route.params?.presetLevel, setValue]);

	useEffect(() => {
		if (!createPlanMutation.isPending) {
			pulseAnim.setValue(1);
			return;
		}

		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.1,
					duration: 720,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 720,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]),
		);

		animation.start();

		return () => {
			animation.stop();
		};
	}, [createPlanMutation.isPending, pulseAnim]);

	const inlineSuggestion = useMemo(
		() => 'Odak alanini veya sureyi degistirerek tekrar deneyin.',
		[],
	);

	const onSubmit = handleSubmit(async values => {
		setInlineValidationError(null);
		setShowServerError(false);

		try {
			const result = await createPlanMutation.mutateAsync(values);
			Toast.show({
				type: 'success',
				position: 'top',
				text1: 'Plan olusturuldu',
				text2: 'Plan detay ekranina yonlendiriliyorsunuz.',
			});

			if (result.id) {
				navigation.replace('PlanDetail', { planId: result.id });
				return;
			}

			navigation.goBack();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				const backendMessage =
					(error.response?.data as { error?: string; message?: string } | undefined)?.error ||
					(error.response?.data as { error?: string; message?: string } | undefined)?.message;

				if (status === 400) {
					setInlineValidationError(backendMessage ?? 'Secilen filtrelerle plan olusturulamadi.');
					return;
				}

				if (status && status >= 500) {
					setShowServerError(true);
					return;
				}
			}

			Toast.show({
				type: 'error',
				position: 'top',
				text1: 'Plan olusturulamadi',
				text2: 'Lutfen tekrar deneyin.',
			});
		}
	});

	const toggleInjury = (injury: Injury) => {
		const exists = selectedInjuries.includes(injury);
		const next = exists ? selectedInjuries.filter(item => item !== injury) : [...selectedInjuries, injury];
		setValue('injuries', next, { shouldValidate: true });
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Seviye Secimi</Text>
					<View style={styles.levelGrid}>
						{levelOptions.map(level => {
							const selected = selectedLevel === level.key;
							return (
								<Pressable
									key={level.key}
									onPress={() => setValue('level', level.key, { shouldValidate: true })}
									style={[styles.levelCard, selected && styles.levelCardSelected]}
									accessibilityRole="button"
									accessibilityLabel={`${level.label} seviye sec`}
								>
									<MaterialCommunityIcons
										name={level.icon}
										size={24}
										color={selected ? colors.primary : colors.textSecondary}
									/>
									<Text style={[styles.levelTitle, selected && styles.levelTitleSelected]}>{level.label}</Text>
									<Text style={styles.levelDescription}>{level.description}</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sure: {selectedDuration} dakika</Text>
					<FlatList
						horizontal
						data={durationOptions}
						keyExtractor={item => `duration-${item}`}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.durationList}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews
						getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
						ListHeaderComponent={<View />}
						ListFooterComponent={<View style={styles.durationFooter} />}
						renderItem={({ item }) => (
							<Chip
								label={`${item}`}
								selected={item === selectedDuration}
								onPress={() => setValue('duration', item, { shouldValidate: true })}
							/>
						)}
					/>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Odak Alani</Text>
					<View style={styles.chipWrap}>
						{focusOptions.map(focus => (
							<Chip
								key={focus.key}
								label={focus.label}
								selected={selectedFocus === focus.key}
								onPress={() => setValue('focus_area', focus.key, { shouldValidate: true })}
							/>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Sakatliklariniz (varsa)</Text>
					<View style={styles.chipWrap}>
						{injuryOptions.map(injury => (
							<Chip
								key={injury.key}
								label={injury.label}
								selected={selectedInjuries.includes(injury.key)}
								onPress={() => toggleInjury(injury.key)}
								tone="warning"
							/>
						))}
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Dil</Text>
					<View style={styles.languageRow}>
						{languageOptions.map(language => {
							const selected = selectedLanguage === language.key;
							return (
								<Button
									key={language.key}
									title={language.label}
									onPress={() => setValue('language', language.key, { shouldValidate: true })}
									variant={selected ? 'primary' : 'outline'}
									size="md"
									fullWidth
									accessibilityLabel={`${language.label} sec`}
								/>
							);
						})}
					</View>
				</View>

				{inlineValidationError ? (
					<Card variant="outlined" style={styles.inlineErrorCard}>
						<View style={styles.inlineErrorHeader}>
							<MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
							<Text style={styles.inlineErrorTitle}>Plan olusturma hatasi</Text>
						</View>
						<Text style={styles.inlineErrorText}>{inlineValidationError}</Text>
						<Text style={styles.inlineSuggestion}>{inlineSuggestion}</Text>
					</Card>
				) : null}

				{showServerError ? (
					<View style={styles.serverErrorWrap}>
						<ErrorView
							type="server"
							title="Plan olusturulamadi"
							description="AI servisinde gecici bir sorun olustu."
							onRetry={() => {
								void onSubmit();
							}}
						/>
					</View>
				) : null}

				<Controller
					control={control}
					name="level"
					render={() => (
						<Button
							title="AI ile Plan Olustur"
							onPress={onSubmit}
							variant="primary"
							size="lg"
							loading={createPlanMutation.isPending}
							disabled={createPlanMutation.isPending}
							fullWidth
							accessibilityLabel="AI ile plan olustur"
						/>
					)}
				/>
			</ScrollView>

			{createPlanMutation.isPending ? (
				<View style={styles.overlay}>
					<Animated.View style={[styles.overlayIconWrap, { transform: [{ scale: pulseAnim }] }]}>
						<MaterialCommunityIcons name="flower-lotus" size={42} color={colors.primary} />
					</Animated.View>
					<Text style={styles.overlayTitle}>AI planinizi olusturuyor...</Text>
					<Text style={styles.overlaySubtitle}>Bu islem 10-30 saniye surebilir</Text>
				</View>
			) : null}
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
		paddingBottom: spacing.xxxl,
		gap: spacing.lg,
	},
	section: {
		gap: spacing.sm,
	},
	sectionTitle: {
		...typography.h4,
		color: colors.text,
	},
	levelGrid: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	levelCard: {
		flex: 1,
		padding: spacing.base,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		gap: spacing.xs,
	},
	levelCardSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primarySoft,
	},
	levelTitle: {
		...typography.bodyMedium,
		color: colors.text,
	},
	levelTitleSelected: {
		color: colors.primaryDark,
	},
	levelDescription: {
		...typography.caption,
		color: colors.textSecondary,
	},
	durationList: {
		gap: spacing.xs,
	},
	durationFooter: {
		width: spacing.xs,
	},
	chipWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.xs,
	},
	languageRow: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
	inlineErrorCard: {
		backgroundColor: '#FFF0EF',
		borderColor: '#FFD1CE',
	},
	inlineErrorHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.xs,
		marginBottom: spacing.xs,
	},
	inlineErrorTitle: {
		...typography.bodySmMedium,
		color: colors.error,
	},
	inlineErrorText: {
		...typography.bodySm,
		color: colors.text,
	},
	inlineSuggestion: {
		...typography.caption,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	serverErrorWrap: {
		marginBottom: spacing.sm,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(16, 16, 16, 0.45)',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.xl,
	},
	overlayIconWrap: {
		width: 92,
		height: 92,
		borderRadius: radius.full,
		backgroundColor: colors.surface,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.base,
	},
	overlayTitle: {
		...typography.h4,
		color: colors.textOnPrimary,
		marginBottom: spacing.xs,
	},
	overlaySubtitle: {
		...typography.bodySm,
		color: colors.surface,
		textAlign: 'center',
	},
});

export default CreatePlanScreen;
