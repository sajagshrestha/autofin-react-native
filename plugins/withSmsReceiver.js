const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for react-native-android-sms-listener
 * 
 * This plugin adds the necessary Android permissions (RECEIVE_SMS, READ_SMS)
 * to the AndroidManifest.xml
 */
const withSmsReceiver = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    // Add permissions if not already present
    const permissions = manifest.manifest?.usesPermission || [];
    const permissionNames = permissions.map((p) => p.$['android:name']);

    const requiredPermissions = [
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_SMS',
    ];

    requiredPermissions.forEach((permission) => {
      if (!permissionNames.includes(permission)) {
        permissions.push({
          $: { 'android:name': permission },
        });
      }
    });

    manifest.manifest.usesPermission = permissions;

    return config;
  });
};

module.exports = withSmsReceiver;
