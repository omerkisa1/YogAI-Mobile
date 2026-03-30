import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { MainTabParamList } from './types';

interface TabMeta {
	label: string;
	activeIcon: string;
	inactiveIcon: string;
}

const tabMetaMap: Record<keyof MainTabParamList, TabMeta> = {
	Home: { label: 'Ana Sayfa', activeIcon: 'home', inactiveIcon: 'home-outline' },
	Plans: { label: 'Planlar', activeIcon: 'calendar-text', inactiveIcon: 'calendar-text-outline' },
	Training: { label: 'Antrenman', activeIcon: 'yoga', inactiveIcon: 'yoga' },
	Profile: { label: 'Profil', activeIcon: 'account', inactiveIcon: 'account-outline' },
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
	const insets = useSafeAreaInsets();
	const containerBottomPadding = useMemo(() => Math.max(insets.bottom, spacing.sm), [insets.bottom]);

	return (
		<View style={[styles.wrapper, { paddingBottom: containerBottomPadding }]}> 
			<View style={styles.row}>
				{state.routes.map((route, index) => {
					const meta = tabMetaMap[route.name as keyof MainTabParamList];
					const isFocused = state.index === index;
					const color = isFocused ? colors.primary : colors.textMuted;
					const icon = isFocused ? meta.activeIcon : meta.inactiveIcon;

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: 'tabLongPress',
							target: route.key,
						});
					};

					const accessibilityLabel = descriptors[route.key]?.options.tabBarAccessibilityLabel ?? meta.label;

					return (
						<Pressable
							key={route.key}
							onPress={onPress}
							onLongPress={onLongPress}
							style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}
							accessibilityRole="button"
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={accessibilityLabel}
						>
							{isFocused ? <View style={styles.activeIndicator} /> : <View style={styles.inactiveIndicator} />}
							<MaterialCommunityIcons name={icon} size={24} color={color} />
							<Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>{meta.label}</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.surface,
		borderTopWidth: 1,
		borderTopColor: colors.borderLight,
		paddingHorizontal: spacing.base,
		paddingTop: spacing.xs,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	tabItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: spacing.xs,
		paddingBottom: spacing.xs,
		gap: spacing.xs,
	},
	activeIndicator: {
		width: 28,
		height: 3,
		borderRadius: radius.full,
		backgroundColor: colors.primary,
		marginBottom: spacing.xs,
	},
	inactiveIndicator: {
		width: 28,
		height: 3,
		borderRadius: radius.full,
		backgroundColor: 'transparent',
		marginBottom: spacing.xs,
	},
	tabLabel: {
		textAlign: 'center',
	},
	tabLabelActive: {
		...typography.captionMedium,
		color: colors.primary,
	},
	tabLabelInactive: {
		...typography.caption,
		color: colors.textMuted,
	},
	pressed: {
		opacity: 0.85,
	},
});

export default CustomTabBar;
