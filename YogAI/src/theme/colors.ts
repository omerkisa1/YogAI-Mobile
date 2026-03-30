export const colors = {
	// Ana renkler
	primary: '#2D8B5E',
	primaryLight: '#3DAF75',
	primaryDark: '#1E6B45',
	primarySoft: '#E8F5EE',

	// Secondary — sıcak toprak
	secondary: '#C4956A',
	secondaryLight: '#D4AB85',
	secondarySoft: '#FDF5ED',

	// Accent — lavanta
	accent: '#7C6FAE',
	accentSoft: '#F0EDF7',

	// Arka planlar — SICAK tonlar, saf beyaz yok
	background: '#F5F4F0',
	backgroundElevated: '#EEEEE8',
	surface: '#FAFAF7',
	surfaceElevated: '#F0EFEB',
	surfaceWarm: '#FFF9F2',

	// Gradient tanımları
	gradientPrimary: ['#2D8B5E', '#1B5E3F'] as const,
	gradientWarm: ['#F8F7F4', '#F0EFEB'] as const,
	gradientHero: ['#1B5E3F', '#0F3D2A'] as const,
	gradientBeginner: ['#D4EDDA', '#A8D5B8'] as const,
	gradientIntermediate: ['#FFE8CC', '#FFD19A'] as const,
	gradientAdvanced: ['#F8D7DA', '#F1AEB5'] as const,

	// Stat kart arka planları
	statGreen: '#E8F5EE',
	statBlue: '#E3F2FD',
	statOrange: '#FFF3E0',
	statPurple: '#F3E5F5',

	// Text
	text: '#1C1C1E',
	textSecondary: '#6B7280',
	textMuted: '#9CA3AF',
	textOnPrimary: '#FFFFFF',
	textOnDark: '#FFFFFF',

	// Semantic
	success: '#34C759',
	successSoft: '#D4EDDA',
	warning: '#FF9500',
	warningSoft: '#FFF3E0',
	warningDark: '#E65100',
	error: '#FF3B30',
	errorSoft: '#FDECEA',
	info: '#007AFF',

	// Border
	border: '#E5E5E3',
	borderLight: '#F0EFEB',
	borderFocus: '#2D8B5E',

	// Difficulty
	difficulty1: '#34C759',
	difficulty2: '#5AC8FA',
	difficulty3: '#FF9500',
	difficulty4: '#FF6B35',
	difficulty5: '#FF3B30',

	// Kategori
	categoryStanding: '#2D8B5E',
	categorySeated: '#7C6FAE',
	categoryProne: '#C4956A',
	categorySupine: '#5AC8FA',
	categoryInversion: '#FF6B35',

	// Overlay
	overlay: 'rgba(0,0,0,0.5)',
	overlayLight: 'rgba(0,0,0,0.3)',
} as const;
