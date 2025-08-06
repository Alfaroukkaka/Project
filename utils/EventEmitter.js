import { DeviceEventEmitter } from 'react-native';

// Event names
export const EVENTS = {
  DONATION_MADE: 'donation_made',
  DASHBOARD_UPDATE: 'dashboard_update',
};

// Event emitter instance
class AppEventEmitter {
  static emit(eventName, data) {
    DeviceEventEmitter.emit(eventName, data);
  }

  static addListener(eventName, handler) {
    return DeviceEventEmitter.addListener(eventName, handler);
  }
}

export default AppEventEmitter;
