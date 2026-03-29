import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useProfile, useUpdateProfile } from '../../features/profile/hooks/useProfile';
import Button from '../../shared/components/Button';
import ErrorView from '../../shared/components/ErrorView';
import LoadingScreen from '../../shared/components/LoadingScreen';
import { Goal, Profile } from '../../shared/types/profile';
import { AppLanguage, Injury, Level } from '../../shared/types/plan';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const levelOptions: Level[] = ['beginner', 'intermediate', 'advanced'];
const languageOptions: AppLanguage[] = ['tr', 'en'];
const goalOptions: Goal[] = ['flexibility', 'stress_relief', 'strength', 'balance', 'mobility', 'posture'];
const injuryOptions: Injury[] = [
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

const EditProfileScreen = ({ navigation }: Props) => {
	const profileQuery = useProfile();
	const updateMutation = useUpdateProfile();

	const { control, handleSubmit, reset, setValue } = useForm<Profile>({
		defaultValues: {
			display_name: '',
			age: 18,
			gender: 'prefer_not_to_say',
			level: 'beginner',
			goals: [],
			injuries: [],
			preferred_language: 'tr',
		},
	});

	useEffect(() => {
		if (profileQuery.data) {
			reset(profileQuery.data);
		}
	}, [profileQuery.data, reset]);

	if (profileQuery.isLoading) {
		return <LoadingScreen message="Profil bilgisi getiriliyor..." />;
	}

	if (profileQuery.isError || !profileQuery.data) {
		return <ErrorView message="Profil verisi alinamadi." onRetry={profileQuery.refetch} />;
	}

	const onSubmit = handleSubmit(async values => {
		try {
			await updateMutation.mutateAsync(values);
			Toast.show({
				type: 'success',
				text1: 'Profil kaydedildi',
			});
			navigation.goBack();
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Kaydetme basarisiz',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	});

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<Controller
				control={control}
				name="display_name"
				rules={{ required: 'Ad soyad zorunlu' }}
				render={({ field: { value, onChange }, fieldState: { error } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Ad</Text>
						<TextInput
							style={styles.input}
							value={value}
							onChangeText={onChange}
							placeholder="Adinizi girin"
							placeholderTextColor={colors.textMuted}
						/>
						{error ? <Text style={styles.error}>{error.message}</Text> : null}
					</View>
				)}
			/>

			<Controller
				control={control}
				name="age"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Yas</Text>
						<TextInput
							style={styles.input}
							value={String(value)}
							keyboardType="numeric"
							onChangeText={text => onChange(Number(text) || 0)}
							placeholder="Yas"
							placeholderTextColor={colors.textMuted}
						/>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="level"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Seviye</Text>
						<View style={styles.wrap}>
							{levelOptions.map(option => (
								<Pressable
									key={option}
									onPress={() => onChange(option)}
									style={[styles.chip, value === option && styles.chipSelected]}
								>
									<Text style={[styles.chipText, value === option && styles.chipTextSelected]}>{option}</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="goals"
				render={({ field: { value } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Hedefler</Text>
						<View style={styles.wrap}>
							{goalOptions.map(option => {
								const selected = value.includes(option);
								return (
									<Pressable
										key={option}
										onPress={() => {
											const next = selected ? value.filter(v => v !== option) : [...value, option];
											setValue('goals', next, { shouldValidate: true });
										}}
										style={[styles.chip, selected && styles.chipSelected]}
									>
										<Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
									</Pressable>
								);
							})}
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
						<View style={styles.wrap}>
							{injuryOptions.map(option => {
								const selected = value.includes(option);
								return (
									<Pressable
										key={option}
										onPress={() => {
											const next = selected ? value.filter(v => v !== option) : [...value, option];
											setValue('injuries', next, { shouldValidate: true });
										}}
										style={[styles.chip, selected && styles.chipSelected]}
									>
										<Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				)}
			/>

			<Controller
				control={control}
				name="preferred_language"
				render={({ field: { value, onChange } }) => (
					<View style={styles.section}>
						<Text style={styles.label}>Dil</Text>
						<View style={styles.wrap}>
							{languageOptions.map(option => (
								<Pressable
									key={option}
									onPress={() => onChange(option)}
									style={[styles.chip, value === option && styles.chipSelected]}
								>
									<Text style={[styles.chipText, value === option && styles.chipTextSelected]}>
										{option.toUpperCase()}
									</Text>
								</Pressable>
							))}
						</View>
					</View>
				)}
			/>

			<Button label="Kaydet" onPress={onSubmit} loading={updateMutation.isPending} />
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
	section: {
		gap: spacing.sm,
	},
	label: {
		...typography.body,
		color: colors.text,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		backgroundColor: colors.surface,
		color: colors.text,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
	},
	error: {
		...typography.caption,
		color: colors.error,
	},
	wrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.sm,
	},
	chip: {
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 999,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		backgroundColor: colors.surface,
	},
	chipSelected: {
		backgroundColor: colors.primaryDark,
		borderColor: colors.primary,
	},
	chipText: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	chipTextSelected: {
		color: colors.text,
	},
});

export default EditProfileScreen;
