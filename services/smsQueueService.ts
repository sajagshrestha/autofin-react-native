import { QueuedSMS, SMSData } from '@/types/sms';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SMS Queue Service
 * 
 * Manages offline SMS queue using AsyncStorage.
 * Handles adding, retrieving, and removing queued SMS messages.
 */

const QUEUE_STORAGE_KEY = 'sms_queue';
const MAX_RETRY_COUNT = 3;

/**
 * Add SMS to the offline queue
 * 
 * @param smsData - The SMS data to queue
 * @returns Promise resolving to the queued SMS with ID
 */
export const addToQueue = async (smsData: SMSData): Promise<QueuedSMS> => {
  try {
    const queue = await getQueue();
    
    const queuedSMS: QueuedSMS = {
      ...smsData,
      id: `${smsData.messageId}_${Date.now()}`,
      retryCount: 0,
      createdAt: Date.now(),
    };

    queue.push(queuedSMS);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    
    console.log(`SMS queued: ${queuedSMS.id}`);
    return queuedSMS;
  } catch (error) {
    console.error('Failed to add SMS to queue:', error);
    throw error;
  }
};

/**
 * Get all queued SMS messages
 * 
 * @returns Promise resolving to array of queued SMS messages
 */
export const getQueue = async (): Promise<QueuedSMS[]> => {
  try {
    const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (!queueData) {
      return [];
    }
    return JSON.parse(queueData) as QueuedSMS[];
  } catch (error) {
    console.error('Failed to get SMS queue:', error);
    return [];
  }
};

/**
 * Remove SMS from the queue
 * 
 * @param id - The ID of the queued SMS to remove
 * @returns Promise resolving to boolean indicating success
 */
export const removeFromQueue = async (id: string): Promise<boolean> => {
  try {
    const queue = await getQueue();
    const filteredQueue = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filteredQueue));
    console.log(`SMS removed from queue: ${id}`);
    return true;
  } catch (error) {
    console.error('Failed to remove SMS from queue:', error);
    return false;
  }
};

/**
 * Update retry count for a queued SMS
 * 
 * @param id - The ID of the queued SMS
 * @returns Promise resolving to updated queued SMS or null if not found
 */
export const incrementRetryCount = async (id: string): Promise<QueuedSMS | null> => {
  try {
    const queue = await getQueue();
    const itemIndex = queue.findIndex((item) => item.id === id);
    
    if (itemIndex === -1) {
      return null;
    }

    const item = queue[itemIndex];
    if (item.retryCount >= MAX_RETRY_COUNT) {
      // Remove if max retries reached
      await removeFromQueue(id);
      console.log(`SMS removed after max retries: ${id}`);
      return null;
    }

    item.retryCount += 1;
    queue[itemIndex] = item;
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    
    return item;
  } catch (error) {
    console.error('Failed to increment retry count:', error);
    return null;
  }
};

/**
 * Clear all queued SMS messages
 * 
 * @returns Promise resolving to boolean indicating success
 */
export const clearQueue = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    console.log('SMS queue cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear SMS queue:', error);
    return false;
  }
};

/**
 * Get queue size
 * 
 * @returns Promise resolving to number of queued messages
 */
export const getQueueSize = async (): Promise<number> => {
  const queue = await getQueue();
  return queue.length;
};
