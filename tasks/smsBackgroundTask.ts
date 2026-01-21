import { processQueuedSMS } from '@/services/smsListenerService';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

/**
 * Background Task for SMS Receiver
 * 
 * This task processes queued SMS messages in the background.
 * Note: SMS listening itself is handled natively by react-native-android-sms-listener.
 */

const SMS_RECEIVER_TASK = 'SMS_RECEIVER_TASK';

/**
 * Register the background task
 * This should be called when the app initializes
 */
export const registerSMSBackgroundTask = async () => {
  if (Platform.OS !== 'android') {
    console.log('SMS background task only available on Android');
    return;
  }

  try {
    await BackgroundTask.registerTaskAsync(SMS_RECEIVER_TASK, {
      minimumInterval: 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('SMS background task registered');
  } catch (error) {
    console.error('Failed to register SMS background task:', error);
  }
};

/**
 * Unregister the background task
 */
export const unregisterSMSBackgroundTask = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await BackgroundTask.unregisterTaskAsync(SMS_RECEIVER_TASK);
    console.log('SMS background task unregistered');
  } catch (error) {
    console.error('Failed to unregister SMS background task:', error);
  }
};

/**
 * Define the background task handler
 * This processes queued SMS messages when the task runs
 */
TaskManager.defineTask(SMS_RECEIVER_TASK, async () => {
  try {
    console.log('Background task: Processing queued SMS');
    await processQueuedSMS();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
