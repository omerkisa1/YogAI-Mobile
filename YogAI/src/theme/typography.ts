import { Platform } from 'react-native';

const baseFontFamily = Platform.select({
	ios: 'System',
	android: 'sans-serif',
	default: 'System',
});

export const typography = {
	h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, fontFamily: baseFontFamily },
	h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28, fontFamily: baseFontFamily },
	h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, fontFamily: baseFontFamily },
	body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22, fontFamily: baseFontFamily },
	bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, fontFamily: baseFontFamily },
	caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, fontFamily: baseFontFamily },
	button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22, fontFamily: baseFontFamily },
};
