import { DeviceEventEmitter } from 'react-native';

// Event name for dashboard updates
export const DASHBOARD_UPDATE_EVENT = 'dashboard_update';

// Function to trigger dashboard update
export const triggerDashboardUpdate = () => {
  DeviceEventEmitter.emit(DASHBOARD_UPDATE_EVENT);
};
