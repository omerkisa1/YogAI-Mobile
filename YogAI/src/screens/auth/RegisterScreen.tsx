import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Button from '../../shared/components/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormValues {
	email: string;
	password: string;
	confirmPassword: string;
}

const RegisterScreen = ({ navigation }: Props) => {
	const { registerWithEmail, isSubmitting } = useAuth();
	const {
		control,
		handleSubmit,
		watch,
		formState: { isSubmitting: isFormSubmitting },
	} = useForm<RegisterFormValues>({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const passwordValue = watch('password');

	const onSubmit = handleSubmit(async values => {
		try {
			await registerWithEmail(values.email.trim(), values.password);
			Toast.show({
				type: 'success',
				text1: 'Kayit basarili',
				text2: 'Hesabiniz olusturuldu.',
			});
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Kayit basarisiz',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	});

	const loading = isSubmitting || isFormSubmitting;

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={styles.content}>
				<Text style={styles.title}>Yeni Hesap</Text>
				<Text style={styles.subtitle}>Kayit olarak YogAI deneyimini baslat.</Text>

				<Controller
					name="email"
					control={control}
					rules={{
						required: 'Email zorunlu',
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: 'Gecerli email girin',
						},
					}}
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								style={styles.input}
								autoCapitalize="none"
								keyboardType="email-address"
								onChangeText={onChange}
								value={value}
								placeholder="ornek@email.com"
								placeholderTextColor={colors.textMuted}
							/>
							{error ? <Text style={styles.error}>{error.message}</Text> : null}
						</View>
					)}
				/>

				<Controller
					name="password"
					control={control}
					rules={{
						required: 'Sifre zorunlu',
						minLength: { value: 6, message: 'En az 6 karakter olmali' },
					}}
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Sifre</Text>
							<TextInput
								style={styles.input}
								secureTextEntry
								onChangeText={onChange}
								value={value}
								placeholder="******"
								placeholderTextColor={colors.textMuted}
							/>
							{error ? <Text style={styles.error}>{error.message}</Text> : null}
						</View>
					)}
				/>

				<Controller
					name="confirmPassword"
					control={control}
					rules={{
						required: 'Sifre tekrari zorunlu',
						validate: value => value === passwordValue || 'Sifreler eslesmiyor',
					}}
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Sifre Tekrar</Text>
							<TextInput
								style={styles.input}
								secureTextEntry
								onChangeText={onChange}
								value={value}
								placeholder="******"
								placeholderTextColor={colors.textMuted}
							/>
							{error ? <Text style={styles.error}>{error.message}</Text> : null}
						</View>
					)}
				/>

				<Button label="Kayit Ol" onPress={onSubmit} loading={loading} />

				<Pressable onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
					<Text style={styles.linkText}>Zaten hesabin var mi? Giris yap</Text>
				</Pressable>
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		justifyContent: 'center',
	},
	content: {
		padding: spacing.lg,
		gap: spacing.md,
	},
	title: {
		...typography.h1,
		color: colors.text,
	},
	subtitle: {
		...typography.body,
		color: colors.textSecondary,
		marginBottom: spacing.md,
	},
	inputGroup: {
		gap: spacing.xs,
	},
	label: {
		...typography.bodySmall,
		color: colors.textSecondary,
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
	linkContainer: {
		alignSelf: 'center',
		marginTop: spacing.sm,
	},
	linkText: {
		...typography.bodySmall,
		color: colors.primaryLight,
	},
});

export default RegisterScreen;
