/**
 * SMS-related TypeScript types
 */

export interface SMSData {
  phoneNumber: string;
  message: string;
  timestamp: number;
  messageId: string;
}

export interface QueuedSMS extends SMSData {
  id: string;
  retryCount: number;
  createdAt: number;
}

export interface SMSApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
