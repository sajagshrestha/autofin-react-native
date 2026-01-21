declare module 'react-native-android-sms-listener' {
  interface ReceivedSmsMessage {
    originatingAddress: string;
    body: string;
    timestamp: number;
  }

  interface CancellableSubscription {
    remove: () => void;
  }

  interface SmsListener {
    addListener(
      listener: (message: ReceivedSmsMessage) => void
    ): CancellableSubscription;
  }

  const SmsListener: SmsListener;
  export default SmsListener;
}
