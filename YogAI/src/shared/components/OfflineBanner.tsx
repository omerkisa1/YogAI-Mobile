import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface OfflineBannerProps {
	visible: boolean;
}

const OfflineBanner = ({ visible }: OfflineBannerProps) => {
	if (!visible) {
		return null;
	}

	return (
		<View style={styles.container}>
			<MaterialCommunityIcons name="wifi-off" size={16} color={colors.textOnPrimary} />
			<Text style={styles.text}>Internet baglantisi yok</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		backgroundColor: colors.error,
		paddingHorizontal: spacing.base,
		paddingVertical: spacing.xs,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: spacing.xs,
	},
	text: {
		...typography.captionMedium,
		color: colors.textOnPrimary,
	},
});

export default OfflineBanner;
