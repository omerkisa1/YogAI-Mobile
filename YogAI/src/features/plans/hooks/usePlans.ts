import { useQuery } from '@tanstack/react-query';
import { planService } from '../services/planService';

export const usePlans = () => {
	return useQuery({
		queryKey: ['plans'],
		queryFn: planService.getPlans,
	});
};
