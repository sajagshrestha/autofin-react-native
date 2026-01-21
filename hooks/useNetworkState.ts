import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Custom hook to monitor network state
 * 
 * @returns Object containing isConnected and networkType
 */
export const useNetworkState = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setNetworkType(state.type);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
      setNetworkType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { isConnected, networkType };
};

/**
 * Check if network is currently available
 * 
 * @returns Promise resolving to boolean indicating network availability
 */
export const checkNetworkAvailability = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Failed to check network availability:', error);
    return false;
  }
};
