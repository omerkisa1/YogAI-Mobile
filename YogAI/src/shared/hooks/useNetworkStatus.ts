import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
	const [isOnline, setIsOnline] = useState(true);
	const [isİnternetReachable, setIsİnternetReachable] = useState<boolean | null>(null);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(state => {
			const connected = Boolean(state.isConnected);
			const reachable = state.isİnternetReachable;
			setIsOnline(connected && reachable !== false);
			setIsİnternetReachable(reachable);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	return {
		isOnline,
		isOffline: !isOnline,
		isİnternetReachable,
	};
};
