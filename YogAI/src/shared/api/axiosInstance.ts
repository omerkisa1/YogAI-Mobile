import auth from '@react-native-firebase/auth';
import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
	baseURL: API_URL,
	timeout: 30000,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async config => {
	const user = auth().currentUser;
	if (user) {
		const token = await user.getIdToken();
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	response => response,
	async error => {
		if (error.response?.status === 401) {
			const user = auth().currentUser;
			if (user && error.config && !error.config.__retried) {
				const freshToken = await user.getIdToken(true);
				const retryConfig = {
					...error.config,
					__retried: true,
					headers: {
						...error.config.headers,
						Authorization: `Bearer ${freshToken}`,
					},
				};
				return api.request(retryConfig);
			}
		}
		return Promise.reject(error);
	},
);

export default api;
