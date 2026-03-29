import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const AppSplash = () => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.background} />
			<View style={styles.content}>
				<View style={styles.logoWrap}>
					<MaterialCommunityIcons name="flower-lotus" size={48} color={colors.primary} />
				</View>
				<Text style={styles.title}>YogAI</Text>
				<Text style={styles.subtitle}>Kişisel AI yoga asistanınız hazırlanıyor</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: spacing.base,
	},
	logoWrap: {
		width: 96,
		height: 96,
		borderRadius: radius.full,
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: spacing.base,
	},
	title: {
		...typography.h1,
		color: colors.primary,
	},
	subtitle: {
		...typography.bodySm,
		color: colors.textSecondary,
		marginTop: spacing.xs,
		textAlign: 'center',
	},
});

export default AppSplash;
