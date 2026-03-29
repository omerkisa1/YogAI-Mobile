import api from '../../../shared/api/axiosInstance';
import { Profile } from '../../../shared/types/profile';

export const profileService = {
	getProfile: () => api.get<Profile>('/api/v1/profile').then(response => response.data),
	updateProfile: (data: Partial<Profile>) => api.put<Profile>('/api/v1/profile', data).then(response => response.data),
};
