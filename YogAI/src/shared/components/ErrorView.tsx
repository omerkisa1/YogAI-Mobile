import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from './Button';

interface ErrorViewProps {
	message?: string;
	onRetry?: () => void;
}

const ErrorView = ({ message = 'Bir hata olustu. Lutfen tekrar deneyin.', onRetry }: ErrorViewProps) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Bir Seyler Ters Gitti</Text>
			<Text style={styles.message}>{message}</Text>
			{onRetry ? <Button label="Tekrar Dene" onPress={onRetry} /> : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background,
		padding: spacing.lg,
		gap: spacing.md,
	},
	title: {
		...typography.h3,
		color: colors.error,
		textAlign: 'center',
	},
	message: {
		...typography.body,
		color: colors.textSecondary,
		textAlign: 'center',
		marginBottom: spacing.sm,
	},
});

export default ErrorView;
