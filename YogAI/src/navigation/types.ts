export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
};

export type MainTabParamList = {
	Home: undefined;
	Plans: undefined;
	Training: undefined;
	Profile: undefined;
};

export type RootStackParamList = {
	MainTabs: undefined;
	PlanDetail: { planId: string };
	CreatePlan: undefined;
	EditProfile: undefined;
	TrainingSession: { planId: string; sessionId: string };
};
