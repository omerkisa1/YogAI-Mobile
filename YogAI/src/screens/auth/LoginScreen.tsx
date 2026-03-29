import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Modal,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormValues {
	email: string;
	password: string;
}

const mapFirebaseErrorToTurkish = (error: unknown) => {
	const code = (error as FirebaseAuthTypes.NativeFirebaseAuthError | undefined)?.code;

	switch (code) {
		case 'auth/user-not-found':
			return 'Bu email ile kayitli kullanici bulunamadi';
		case 'auth/wrong-password':
		case 'auth/invalid-credential':
			return 'Sifre hatali';
		case 'auth/invalid-email':
			return 'Gecersiz email adresi';
		case 'auth/too-many-requests':
			return 'Cok fazla deneme yapildi, lutfen bekleyin';
		case 'auth/network-request-failed':
			return 'Internet baglantinizi kontrol edin';
		default:
			return 'Giris islemi basarisiz';
	}
};

const LoginScreen = ({ navigation }: Props) => {
	const { signInWithEmail, signInWithGoogle, resetPassword, isSubmitting } = useAuth();
	const [isResetModalVisible, setIsResetModalVisible] = React.useState(false);
	const [resetEmail, setResetEmail] = React.useState('');

	const { control, handleSubmit, watch } = useForm<LoginFormValues>({
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const formEmail = watch('email');

	React.useEffect(() => {
		if (formEmail) {
			setResetEmail(formEmail);
		}
	}, [formEmail]);

	const onSubmit = handleSubmit(async values => {
		try {
			await signInWithEmail(values.email.trim(), values.password);
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Giris basarisiz',
				text2: mapFirebaseErrorToTurkish(error),
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
				text2: mapFirebaseErrorToTurkish(error),
			});
		}
	};

	const onResetPassword = async () => {
		const email = resetEmail.trim();
		if (!email) {
			Toast.show({
				type: 'error',
				text1: 'Email gerekli',
				text2: 'Lutfen email adresinizi girin',
			});
			return;
		}

		try {
			await resetPassword(email);
			setIsResetModalVisible(false);
			Toast.show({
				type: 'success',
				text1: 'Basarili',
				text2: 'Sifre sifirlama linki gonderildi',
			});
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'Sifre sifirlama basarisiz',
				text2: mapFirebaseErrorToTurkish(error),
			});
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<View style={styles.content}>
				<Text style={styles.title}>YogAI</Text>
				<Text style={styles.subtitle}>AI Yoga Asistaniniz</Text>

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
								autoCapitalize="none"
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

				<Pressable
					onPress={() => setIsResetModalVisible(true)}
					disabled={isSubmitting}
					style={styles.forgotContainer}
				>
					<Text style={styles.forgotText}>Sifremi unuttum</Text>
				</Pressable>

				<View style={styles.separatorRow}>
					<View style={styles.separatorLine} />
					<Text style={styles.separatorText}>veya</Text>
					<View style={styles.separatorLine} />
				</View>

				<Pressable
					onPress={onGoogleSignIn}
					disabled={isSubmitting}
					style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, isSubmitting && styles.disabled]}
				>
					{isSubmitting ? <ActivityIndicator color="#1F1F1F" /> : <Text style={styles.googleText}>Google ile Giris Yap</Text>}
				</Pressable>

				<Pressable onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
					<Text style={styles.linkText}>Hesabin yok mu? Kayit ol</Text>
				</Pressable>
			</View>

			<Modal
				visible={isResetModalVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setIsResetModalVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Sifre Sifirlama</Text>
						<Text style={styles.modalSubtitle}>Email adresinizi girin</Text>
						<TextInput
							style={styles.input}
							value={resetEmail}
							onChangeText={setResetEmail}
							autoCapitalize="none"
							keyboardType="email-address"
							placeholder="ornek@email.com"
							placeholderTextColor={colors.textMuted}
						/>
						<View style={styles.modalActions}>
							<Button
								label="Iptal"
								variant="outline"
								onPress={() => setIsResetModalVisible(false)}
								disabled={isSubmitting}
								fullWidth={false}
							/>
							<Button label="Gonder" onPress={onResetPassword} loading={isSubmitting} fullWidth={false} />
						</View>
					</View>
				</View>
			</Modal>
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
	forgotContainer: {
		alignSelf: 'flex-end',
	},
	forgotText: {
		...typography.bodySmall,
		color: colors.primaryLight,
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		padding: spacing.lg,
	},
	modalCard: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		padding: spacing.lg,
		gap: spacing.md,
	},
	modalTitle: {
		...typography.h3,
		color: colors.text,
	},
	modalSubtitle: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	modalActions: {
		flexDirection: 'row',
		gap: spacing.sm,
	},
});

export default LoginScreen;
