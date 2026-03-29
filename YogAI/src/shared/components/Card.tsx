import React, { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardProps {
	children: ReactNode;
	style?: StyleProp<ViewStyle>;
	onPress?: () => void;
}

const Card = ({ children, style, onPress }: CardProps) => {
	if (onPress) {
		return (
			<Pressable style={({ pressed }) => [styles.base, style, pressed && styles.pressed]} onPress={onPress}>
				{children}
			</Pressable>
		);
	}

	return <View style={[styles.base, style]}>{children}</View>;
};

const styles = StyleSheet.create({
	base: {
		backgroundColor: colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 6,
	},
	pressed: {
		opacity: 0.9,
	},
});

export default Card;
