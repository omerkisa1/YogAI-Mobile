import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ChipProps {
	label: string;
	selected: boolean;
	onPress: () => void;
	icon?: string;
	tone?: 'primary' | 'warning';
}

const Chip = ({ label, selected, onPress, icon, tone = 'primary' }: ChipProps) => {
	const selectedStyle = tone === 'warning' ? styles.warningSelected : styles.primarySelected;
	const selectedLabelStyle = tone === 'warning' ? styles.warningSelectedLabel : styles.primarySelectedLabel;
	const iconColor = selected
		? tone === 'warning'
			? colors.secondaryDark
			: colors.primaryDark
		: colors.textSecondary;

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				selected ? selectedStyle : styles.unselected,
				pressed && styles.pressed,
			]}
			accessibilityRole="button"
			accessibilityLabel={`${label} secim chip`}
		>
			{icon ? (
				<MaterialCommunityIcons
					name={icon}
					size={16}
					color={iconColor}
					style={styles.icon}
				/>
			) : null}
			<Text style={[styles.label, selected ? selectedLabelStyle : styles.unselectedLabel]}>{label}</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	base: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: radius.full,
		borderWidth: 1,
	},
	primarySelected: {
		backgroundColor: colors.primarySoft,
		borderColor: colors.primary,
	},
	warningSelected: {
		backgroundColor: '#FFF3E9',
		borderColor: colors.warning,
	},
	unselected: {
		backgroundColor: colors.surface,
		borderColor: colors.border,
	},
	pressed: {
		opacity: 0.9,
	},
	icon: {
		marginRight: spacing.xs,
	},
	label: {
		...typography.bodySmMedium,
	},
	primarySelectedLabel: {
		color: colors.primaryDark,
	},
	warningSelectedLabel: {
		color: colors.secondaryDark,
	},
	unselectedLabel: {
		color: colors.textSecondary,
	},
});

export default Chip;
