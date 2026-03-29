import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Button from '../../shared/components/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormValues {
	displayName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const mapFirebaseErrorToTurkish = (error: unknown) => {
	const code = (error as FirebaseAuthTypes.NativeFirebaseAuthError | undefined)?.code;

	switch (code) {
		case 'auth/email-already-in-use':
			return 'Bu email zaten kullaniliyor';
		case 'auth/weak-password':
			return 'Sifre en az 6 karakter olmalidir';
		case 'auth/invalid-email':
			return 'Gecersiz email adresi';
		case 'auth/network-request-failed':
			return 'Internet baglantinizi kontrol edin';
		default:
			return 'Kayit islemi basarisiz';
	}
};

const RegisterScreen = ({ navigation }: Props) => {
	const { registerWithEmail, signInWithGoogle, isSubmitting } = useAuth();
	const {
		control,
		handleSubmit,
		watch,
		formState: { isSubmitting: isFormSubmitting },
	} = useForm<RegisterFormValues>({
		defaultValues: {
			displayName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const passwordValue = watch('password');

	const onSubmit = handleSubmit(async values => {
		try {
			await registerWithEmail(values.email.trim(), values.password, values.displayName.trim());
			Toast.show({
				type: 'success',
				text1: 'Kayit basarili',
				text2: 'Hesabiniz olusturuldu.',
			});
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Kayit basarisiz',
				text2: mapFirebaseErrorToTurkish(error),
			});
		}
	});

	const onGoogleRegister = async () => {
		try {
			await signInWithGoogle();
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Google kayit basarisiz',
				text2: mapFirebaseErrorToTurkish(error),
			});
		}
	};

	const loading = isSubmitting || isFormSubmitting;

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={styles.content}>
				<Text style={styles.title}>YogAI</Text>
				<Text style={styles.subtitle}>Hesap Olustur</Text>

				<Controller
					name="displayName"
					control={control}
					rules={{
						required: 'Ad Soyad zorunlu',
						minLength: { value: 2, message: 'En az 2 karakter olmali' },
					}}
					render={({ field: { onChange, value }, fieldState: { error } }) => (
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Ad Soyad</Text>
							<TextInput
								style={styles.input}
								onChangeText={onChange}
								value={value}
								placeholder="Ad Soyad"
								placeholderTextColor={colors.textMuted}
							/>
							{error ? <Text style={styles.error}>{error.message}</Text> : null}
						</View>
					)}
				/>

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

				<View style={styles.separatorRow}>
					<View style={styles.separatorLine} />
					<Text style={styles.separatorText}>veya</Text>
					<View style={styles.separatorLine} />
				</View>

				<Pressable
					onPress={onGoogleRegister}
					disabled={loading}
					style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, loading && styles.disabled]}
				>
					{loading ? <ActivityIndicator color="#1F1F1F" /> : <Text style={styles.googleText}>Google ile Kayit Ol</Text>}
				</Pressable>

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
	separatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
	},
	separatorLine: {
		flex: 1,
		height: 1,
		backgroundColor: colors.border,
	},
	separatorText: {
		...typography.caption,
		color: colors.textMuted,
	},
	googleButton: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		minHeight: 48,
		justifyContent: 'center',
		alignItems: 'center',
	},
	googleText: {
		...typography.button,
		color: '#1F1F1F',
	},
	pressed: {
		opacity: 0.9,
	},
	disabled: {
		opacity: 0.6,
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
