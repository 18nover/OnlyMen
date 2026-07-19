# Expo SDK 54 Guide — Nova Knowledge Base

## Overview

Expo SDK 54 (React Native 0.81, React 19.1) is the foundation for the
OnlyMen mobile application.

### In this codebase (`app/`)
- **Expo Go is not a shipping mechanism.** The app uses custom native
  modules (`app/modules/`: bottom-sheet, expo-bluesky-swiss-army, video
  compress, receive-android-intents, …) so real builds go through
  `eas build` / development builds (`pnpm android` on a dev build). Web
  runs via `pnpm web`.
- Platform-specific files (`.web.tsx`, `.native.tsx`, `.ios.tsx`,
  `.android.tsx`) are resolved by the bundler — import the base path,
  never conditional `require()`. Runtime detection: `IS_WEB`/`IS_NATIVE`
  from `#/env`.
- i18n is Lingui 5 — all user-facing strings wrapped (`l\`\`` /
  `<Trans>`); extraction/compilation is CI-only, never run locally.
- Camera usage in this app is limited to standard permission-gated flows
  (QR scanning, media capture) — there is no vision/object-detection
  product surface.

---

## 1. Key Modules

### Camera (expo-camera)
```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';

function ProfilePhoto() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View>
        <Text>Camera permission required</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.7,
      skipProcessing: true, // faster capture
    });
    if (photo) {
      // Handle photo
    }
  };

  return (
    <CameraView ref={cameraRef} style={styles.camera} facing="front">
      <Button onPress={takePhoto} title="Take Photo" />
    </CameraView>
  );
}
```

**Best practices:**
- Always check permission before rendering camera preview
- Use `skipProcessing: true` for faster capture
- Release camera resources when component unmounts
- Handle both front and back cameras
- Test on physical device (simulator camera is limited)

### Location (expo-location)
```tsx
import * as Location from 'expo-location';

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

// Background location for stream alerts
async function startBackgroundLocation() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') return;

  await Location.startLocationUpdatesAsync('location-task', {
    accuracy: Location.Accuracy.Low,
    distanceInterval: 100, // meters
    deferredUpdatesInterval: 60_000, // ms
  });
}
```

**Best practices:**
- Use `Accuracy.Balanced` unless high precision is needed
- Request foreground permission before background
- Handle permission denial gracefully
- Minimize background location updates for battery
- Cache location data to avoid repeated API calls

### Notifications (expo-notifications)
```tsx
import * as Notifications from 'expo-notifications';

// Configure notification handler (top of app)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  // Send token to your server
  return token.data;
}

// Schedule local notification
async function scheduleReminder(title: string, body: string, delay: number) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delay },
  });
}
```

