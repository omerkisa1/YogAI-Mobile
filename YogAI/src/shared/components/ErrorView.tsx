import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import Button from './Button';

type ErrorType = 'network' | 'server' | 'notfound' | 'generic';

interface ErrorPreset {
	title: string;
	description: string;
	icon: string;
}

interface ErrorViewProps {
	title?: string;
	description?: string;
	message?: string;
	onRetry?: () => void;
	type?: ErrorType;
}

const errorPresets: Record<ErrorType, ErrorPreset> = {
	network: {
		title: 'Baglanti hatasi',
		description: 'Internet baglantinizi kontrol edip tekrar deneyin.',
		icon: 'wifi-alert',
	},
	server: {
		title: 'Sunucu hatasi',
		description: 'Servis gecici olarak kullanilamiyor. Lutfen tekrar deneyin.',
		icon: 'server-network-off',
	},
	notfound: {
		title: 'Icerik bulunamadi',
		description: 'Aradiginiz icerik artik mevcut olmayabilir.',
		icon: 'file-search-outline',
	},
	generic: {
		title: 'Bir seyler ters gitti',
		description: 'Islem su anda tamamlanamadi. Lutfen tekrar deneyin.',
		icon: 'alert-circle-outline',
	},
};

const ErrorView = ({
	title,
	description,
	message,
	onRetry,
	type = 'generic',
}: ErrorViewProps) => {
	const preset = errorPresets[type];
	const resolvedTitle = title ?? preset.title;
	const resolvedDescription = description ?? message ?? preset.description;

	return (
		<View style={styles.container}>
			<View style={styles.iconContainer}>
				<MaterialCommunityIcons name={preset.icon} size={30} color={colors.error} />
			</View>
			<Text style={styles.title}>{resolvedTitle}</Text>
			<Text style={styles.message}>{resolvedDescription}</Text>
			{onRetry ? (
				<Button
					title="Tekrar dene"
					onPress={onRetry}
					variant="outline"
					size="md"
					fullWidth={false}
					icon="refresh"
					accessibilityLabel="Hatayi tekrar dene"
				/>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.surface,
		padding: spacing.xl,
		gap: spacing.base,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: radius.full,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFECEA',
	},
	title: {
		...typography.h4,
		color: colors.text,
		textAlign: 'center',
	},
	message: {
		...typography.bodySm,
		color: colors.textSecondary,
		textAlign: 'center',
		marginBottom: spacing.xs,
	},
});

export default ErrorView;
