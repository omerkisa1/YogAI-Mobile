import api from '../../../shared/api/axiosInstance';
import {
	StartSessionResponse,
	SubmitPoseRequest,
	TrainingSession,
	TrainingStats,
} from '../../../shared/types/training';

export const trainingService = {
	startSession: (planId: string) =>
		api.post<StartSessionResponse>('/api/v1/training/start', { plan_id: planId }).then(response => response.data),
	submitPose: (sessionId: string, data: SubmitPoseRequest) =>
		api.post(`/api/v1/training/sessions/${sessionId}/pose`, data).then(response => response.data),
	completeSession: (sessionId: string) =>
		api.post(`/api/v1/training/sessions/${sessionId}/complete`).then(response => response.data),
	getSessions: () => api.get<TrainingSession[]>('/api/v1/training/sessions').then(response => response.data),
	getSession: (id: string) => api.get<TrainingSession>(`/api/v1/training/sessions/${id}`).then(response => response.data),
	getStats: () => api.get<TrainingStats>('/api/v1/training/stats').then(response => response.data),
};