**Best practices:**
- Register for push notifications on app start
- Handle notification responses (deep linking)
- Use channels for Android notification categories
- Test on physical device (push notifications don't work on simulator)
- Store push tokens server-side, update on each login

### SecureStore (expo-secure-store)
```tsx
import * as SecureStore from 'expo-secure-store';

// Store sensitive data
async function storeAuthToken(token: string) {
  await SecureStore.setItemAsync('auth-token', token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED, // iOS only
  });
}

// Retrieve sensitive data
async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('auth-token');
}

// Store with options
async function storeUserCredentials(username: string, password: string) {
  await SecureStore.setItemAsync('credentials', JSON.stringify({ username, password }));
}

// Delete
async function clearAuth() {
  await SecureStore.deleteItemAsync('auth-token');
}
```

**Best practices:**
- Use for auth tokens, API keys, sensitive user data
- Don't store large data (512-byte limit on some platforms)
- Prefer SecureStore over AsyncStorage for sensitive data
- Handle null returns (data may not exist yet)
- Use keychain access control on iOS for additional security

### FileSystem (expo-file-system)
```tsx
import * as FileSystem from 'expo-file-system';

// Read/write files
async function saveChatHistory(messages: Message[]) {
  const path = FileSystem.documentDirectory + 'chat-history.json';
  await FileSystem.writeAsStringAsync(path, JSON.stringify(messages));
}

async function loadChatHistory(): Promise<Message[]> {
  const path = FileSystem.documentDirectory + 'chat-history.json';
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return [];

  const content = await FileSystem.readAsStringAsync(path);
  return JSON.parse(content);
}

// Download files
async function downloadOverlay(url: string): Promise<string> {
  const fileUri = FileSystem.documentDirectory + 'overlay.png';
  const { uri } = await FileSystem.downloadAsync(url, fileUri);
  return uri;
}

// Check storage info
async function getStorageInfo() {
  const total = await FileSystem.getTotalDiskCapacityAsync();
  const free = await FileSystem.getFreeDiskStorageAsync();
  return { total, free, used: total - free };
}
```

**Best practices:**
- Use `documentDirectory` for user data (persists)
- Use `cacheDirectory` for temporary/cache data
- Handle file not found errors gracefully
- Clean up old cache files periodically
- Check available storage before large downloads

---

## 2. Development Builds vs Expo Go

### When to Use Each

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Quick prototyping | Yes | No |
| Expo modules only | Yes | Yes |
| Custom native modules | No | Yes |
| Custom configuration | Limited | Full |
| Push notifications | Limited | Full |
| Performance testing | No | Yes |
| Production builds | No | Yes |

### Creating Development Builds
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to EAS
eas login

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Local development build (faster iteration)
npx expo run:ios
npx expo run:android
```

### EAS Build Profiles (eas.json)
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-id"
      }
    }
  }
}
```

### Local Development
```bash
# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run with specific device
npx expo run:ios --device "iPhone 15 Pro"

# Start Metro bundler separately
npx expo start --dev-client
```

---

## 3. EAS Integration

### EAS Submit
```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android

# Submit to both
eas submit --platform all
```

### EAS Update (OTA)
```bash
# Install EAS Update
npx expo install expo-updates

# Configure in app.json/app.config.js
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID",
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD"
    }
  }
}

# Push OTA update
eas update --branch production --message "Bug fix for chat loading"

# Create channel
eas channel:create production
eas channel:create preview
```

### EAS Workflows
```bash
# Create workflow configuration
# .github/workflows/build.yml
name: Build
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

---

## 4. OTA Updates

### Setup
```bash
npx expo install expo-updates
```

### Configuration
```js
// app.config.js
export default {
  expo: {
    updates: {
      url: 'https://u.expo.dev/YOUR_PROJECT_ID',
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
      enabled: true,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};
```

### Best Practices
- Use OTA for JavaScript-only changes (no native code changes)
- Test updates in preview channel before production
- Implement rollback strategy
- Use `fallbackToCacheTimeout` for offline scenarios
- Monitor update adoption rates
- Version your updates with meaningful messages

### Limitations
- Cannot update native code (requires new build)
- Cannot update new native modules
- Cannot update app icon or splash screen
- Large updates may fail on slow connections
- Users on very old versions may not receive updates

---

## 5. Native Module Development

### When to Create Custom Modules
- Expo SDK doesn't provide the functionality you need
- You need platform-specific APIs not covered by Expo
- Performance-critical native code
- Integration with third-party native SDKs

### Creating a Module
```bash
# Create module from template
npx create-expo-module@latest my-module

# Or manually
mkdir -p modules/my-module
cd modules/my-module
npm init -y
```

### Module Structure
```
modules/my-module/
├── ios/
│   ├── MyModule.swift
│   └── MyModule.podspec
├── android/
│   ├── src/main/java/expo/modules/mymodule/
│   │   └── MyModule.kt
│   └── build.gradle
├── src/
│   ├── index.ts
│   └── MyModule.types.ts
├── expo-module.config.json
└── package.json
```

### TypeScript Interface
```ts
// src/index.ts
import { requireNativeModule } from 'expo-modules-core';

export default requireNativeModule('MyModule');

// src/MyModule.types.ts
export interface MyModuleInterface {
  hello(): string;
  addAsync(a: number, b: number): Promise<number>;
}
```

### iOS Implementation (Swift)
```swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    AsyncFunction("addAsync") { (a: Double, b: Double) in
      return a + b
    }

    Function("hello") {
      return "Hello from Swift!"
    }
  }
}
```

### Android Implementation (Kotlin)
```kotlin
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    AsyncFunction("addAsync") { a: Double, b: Double ->
      a + b
    }

    Function("hello") {
      "Hello from Kotlin!"
    }
  }
}
```

---

## 6. Compatibility Matrix

### SDK 54 Key Dependencies
| Package | Version | Notes |
|---------|---------|-------|
| React Native | 0.76.x | New Architecture enabled by default |
| React | 18.3.1 | |
| TypeScript | ~5.3.3 | |
| Metro | 0.80.x | Bundler |
| React Navigation | 7.x | Compatible |
| Expo Router | 4.x | File-based routing |
| Hermes | Default | JS engine |

### Platform Requirements
| Platform | Minimum | Recommended |
|----------|---------|-------------|
| iOS | 15.1+ | 17.0+ |
| Android | API 24+ (7.0) | API 34+ (14) |
| Node.js | 18+ | 20+ |
| Xcode | 15+ | 16+ |
| Java | 17 | 17+ |

### Breaking Changes from SDK 53
- New Architecture enabled by default (opt-out available)
- Updated Metro bundler configuration
- React Navigation 7 compatibility required
- Some deprecated modules removed
- Updated minimum OS versions

### Migration Checklist
- [ ] Update `expo` package to SDK 54
- [ ] Run `npx expo install --fix` to update compatible packages
- [ ] Review SDK changelog for breaking changes
- [ ] Test on both platforms (iOS simulator, Android emulator)
- [ ] Update native code if using custom modules
- [ ] Test OTA updates with new runtime version
- [ ] Verify push notification configuration
- [ ] Update CI/CD pipeline for new SDK

---

## 7. Common Patterns

### App Configuration
```js
// app.config.js
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'onlymen',
  slug: 'onlymen',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'onlymen',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.onlymen.app',
    infoPlist: {
      NSCameraUsageDescription: 'Used for profile photos and post attachments',
      NSLocationWhenInUseUsageDescription: 'Used for location-based features',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'com.onlymen.app',
    permissions: [
      'CAMERA',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
    ],
  },
  plugins: [
    'expo-camera',
    'expo-location',
    'expo-notifications',
    'expo-secure-store',
  ],
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
});
```

### Environment Configuration
```ts
// config.ts
import Constants from 'expo-constants';

const ENV = {
  development: {
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
    enableDevTools: true,
  },
  preview: {
    apiUrl: 'https://staging-api.onlymen.com',
    wsUrl: 'wss://staging-api.onlymen.com',
    enableDevTools: false,
  },
  production: {
    apiUrl: 'https://api.onlymen.com',
    wsUrl: 'wss://api.onlymen.com',
    enableDevTools: false,
  },
};

type Environment = keyof typeof ENV;

export function getEnvironment(): Environment {
  const channel = Constants.expoConfig?.extra?.eas?.channel;
  if (channel === 'production') return 'production';
  if (channel === 'preview') return 'preview';
  return 'development';
}

export const config = ENV[getEnvironment()];
```
