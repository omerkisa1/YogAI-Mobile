import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../shared/components/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TrainingSession'>;

const TrainingScreen = ({ route }: Props) => {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Canli Antrenman</Text>
			<Text style={styles.meta}>Plan ID: {route.params.planId}</Text>
			<Text style={styles.meta}>Session ID: {route.params.sessionId}</Text>
			<Text style={styles.description}>Kamera tabanli poz analizi yakin zamanda eklenecek.</Text>
			<Button label="Yakinda" onPress={() => {}} disabled />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		padding: spacing.lg,
		justifyContent: 'center',
		gap: spacing.sm,
	},
	title: {
		...typography.h2,
		color: colors.text,
	},
	meta: {
		...typography.bodySmall,
		color: colors.textSecondary,
	},
	description: {
		...typography.body,
		color: colors.text,
		marginTop: spacing.md,
		marginBottom: spacing.md,
	},
});

export default TrainingScreen;
