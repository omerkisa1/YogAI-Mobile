import React, { ReactNode, useEffect, useRef } from 'react';
import {
	Animated,
	Easing,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface BottomSheetProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
}

const BottomSheet = ({ visible, onClose, title, children }: BottomSheetProps) => {
	const translateY = useRef(new Animated.Value(320)).current;

	useEffect(() => {
		Animated.timing(translateY, {
			toValue: visible ? 0 : 320,
			duration: visible ? 260 : 180,
			easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start();
	}, [translateY, visible]);

	return (
		<Modal
			animationType="none"
			transparent
			visible={visible}
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<View style={styles.backdropRoot}>
				<Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Bottom sheet kapat" />
				<Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
					<View style={styles.handle} />
					{title ? <Text style={styles.title}>{title}</Text> : null}
					<View>{children}</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdropRoot: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.35)',
	},
	sheet: {
		backgroundColor: colors.surface,
		borderTopLeftRadius: radius.xl,
		borderTopRightRadius: radius.xl,
		paddingHorizontal: spacing.base,
		paddingBottom: spacing.xxl,
		paddingTop: spacing.sm,
		borderWidth: 1,
		borderColor: colors.borderLight,
	},
	handle: {
		alignSelf: 'center',
		width: 44,
		height: 4,
		borderRadius: radius.full,
		backgroundColor: colors.border,
		marginBottom: spacing.md,
	},
	title: {
		...typography.h4,
		color: colors.text,
		marginBottom: spacing.base,
	},
});

export default BottomSheet;
