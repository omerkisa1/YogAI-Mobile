import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from './Button';

export interface EmptyStateProps {
	icon: string;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<MaterialCommunityIcons name={icon} size={36} color={colors.primary} />
			</View>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>{description}</Text>
			{actionLabel && onAction ? (
				<Button
					title={actionLabel}
					onPress={onAction}
					variant="outline"
					size="md"
					fullWidth={false}
					accessibilityLabel={actionLabel}
				/>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.xl,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	iconContainer: {
		width: 72,
		height: 72,
		borderRadius: radius.full,
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.base,
	},
	title: {
		...typography.h4,
		color: colors.text,
		marginBottom: spacing.xs,
		textAlign: 'center',
	},
	description: {
		...typography.bodySm,
		color: colors.textSecondary,
		textAlign: 'center',
		marginBottom: spacing.base,
	},
});

export default EmptyState;
