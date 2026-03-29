import React, { useEffect, useMemo, useState } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuth } from '../../features/auth/hooks/useAuth';
import BottomSheet from '../../shared/components/BottomSheet';
import Button from '../../shared/components/Button';
import ErrorView from '../../shared/components/ErrorView';
import Input from '../../shared/components/Input';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormValues {
	email: string;
	password: string;
}

interface PasswordResetFormValues {
	email: string;
}

interface FirebaseErrorMapping {
	text1: string;
	text2: string;
	type: 'network' | 'generic';
}

const mapFirebaseErrorToTurkish = (error: unknown): FirebaseErrorMapping => {
	const code = (error as FirebaseAuthTypes.NativeFirebaseAuthError | undefined)?.code;

	switch (code) {
		case 'auth/user-not-found':
			return {
				text1: 'Giris basarisiz',
				text2: 'Bu email ile kayitli kullanici bulunamadi.',
				type: 'generic',
			};
		case 'auth/wrong-password':
		case 'auth/invalid-credential':
			return {
				text1: 'Giris basarisiz',
				text2: 'Sifre hatali. Lutfen tekrar deneyin.',
				type: 'generic',
			};
		case 'auth/invalid-email':
			return {
				text1: 'Gecersiz email',
				text2: 'Lutfen gecerli bir email adresi girin.',
				type: 'generic',
			};
		case 'auth/too-many-requests':
			return {
				text1: 'Cok fazla deneme',
				text2: 'Lutfen bir sure bekleyip tekrar deneyin.',
				type: 'generic',
			};
		case 'auth/network-request-failed':
			return {
				text1: 'Baglanti hatasi',
				text2: 'Internet baglantinizi kontrol edin.',
				type: 'network',
			};
		default:
			return {
				text1: 'Giris basarisiz',
				text2: 'Beklenmeyen bir hata olustu. Lutfen tekrar deneyin.',
				type: 'generic',
			};
	}
};

