import React, { useMemo, useState } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface InputProps {
	label?: string;
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	error?: string;
	secureTextEntry?: boolean;
	icon?: string;
	rightIcon?: string;
	onRightIconPress?: () => void;
	disabled?: boolean;
	multiline?: boolean;
	keyboardType?: TextInputProps['keyboardType'];
	autoCapitalize?: TextInputProps['autoCapitalize'];
	textContentType?: TextInputProps['textContentType'];
	accessibilityLabel?: string;
}

const Input = ({
	label,
	placeholder,
	value,
	onChangeText,
	error,
	secureTextEntry = false,
	icon,
	rightIcon,
	onRightIconPress,
	disabled = false,
	multiline = false,
	keyboardType,
	autoCapitalize = 'none',
	textContentType,
	accessibilityLabel,
}: InputProps) => {
	const [focused, setFocused] = useState(false);

	const containerStyle = useMemo(() => {
		if (disabled) {
			return styles.disabled;
		}

		if (error) {
			return styles.errorBorder;
		}

		if (focused) {
			return styles.focusedBorder;
		}

		return styles.defaultBorder;
	}, [disabled, error, focused]);

	return (
		<View style={styles.wrapper}>
			{label ? <Text style={styles.label}>{label}</Text> : null}
			<View style={[styles.inputContainer, containerStyle]}>
				{icon ? (
					<MaterialCommunityIcons
						name={icon}
						size={20}
						color={colors.textMuted}
						style={styles.leftIcon}
					/>
				) : null}
				<TextInput
					style={[styles.input, multiline && styles.multilineInput]}
					placeholder={placeholder}
					placeholderTextColor={colors.textMuted}
					value={value}
					onChangeText={onChangeText}
					editable={!disabled}
					secureTextEntry={secureTextEntry}
					multiline={multiline}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					textContentType={textContentType}
					accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
				/>
				{rightIcon ? (
					<Pressable
						onPress={onRightIconPress}
						disabled={disabled || !onRightIconPress}
						style={styles.rightIconButton}
						accessibilityRole="button"
						accessibilityLabel="Girdi aksiyon ikonu"
					>
						<MaterialCommunityIcons
							name={rightIcon}
							size={20}
							color={colors.textMuted}
						/>
					</Pressable>
				) : null}
			</View>
			{error ? <Text style={styles.errorText}>{error}</Text> : null}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		marginBottom: spacing.base,
	},
	label: {
		...typography.label,
		color: colors.textSecondary,
		marginBottom: spacing.xs,
	},
	inputContainer: {
		minHeight: 50,
		borderWidth: 1,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		paddingHorizontal: spacing.md,
		flexDirection: 'row',
		alignItems: 'center',
	},
	defaultBorder: {
		borderColor: colors.border,
	},
	focusedBorder: {
		borderColor: colors.primary,
	},
	errorBorder: {
		borderColor: colors.error,
	},
	disabled: {
		opacity: 0.6,
	},
	leftIcon: {
		marginRight: spacing.sm,
	},
	input: {
		...typography.body,
		color: colors.text,
		flex: 1,
		paddingVertical: spacing.sm,
	},
	multilineInput: {
		minHeight: 96,
		textAlignVertical: 'top',
	},
	rightIconButton: {
		marginLeft: spacing.sm,
		padding: spacing.xs,
	},
	errorText: {
		...typography.caption,
		color: colors.error,
		marginTop: spacing.xs,
	},
});

export default Input;
