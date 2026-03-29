import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useCreatePlan } from '../../features/plans/hooks/useCreatePlan';
import Button from '../../shared/components/Button';
import { AppLanguage, CreatePlanRequest, FocusArea, Injury, Level } from '../../shared/types/plan';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreatePlan'>;

const levels: Level[] = ['beginner', 'intermediate', 'advanced'];
const focusAreas: FocusArea[] = ['full_body', 'legs', 'back', 'core', 'balance', 'flexibility', 'arms', 'hips'];
const injuries: Injury[] = [
	'knee_injury',
	'ankle_injury',
	'herniated_disc',
	'low_back_pain',
	'shoulder_injury',
	'wrist_injury',
	'neck_injury',
	'groin_injury',
	'hip_injury',
];
const languages: AppLanguage[] = ['tr', 'en'];

const CreatePlanScreen = ({ navigation }: Props) => {
	const createPlanMutation = useCreatePlan();

	const { control, handleSubmit, watch, setValue } = useForm<CreatePlanRequest>({
		defaultValues: {
			level: 'beginner',
			duration: 20,
			focus_area: 'full_body',
			injuries: [],
			language: 'tr',
		},
	});

	const selectedDuration = watch('duration');

	const onSubmit = handleSubmit(async values => {
		try {
			const result = await createPlanMutation.mutateAsync(values);
			if (!result.id) {
				Toast.show({
					type: 'success',
					text1: 'Plan olusturuldu',
					text2: 'Liste ekraninda plani goruntuleyebilirsiniz.',
				});
				navigation.goBack();
				return;
			}
			navigation.replace('PlanDetail', { planId: result.id });
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Plan olusturulamadi',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	});

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<Text style={styles.title}>AI Plan Olustur</Text>

			<Controller
				control={control}
				name="level"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Seviye</Text>
						<View style={styles.rowWrap}>
							{levels.map(level => (
								<Pressable
									key={level}
									onPress={() => onChange(level)}
									style={[styles.chip, value === level && styles.chipSelected]}
								>
									<Text style={[styles.chipText, value === level && styles.chipTextSelected]}>{level}</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="duration"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Sure (dk)</Text>
						<View style={styles.durationRow}>
							<Pressable
								style={styles.durationButton}
								onPress={() => onChange(Math.max(10, value - 5))}
							>
								<Text style={styles.durationButtonText}>-</Text>
							</Pressable>
							<Text style={styles.durationText}>{selectedDuration}</Text>
							<Pressable
								style={styles.durationButton}
								onPress={() => onChange(Math.min(60, value + 5))}
							>
								<Text style={styles.durationButtonText}>+</Text>
							</Pressable>
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="focus_area"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Odak Alani</Text>
						<View style={styles.rowWrap}>
							{focusAreas.map(area => (
								<Pressable
									key={area}
									onPress={() => onChange(area)}
									style={[styles.chip, value === area && styles.chipSelected]}
								>
									<Text style={[styles.chipText, value === area && styles.chipTextSelected]}>{area}</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="injuries"
				render={({ field: { value } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Sakatliklar</Text>
						<View style={styles.rowWrap}>
							{injuries.map(injury => {
								const selected = value.includes(injury);
								return (
									<Pressable
										key={injury}
										onPress={() => {
											const next = selected
												? value.filter(item => item !== injury)
												: [...value, injury];
											setValue('injuries', next, { shouldValidate: true });
										}}
										style={[styles.chip, selected && styles.chipSelected]}
									>
										<Text style={[styles.chipText, selected && styles.chipTextSelected]}>{injury}</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="language"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Dil</Text>
						<View style={styles.rowWrap}>
							{languages.map(language => (
								<Pressable
									key={language}
									onPress={() => onChange(language)}
									style={[styles.chip, value === language && styles.chipSelected]}
								>
									<Text style={[styles.chipText, value === language && styles.chipTextSelected]}>
										{language.toUpperCase()}
									</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			{createPlanMutation.isPending ? (
				<Text style={styles.pendingText}>AI planinizi olusturuyor...</Text>
			) : null}

			<Button
				label="Plan Olustur"
				onPress={onSubmit}
				loading={createPlanMutation.isPending}
				disabled={createPlanMutation.isPending}
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
		gap: spacing.lg,
		paddingBottom: spacing.xxl,
	},
	title: {
		...typography.h2,
		color: colors.text,
	},
	section: {
		gap: spacing.sm,
	},
	label: {
		...typography.body,
		color: colors.text,
	},
	rowWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	chip: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	chipSelected: {
		borderColor: colors.primary,
		backgroundColor: colors.primaryDark,
	},
	chipText: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	chipTextSelected: {
		color: colors.text,
	},
	durationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
	},
	durationButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'center',
		justifyContent: 'center',
	},
	durationButtonText: {
		...typography.h2,
		color: colors.text,
	},
	durationText: {
		...typography.h2,
		color: colors.primaryLight,
		minWidth: 48,
		textAlign: 'center',
	},
	pendingText: {
		...typography.bodySmall,
		color: colors.warning,
		textAlign: 'center',
	},
});

export default CreatePlanScreen;