const LoginScreen = ({ navigation }: Props) => {
	const { signInWithEmail, signInWithGoogle, resetPassword, isSubmitting } = useAuth();
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isResetSheetVisible, setIsResetSheetVisible] = useState(false);
	const [hasNetworkError, setHasNetworkError] = useState(false);

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<LoginFormValues>({
		defaultValues: {
			email: '',
			password: '',
		},
		mode: 'onSubmit',
	});

	const {
		control: resetControl,
		handleSubmit: handleResetSubmit,
		setValue: setResetValue,
		formState: { errors: resetErrors },
	} = useForm<PasswordResetFormValues>({
		defaultValues: {
			email: '',
		},
	});

	const currentEmail = watch('email');

	useEffect(() => {
		if (currentEmail?.trim()) {
			setResetValue('email', currentEmail.trim());
		}
	}, [currentEmail, setResetValue]);

	const separator = useMemo(
		() => (
			<View style={styles.separatorRow}>
				<View style={styles.separatorLine} />
				<Text style={styles.separatorText}>veya</Text>
				<View style={styles.separatorLine} />
			</View>
		),
		[],
	);

	const onSubmit = handleSubmit(async values => {
		setHasNetworkError(false);
		try {
			await signInWithEmail(values.email.trim(), values.password);
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

	const onGoogleSignIn = async () => {
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

	const onResetPassword = handleResetSubmit(async values => {
		setHasNetworkError(false);
		try {
			await resetPassword(values.email.trim());
			setIsResetSheetVisible(false);
			Toast.show({
				type: 'success',
				position: 'top',
				text1: 'Basarili',
				text2: 'Sifre sifirlama linki gonderildi.',
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
					<View style={styles.brandingSection}>
						<View style={styles.brandIconWrap}>
							<MaterialCommunityIcons name="flower-lotus" size={74} color={colors.primary} />
						</View>
						<Text style={styles.brandTitle}>YogAI</Text>
						<Text style={styles.brandSubtitle}>Kisisel AI yoga asistaniniz</Text>
					</View>

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
						<Controller
							name="email"
							control={control}
							rules={{
								required: 'Email zorunlu',
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: 'Gecerli email adresi girin',
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
									accessibilityLabel="Email adresi"
								/>
							)}
						/>

						<Controller
							name="password"
							control={control}
							rules={{
								required: 'Sifre zorunlu',
								minLength: {
									value: 6,
									message: 'Sifre en az 6 karakter olmali',
								},
							}}
							render={({ field: { value, onChange } }) => (
								<Input
									label="Sifre"
									placeholder="Sifrenizi girin"
									value={value}
									onChangeText={onChange}
									error={errors.password?.message}
									icon="lock-outline"
									secureTextEntry={!isPasswordVisible}
									rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
									onRightIconPress={() => setIsPasswordVisible(prev => !prev)}
									textContentType="password"
									accessibilityLabel="Sifre"
								/>
							)}
						/>

						<Button
							title="Giris Yap"
							onPress={onSubmit}
							variant="primary"
							size="lg"
							loading={isSubmitting}
							disabled={isSubmitting}
							fullWidth
							accessibilityLabel="Giris yap"
						/>

						<Pressable
							onPress={() => setIsResetSheetVisible(true)}
							disabled={isSubmitting}
							style={styles.forgotContainer}
							accessibilityRole="button"
							accessibilityLabel="Sifremi unuttum"
						>
							<Text style={styles.forgotText}>Sifremi unuttum</Text>
						</Pressable>

						{separator}

						<Button
							title="Google ile Giris Yap"
							onPress={onGoogleSignIn}
							variant="outline"
							size="lg"
							icon="google"
							loading={isSubmitting}
							disabled={isSubmitting}
							fullWidth
							accessibilityLabel="Google ile giris yap"
						/>

						<View style={styles.registerRow}>
							<Text style={styles.registerHint}>Hesabin yok mu?</Text>
							<Pressable
								onPress={() => navigation.navigate('Register')}
								style={styles.registerPressable}
								accessibilityRole="button"
								accessibilityLabel="Kayit ol ekranina git"
							>
								<Text style={styles.registerAction}>Kayit Ol</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			<BottomSheet
				visible={isResetSheetVisible}
				onClose={() => setIsResetSheetVisible(false)}
				title="Sifre sifirlama"
			>
				<Controller
					name="email"
					control={resetControl}
					rules={{
						required: 'Email zorunlu',
						pattern: {
							value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
							message: 'Gecerli email adresi girin',
						},
					}}
					render={({ field: { value, onChange } }) => (
						<Input
							label="Email"
							placeholder="ornek@email.com"
							value={value}
							onChangeText={onChange}
							error={resetErrors.email?.message}
							icon="email-outline"
							keyboardType="email-address"
							autoCapitalize="none"
							accessibilityLabel="Sifre sifirlama email"
						/>
					)}
				/>

				<View style={styles.sheetActions}>
					<Button
						title="Iptal"
						onPress={() => setIsResetSheetVisible(false)}
						variant="ghost"
						size="md"
						fullWidth
						accessibilityLabel="Sifre sifirlama iptal"
					/>
					<Button
						title="Sifirlama Linki Gonder"
						onPress={onResetPassword}
						variant="primary"
						size="md"
						loading={isSubmitting}
						disabled={isSubmitting}
						fullWidth
						accessibilityLabel="Sifirlama linki gonder"
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
	keyboardAvoid: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.huge,
	},
	brandingSection: {
		minHeight: 260,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: spacing.lg,
		paddingBottom: spacing.base,
	},
	brandIconWrap: {
		width: 120,
		height: 120,
		borderRadius: radius.full,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.primarySoft,
		marginBottom: spacing.base,
	},
	brandTitle: {
		...typography.display,
		color: colors.primary,
	},
	brandSubtitle: {
		...typography.body,
		color: colors.textSecondary,
		marginTop: spacing.xs,
	},
	formSection: {
		backgroundColor: colors.surface,
		borderRadius: radius.xl,
		paddingHorizontal: spacing.base,
		paddingTop: spacing.lg,
		paddingBottom: spacing.xl,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	forgotContainer: {
		alignSelf: 'flex-end',
		marginBottom: spacing.base,
	},
	forgotText: {
		...typography.bodySm,
		color: colors.textSecondary,
		textDecorationLine: 'underline',
	},
	separatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.sm,
		marginBottom: spacing.base,
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
	registerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.lg,
	},
	registerHint: {
		...typography.bodySm,
		color: colors.textSecondary,
	},
	registerPressable: {
		marginLeft: spacing.xs,
	},
	registerAction: {
		...typography.bodySmMedium,
		color: colors.primary,
	},
	errorBox: {
		marginBottom: spacing.base,
	},
	sheetActions: {
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
});

export default LoginScreen;
