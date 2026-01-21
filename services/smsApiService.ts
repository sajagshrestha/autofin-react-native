import protectedAxiosClient from "@/lib/axios";
import {SMSApiResponse, SMSData} from "@/types/sms";

/**
 * SMS API Service
 *
 * Handles API calls to the dummy endpoint for SMS data.
 * Uses the protected axios client which automatically attaches JWT tokens.
 */

const SMS_API_ENDPOINT = process.env.EXPO_PUBLIC_SMS_API_ENDPOINT || "localhost:3000/api/sms";

/**
 * Send SMS data to the dummy endpoint
 *
 * @param smsData - The SMS data to send
 * @returns Promise resolving to API response
 */
export const sendSMSToAPI = async (smsData: SMSData): Promise<SMSApiResponse> => {
  try {
    const response = await protectedAxiosClient.post<SMSApiResponse>(SMS_API_ENDPOINT, {
      phoneNumber: smsData.phoneNumber,
      message: smsData.message,
      timestamp: smsData.timestamp,
      messageId: smsData.messageId
    });

    return {
      success: true,
      messageId: response.data.messageId || smsData.messageId
    };
  } catch (error: any) {
    console.error("Failed to send SMS to API:", error);

    return {
      success: false,
      error: error.response?.data?.message || error.message || "Unknown error"
    };
  }
};

/**
 * Check if the API endpoint is reachable
 *
 * @returns Promise resolving to boolean indicating if API is reachable
 */
export const checkAPIAvailability = async (): Promise<boolean> => {
  try {
    // Try a simple HEAD or GET request to check connectivity
    await protectedAxiosClient.get(SMS_API_ENDPOINT.replace("/api/sms", "/health"), {
      timeout: 3000
    });
    return true;
  } catch (error) {
    // If endpoint doesn't exist, that's okay - we just want to check network
    // For now, we'll assume network is available if the error is not due to network problems
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as {code?: string}).code;
      return code !== "ECONNABORTED" && code !== "ERR_NETWORK";
    }
    // If error doesn't have a code property, conservatively assume API is not available
    return false;
  }
};
