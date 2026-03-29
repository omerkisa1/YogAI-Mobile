import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuth } from '../../features/auth/hooks/useAuth';
import Button from '../../shared/components/Button';
import ErrorView from '../../shared/components/ErrorView';
import Input from '../../shared/components/Input';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormValues {
	displayName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface FirebaseErrorMapping {
	text1: string;
	text2: string;
	type: 'network' | 'generic';
}

const mapFirebaseErrorToTurkish = (error: unknown): FirebaseErrorMapping => {
	const code = (error as FirebaseAuthTypes.NativeFirebaseAuthError | undefined)?.code;

	switch (code) {
		case 'auth/email-already-in-use':
			return {
				text1: 'Kayıt Başarısız',
				text2: 'Bu email zaten kullanimda.',
				type: 'generic',
			};
		case 'auth/weak-password':
			return {
				text1: 'Zayif Şifre',
				text2: 'Şifre en az 6 karakter olmalı.',
				type: 'generic',
			};
		case 'auth/invalid-email':
			return {
				text1: 'Geçersiz email',
				text2: 'Lütfen Geçerli bir email adresi girin.',
				type: 'generic',
			};
		case 'auth/network-request-failed':
			return {
				text1: 'Bağlantı hatası',
				text2: 'İnternet bağlantınızı kontrol edin.',
				type: 'network',
			};
		default:
			return {
				text1: 'Kayıt Başarısız',
				text2: 'Beklenmeyen bir hata Oluştu. Lütfen tekrar deneyin.',
				type: 'generic',
			};
	}
};

const RegisterScreen = ({ navigation }: Props) => {
	const { registerWithEmail, signInWithGoogle, isSubmitting } = useAuth();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
	const [hasNetworkError, setHasNetworkError] = useState(false);

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting: isFormSubmitting },
	} = useForm<RegisterFormValues>({
		defaultValues: {
			displayName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onSubmit',
	});

	const passwordValue = watch('password');
	const loading = isSubmitting || isFormSubmitting;

	const onSubmit = handleSubmit(async values => {
		setHasNetworkError(false);
		try {
			await registerWithEmail(values.email.trim(), values.password, values.displayName.trim());
			Toast.show({
				type: 'success',
				position: 'top',
				text1: 'Kayıt başarılı',
				text2: 'Hesabınız oluşturuldu.',
			});
		} catch (error) {
			const mappedError = mapFirebaseErrorToTurkish(error);
			if (mappedError.type === 'network') {
				setHasNetworkError(true);
			}

			Toast.show({
				type: 'error',
				position: 'top',
				text1: mappedError.text1,
				text2: mappedError.text2,
			});
		}
	});

	const onGoogleRegister = async () => {
		setHasNetworkError(false);
		try {
			await signInWithGoogle();
		} catch (error) {
			const mappedError = mapFirebaseErrorToTurkish(error);
			if (mappedError.type === 'network') {
				setHasNetworkError(true);
			}

			Toast.show({
				type: 'error',
				position: 'top',
				text1: mappedError.text1,
				text2: mappedError.text2,
			});
		}
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<KeyboardAvoidingView
				style={styles.keyboardAvoid}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{hasNetworkError ? (
						<View style={styles.errorBox}>
							<ErrorView
								type="network"
								onRetry={() => {
									setHasNetworkError(false);
									void onSubmit();
								}}
							/>
						</View>
					) : null}

					<View style={styles.formSection}>
						<Text style={styles.title}>Hesap Oluştur</Text>
						<Text style={styles.subtitle}>Yeni hesabınızla YogAI dünyasına katılın</Text>

						<Controller
							name="displayName"
							control={control}
							rules={{
								required: 'Ad Soyad zorunlu',
								minLength: {
									value: 2,
									message: 'Ad Soyad en az 2 karakter olmalı',
								},
							}}
							render={({ field: { value, onChange } }) => (
								<Input
									label="Ad Soyad"
									placeholder="Ad Soyad"
									value={value}
									onChangeText={onChange}
									error={errors.displayName?.message}
									icon="account-outline"
									autoCapitalize="words"
									textContentType="name"
									accessibilityLabel="Ad Soyad"
								/>
							)}
						/>

						<Controller
							name="email"
							control={control}
							rules={{
								required: 'Email zorunlu',
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: 'Geçerli email adresi girin',
								},
							}}
							render={({ field: { value, onChange } }) => (
								<Input
									label="Email"
									placeholder="ornek@email.com"
									value={value}
									onChangeText={onChange}
									error={errors.email?.message}
									icon="email-outline"
									keyboardType="email-address"
									autoCapitalize="none"
									textContentType="emailAddress"
									accessibilityLabel="Email"
								/>
							)}
						/>

						<Controller
							name="password"
							control={control}
							rules={{
								required: 'Şifre zorunlu',
								minLength: {
									value: 6,
									message: 'Şifre en az 6 karakter olmalı',
								},
							}}
							render={({ field: { value, onChange } }) => (
								<Input
									label="Şifre"
									placeholder="Şifrenizi girin"
									value={value}
									onChangeText={onChange}
									error={errors.password?.message}
									icon="lock-outline"
									secureTextEntry={!isPasswordVisible}
									rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
									onRightIconPress={() => setIsPasswordVisible(prev => !prev)}
									accessibilityLabel="Şifre"
								/>
							)}
						/>

						<Controller
							name="confirmPassword"
							control={control}
							rules={{
								required: 'Şifre tekrarı zorunlu',
								validate: value => value === passwordValue || 'Şifreler eşleşmiyor',
							}}
							render={({ field: { value, onChange } }) => (
								<Input
									label="Şifre Tekrar"
									placeholder="Şifrenizi tekrar girin"
									value={value}
									onChangeText={onChange}
									error={errors.confirmPassword?.message}
									icon="lock-check-outline"
									secureTextEntry={!isConfirmPasswordVisible}
									rightIcon={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
									onRightIconPress={() => setIsConfirmPasswordVisible(prev => !prev)}
									accessibilityLabel="Şifre tekrar"
								/>
							)}
						/>

						<Button
							title="Kayıt Ol"
							onPress={onSubmit}
							variant="primary"
							size="lg"
							loading={loading}
							disabled={loading}
							fullWidth
							accessibilityLabel="Kayıt ol"
						/>

						<View style={styles.separatorRow}>
							<View style={styles.separatorLine} />
							<Text style={styles.separatorText}>veya</Text>
							<View style={styles.separatorLine} />
						</View>

						<Button
							title="Google ile Kayıt Ol"
							onPress={onGoogleRegister}
							variant="outline"
							size="lg"
							icon="google"
							loading={loading}
							disabled={loading}
							fullWidth
							accessibilityLabel="Google ile Kayıt ol"
						/>

						<View style={styles.loginRow}>
							<Text style={styles.loginHint}>Zaten hesabın var mı?</Text>
							<Pressable
								onPress={() => navigation.navigate('Login')}
								style={styles.loginPressable}
								accessibilityRole="button"
								accessibilityLabel="Giriş yap ekranına git"
							>
								<Text style={styles.loginAction}>Giriş Yap</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	keyboardAvoid: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.huge,
	},
	formSection: {
		backgroundColor: colors.surface,
		borderRadius: radius.xl,
		paddingHorizontal: spacing.base,
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
		marginTop: spacing.sm,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	title: {
		...typography.h2,
		color: colors.text,
		marginBottom: spacing.xs,
	},
	subtitle: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginBottom: spacing.base,
	},
	separatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginVertical: spacing.base,
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
	loginRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.lg,
	},
	loginHint: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	loginPressable: {
		marginLeft: spacing.xs,
	},
	loginAction: {
		...typography.bodySmMedium,
		color: colors.primary,
	},
	errorBox: {
		marginTop: spacing.sm,
		marginBottom: spacing.base,
	},
});

export default RegisterScreen;
