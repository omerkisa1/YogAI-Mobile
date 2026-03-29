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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormValues {
	email: string;
	password: string;
}

const LoginScreen = ({ navigation }: Props) => {
	const { signInWithEmail, signInWithGoogle, isSubmitting } = useAuth();

	const { control, handleSubmit } = useForm<LoginFormValues>({
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = handleSubmit(async values => {
		try {
			await signInWithEmail(values.email.trim(), values.password);
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Giris basarisiz',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	});

	const onGoogleSignIn = async () => {
		try {
			await signInWithGoogle();
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Google giris basarisiz',
				text2: error instanceof Error ? error.message : 'Bilinmeyen hata',
			});
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={styles.content}>
				<Text style={styles.title}>YogAI</Text>
				<Text style={styles.subtitle}>Hesabina giris yap ve antrenmanina devam et.</Text>

				<Pressable
					onPress={onGoogleSignIn}
					disabled={isSubmitting}
					style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, isSubmitting && styles.disabled]}
				>
					<Text style={styles.googleText}>Google ile Giris</Text>
				</Pressable>

				<View style={styles.separatorRow}>
					<View style={styles.separatorLine} />
					<Text style={styles.separatorText}>veya</Text>
					<View style={styles.separatorLine} />
				</View>

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

				<Button label="Giris Yap" onPress={onSubmit} loading={isSubmitting} />

				<Pressable onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
					<Text style={styles.linkText}>Hesabin yok mu? Kayit ol</Text>
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

export default LoginScreen;
