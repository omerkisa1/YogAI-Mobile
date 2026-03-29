import React from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextStyle,
	ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
	label: string;
	onPress: () => void;
	variant?: ButtonVariant;
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; spinner: string }> = {
	primary: {
		container: {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
		},
		text: {
			color: colors.text,
		},
		spinner: colors.text,
	},
	secondary: {
		container: {
			backgroundColor: colors.secondary,
			borderColor: colors.secondary,
		},
		text: {
			color: colors.background,
		},
		spinner: colors.background,
	},
	outline: {
		container: {
			backgroundColor: 'transparent',
			borderColor: colors.border,
		},
		text: {
			color: colors.text,
		},
		spinner: colors.text,
	},
};

const Button = ({
	label,
	onPress,
	variant = 'primary',
	loading = false,
	disabled = false,
	fullWidth = true,
}: ButtonProps) => {
	const currentVariant = variantStyles[variant];
	const isDisabled = disabled || loading;

	return (
		<Pressable
			style={({ pressed }) => [
				styles.base,
				fullWidth && styles.fullWidth,
				currentVariant.container,
				isDisabled && styles.disabled,
				pressed && !isDisabled && styles.pressed,
			]}
			disabled={isDisabled}
			onPress={onPress}
		>
			{loading ? (
				<ActivityIndicator size="small" color={currentVariant.spinner} />
			) : (
				<Text style={[styles.label, currentVariant.text]}>{label}</Text>
			)}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	base: {
		minHeight: 48,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
	},
	fullWidth: {
		width: '100%',
	},
	label: {
		...typography.button,
	},
	disabled: {
		opacity: 0.6,
	},
	pressed: {
		transform: [{ scale: 0.98 }],
	},
});

export default Button;
