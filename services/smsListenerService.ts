import { checkNetworkAvailability } from '@/hooks/useNetworkState';
import { SMSData } from '@/types/sms';
import { PermissionsAndroid, Platform } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { sendSMSToAPI } from './smsApiService';
import { addToQueue, getQueue, incrementRetryCount, removeFromQueue } from './smsQueueService';

/**
 * SMS Listener Service
 * 
 * Main service that orchestrates SMS listening, API calls, and queue management.
 * Only works on Android platform.
 * 
 * Note: This requires a development build - it won't work in Expo Go.
 */

interface ReceivedSmsMessage {
  originatingAddress: string;
  body: string;
  timestamp: number;
}

let isListening = false;
let smsSubscription: { remove: () => void } | null = null;

/**
 * Check if SMS receiver module is available
 */
const isSMSReceiverAvailable = (): boolean => {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  if (!SmsListener) {
    console.warn(
      '⚠️ SMS Receiver native module is not available.\n' +
      'This feature requires a development build (not Expo Go).\n' +
      'To fix this:\n' +
      '1. Run: npx expo prebuild\n' +
      '2. Run: npx expo run:android\n' +
      'Or use EAS Build: eas build --profile development --platform android'
    );
    return false;
  }
  
  return true;
};

/**
 * Process a single SMS message
 * Checks network state and either sends to API or queues for later
 * 
 * @param smsData - The SMS data to process
 */
export const processSMS = async (smsData: SMSData): Promise<void> => {
  try {
    const isOnline = await checkNetworkAvailability();

    if (isOnline) {
      // Try to send to API
      const result = await sendSMSToAPI(smsData);
      
      if (result.success) {
        console.log(`SMS sent to API successfully: ${smsData.messageId}`);
      } else {
        // If API call fails, queue it for retry
        console.log(`Failed to send SMS to API, queuing: ${smsData.messageId}`);
        await addToQueue(smsData);
      }
    } else {
      // Network is offline, queue the message
      console.log(`Network offline, queuing SMS: ${smsData.messageId}`);
      await addToQueue(smsData);
    }
  } catch (error) {
    console.error('Error processing SMS:', error);
    // On error, queue the message to ensure it's not lost
    try {
      await addToQueue(smsData);
    } catch (queueError) {
      console.error('Failed to queue SMS after error:', queueError);
    }
  }
};

/**
 * Process all queued SMS messages
 * Attempts to send all queued messages to the API
 */
export const processQueuedSMS = async (): Promise<void> => {
  try {
    const isOnline = await checkNetworkAvailability();
    
    if (!isOnline) {
      console.log('Network offline, skipping queue processing');
      return;
    }

    const queue = await getQueue();
    
    if (queue.length === 0) {
      console.log('No queued SMS to process');
      return;
    }

    console.log(`Processing ${queue.length} queued SMS messages`);

    // Process each queued message
    for (const queuedSMS of queue) {
      try {
        const result = await sendSMSToAPI({
          phoneNumber: queuedSMS.phoneNumber,
          message: queuedSMS.message,
          timestamp: queuedSMS.timestamp,
          messageId: queuedSMS.messageId,
        });

        if (result.success) {
          // Successfully sent, remove from queue
          await removeFromQueue(queuedSMS.id);
          console.log(`Queued SMS sent successfully: ${queuedSMS.id}`);
        } else {
          // Failed, increment retry count
          const updated = await incrementRetryCount(queuedSMS.id);
          if (updated) {
            console.log(`Queued SMS failed, retry count: ${updated.retryCount}/3`);
          }
        }
      } catch (error) {
        console.error(`Error processing queued SMS ${queuedSMS.id}:`, error);
        // Increment retry count on error
        await incrementRetryCount(queuedSMS.id);
      }
    }
  } catch (error) {
    console.error('Error processing queued SMS:', error);
  }
};

/**
 * Handle incoming SMS event
 * 
 * @param message - SMS message from react-native-android-sms-listener
 */
const handleIncomingSMS = async (message: ReceivedSmsMessage) => {
  try {
    console.log('SMS received:', message);

    const smsData: SMSData = {
      phoneNumber: message.originatingAddress || 'unknown',
      message: message.body || '',
      timestamp: message.timestamp || Date.now(),
      messageId: `${message.timestamp || Date.now()}_${Math.random()}`,
    };

    await processSMS(smsData);
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
  }
};

/**
 * Request SMS permissions (Android only)
 * 
 * @returns Promise resolving to boolean indicating if permissions were granted
 */
export const requestSMSPermissions = async (): Promise<boolean> => {
  if (!isSMSReceiverAvailable()) {
    return false;
  }

  try {
    // Check if permissions are already granted
    const hasReadSmsPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
    const hasReceiveSmsPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
    );

    if (hasReadSmsPermission && hasReceiveSmsPermission) {
      console.log('SMS permissions already granted');
      return true;
    }

    // Request permissions
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);

    const hasPermission =
      granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
        PermissionsAndroid.RESULTS.GRANTED;

    console.log('SMS permission granted:', hasPermission);
    return hasPermission;
  } catch (error) {
    console.error('Failed to request SMS permissions:', error);
    return false;
  }
};

/**
 * Start listening for incoming SMS (Android only)
 */
export const startSMSListener = async (): Promise<boolean> => {
  if (!isSMSReceiverAvailable()) {
    return false;
  }

  if (isListening) {
    console.log('SMS listener already running');
    return true;
  }

  try {
    // Request permissions first
    const hasPermission = await requestSMSPermissions();
    if (!hasPermission) {
      console.error('SMS permissions not granted');
      return false;
    }

    // Start listening for SMS
    smsSubscription = SmsListener.addListener((message: ReceivedSmsMessage) => {
      handleIncomingSMS(message);
    });

    isListening = true;
    console.log('SMS listener started successfully');

    // Process any existing queued messages
    processQueuedSMS().catch((err) => {
      console.error('Failed to process queued SMS:', err);
    });

    return true;
  } catch (error) {
    console.error('Failed to start SMS listener:', error);
    isListening = false;
    return false;
  }
};

/**
 * Stop listening for incoming SMS
 */
export const stopSMSListener = async (): Promise<void> => {
  if (!isListening) {
    return;
  }

  try {
    // Remove SMS listener subscription
    if (smsSubscription) {
      smsSubscription.remove();
      smsSubscription = null;
    }
    
    isListening = false;
    console.log('SMS listener stopped');
  } catch (error) {
    console.error('Failed to stop SMS listener:', error);
  }
};

/**
 * Initialize SMS listener service
 * Should be called when the app starts
 */
export const initializeSMSListener = async (): Promise<void> => {
  if (!isSMSReceiverAvailable()) {
    console.warn('SMS listener cannot be initialized. This feature requires a development build with native modules properly linked.');
    return;
  }

  try {
    await startSMSListener();
  } catch (error) {
    console.error('Failed to initialize SMS listener:', error);
  }
};
