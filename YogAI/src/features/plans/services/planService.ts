import api from '../../../shared/api/axiosInstance';
import { CreatePlanRequest, Plan, PlanMetaUpdate } from '../../../shared/types/plan';

export const planService = {
	getPlans: () => api.get<Plan[]>('/api/v1/yoga/plans').then(response => response.data),
	getPlan: (id: string) => api.get<Plan>(`/api/v1/yoga/plans/${id}`).then(response => response.data),
	createPlan: (data: CreatePlanRequest) => api.post<Plan>('/api/v1/yoga/plan', data).then(response => response.data),
	updatePlan: (id: string, data: PlanMetaUpdate) =>
		api.patch<Plan>(`/api/v1/yoga/plans/${id}`, data).then(response => response.data),
	deletePlan: (id: string) => api.delete<{ success: boolean }>(`/api/v1/yoga/plans/${id}`).then(response => response.data),
};
