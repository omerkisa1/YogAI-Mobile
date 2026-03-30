import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
	children: ReactNode;
	variant?: CardVariant;
	style?: StyleProp<ViewStyle>;
	onPress?: () => void;
	accessibilityLabel?: string;
}

const cardShadow: ViewStyle = {
	shadowColor: '#1A1A2E',
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.06,
	shadowRadius: 12,
	elevation: 3,
	borderWidth: 1,
	borderColor: '#F0EFEB',
};

const variantStyles: Record<CardVariant, ViewStyle> = {
	default: {
		backgroundColor: colors.surface,
		borderColor: colors.borderLight,
		...cardShadow,
	},
	elevated: {
		backgroundColor: colors.surfaceElevated,
		borderColor: colors.borderLight,
		...cardShadow,
	},
	outlined: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
		...cardShadow,
	},
};

const Card = ({ children, variant = 'default', style, onPress, accessibilityLabel }: CardProps) => {
	const variantStyle = variantStyles[variant];

	if (onPress) {
		return (
			<Pressable
				style={({ pressed }) => [styles.base, variantStyle, pressed && styles.pressed, style]}
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
			>
				{children}
			</Pressable>
		);
	}

	return <View style={[styles.base, variantStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
	base: {
		borderRadius: radius.lg,
		borderWidth: 1,
		padding: spacing.base,
	},
	pressed: {
		opacity: 0.96,
		transform: [{ scale: 0.99 }],
	},
});

export default Card;
