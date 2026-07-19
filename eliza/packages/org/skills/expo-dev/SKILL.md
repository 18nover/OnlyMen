---
name: expo-dev
description: >
  Expo development skill for Nova and Circuit. Covers Expo SDK 54, Expo Router
  for file-based routing, development builds vs Expo Go, EAS Build and Update
  workflows, Expo Modules API for native code, platform APIs, environment
  configuration, prebuild customization, and expo-updates for OTA delivery.
metadata:
  author: OnlyMen Engineering
  team: Nova, Circuit
  version: 1.0.0
  tags:
    - expo
    - expo-router
    - eas
    - expo-modules
    - ota-updates
    - sdk-54
---

# Expo Development

Skill for building, configuring, and deploying Expo-based applications within
the OnlyMen engineering organization. Targets Nova and Circuit projects on
Expo SDK 54.

---

## Expo SDK 54

### Baseline Requirements

- Node.js >= 20
- Expo CLI latest (`npx expo install --fix` to align versions)
- `expo` package at `~54.0.0`
- TypeScript 5.x with strict mode

### Key Packages

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `expo-image` | Performant image loading |
| `expo-constants` | Runtime configuration |
| `expo-secure-store` | Encrypted keychain storage |
| `expo-font` | Custom font loading |
| `expo-splash-screen` | Splash screen control |
| `expo-status-bar` | Status bar management |
| `expo-linking` | Deep link construction |
| `expo-updates` | OTA update delivery |
| `expo-build-properties` | Native build config |

### Version Alignment

Run `npx expo install --fix` after every SDK upgrade. This aligns all
`expo-*` package versions to the SDK target. Never manually pin
`expo-*` versions — the SDK compatibility matrix controls them.

---

## Expo Router

### File-System Routing

Expo Router maps the `app/` directory to navigation routes.

```
app/
  _layout.tsx          # Root layout (providers, fonts)
  index.tsx            # / (home)
  feed/
    _layout.tsx        # Feed tab navigator
    index.tsx          # /feed
    [id].tsx           # /feed/:id
  profile/
    index.tsx          # /profile
    [did].tsx          # /profile/:did
```

### Layout Convention

Every directory that contains routes must have a `_layout.tsx`. The root
`_layout.tsx` wraps all providers.

```tsx
import { Stack } from 'expo-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  )
}
```

### Navigation Patterns

- **Stack navigation**: Use `<Stack.Screen>` for push/pop flow.
- **Tab navigation**: Use `<Tabs>` from `expo-router` for bottom tabs.
- **Modal presentation**: Set `presentation: 'modal'` on the target
  `<Stack.Screen>`.

### Typed Routes

Enable typed routes in `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["expo-router", { "typedRoutes": true }]
    ]
  }
}
```

Type-safe navigation prevents runtime errors from misspelled route names.

### Deep Linking

Expo Router handles deep link parsing automatically. Register your scheme in
`app.json`:

```json
{
  "expo": {
    "scheme": "onlymen"
  }
}
```

Handle incoming links in `app/_layout.tsx` via the `LinkingContext`.

---

## Development Builds

### Expo Go vs Development Builds

Expo Go is for prototyping only. All Nova and Circuit development must use
custom development builds for access to native modules and configuration.

### Creating a Development Build

```bash
# iOS (requires macOS or EAS)
npx expo run:ios

# Android
npx expo run:android

# Or via EAS for CI/CD
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Dev Client Configuration

The development client is included via `expo-dev-client`. Add it to
`app.json`:

```json
{
  "expo": {
    "plugins": ["expo-dev-client"]
  }
}
```

Development builds connect to your local Metro bundler automatically when
available. If Metro is not running, the build loads from the embedded bundle.

---

## EAS Builds

### eas.json Configuration

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging.api.onlymen.dev"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.onlymen.dev"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "team@onlymen.dev",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

### Build Profiles

| Profile | Purpose | Distribution |
|---|---|---|
| `development` | Local dev with dev client | Internal (ad-hoc/internal) |
| `preview` | QA and stakeholder testing | Internal |
| `production` | App Store / Play Store release | Store |

### EAS Update

Push OTA updates without a full app store submission:

```bash
# Publish an update
eas update --branch production --message "Fix feed pagination"

# Roll back
eas update --branch production --message "Rollback" --rollback
```

Configure the update channel in `eas.json` and `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

---

## Expo Modules API

### When to Use

Use the Expo Modules API when you need native code that is not available
through existing Expo packages. It provides a Swift/Kotlin-first API for
writing native modules.

### Module Structure

```
modules/
  my-module/
    ios/
      MyModule.swift
    android/
      build.gradle
      src/main/java/.../MyModule.kt
    src/
      index.ts
    expo-module.config.json
```

### expo-module.config.json

```json
{
  "platforms": ["ios", "android"],
  "ios": {
    "modules": ["MyModule"]
  },
  "android": {
    "modules": ["com.onlymen.mymodule.MyModule"]
  }
}
```

### TypeScript Bridge

```ts
import { requireNativeModule } from 'expo-modules-core'

export default requireNativeModule('MyModule')
```

Always type the native module interface explicitly in TypeScript. Do not
rely on runtime inference.

---

## Platform APIs

### Accessing Native APIs

Use Expo packages for platform APIs whenever possible:

| Need | Package |
|---|---|
| Camera | `expo-camera` |
| Media Library | `expo-media-library` |
| Notifications | `expo-notifications` |
| File System | `expo-file-system` |
| Haptics | `expo-haptics` |
| Location | `expo-location` |
| Auth Session | `expo-auth-session` |
| Crypto | `expo-crypto` |
| Keep Screen On | `expo-keep-awake` |

### Platform-Specific Code

Use `Platform.OS` for minor behavioral differences:

```tsx
import { Platform } from 'react-native'

const-analytics = Platform.OS === 'ios' ? 'Appplitude' : 'Firebase'
```

For full component differences, use file extensions (`.ios.tsx`, `.android.tsx`)
as described in the React Native Development skill.

---

## Environment Configuration

### EXPO_PUBLIC_ Variables

Only variables prefixed with `EXPO_PUBLIC_` are accessible at runtime from
client code via `process.env.EXPO_PUBLIC_*`.

```ts
const apiUrl = process.env.EXPO_PUBLIC_API_URL
```

### Environment Files

Use `.env`, `.env.staging`, `.env.production` at the project root. Reference
them per build profile:

```bash
eas build --profile preview --env-file .env.staging
```

### Secrets

Never put secrets in `EXPO_PUBLIC_*` variables. Use EAS Secrets for build-time
credentials and runtime secret fetching from a secure backend.

```bash
eas secret:create --name APP_STORE_CONNECT_API_KEY --value "xxxxx"
```

### Expo Constants

For runtime config that is not environment-specific, use `expo-constants`:

```ts
import Constants from 'expo-constants'

const extra = Constants.expoConfig?.extra
```

Define `extra` in `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

## Prebuild

### What Prebuild Does

`npx expo prebuild` generates the `ios/` and `android/` native directories
from your `app.json` configuration. These directories are gitignored.

### Prebuild Hooks

Use `expo.prebuild` hooks in `app.json` to run scripts before and after
prebuild:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "15.1"
          },
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34
          }
        }
      ]
    ]
  }
}
```

### Custom Native Code

If you need custom native code beyond Expo Modules, use config plugins:

```ts
// plugins/with-custom-gradle.js
const { withProjectBuildGradle } = require('expo/config-plugins')

module.exports = function withCustomGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents += '\n// Custom Gradle config'
    return config
  })
}
```

### Regenerating Native Directories

After changing `app.json` plugins, regenerate native directories:

```bash
npx expo prebuild --clean
```

The `--clean` flag removes existing `ios/` and `android/` directories before
regenerating. This is required when plugin configuration changes.

---

## expo-updates

### OTA Update Workflow

expo-updates enables over-the-air JavaScript bundle and asset updates
without a full App Store submission.

### Configuration

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/your-project-id",
      "fallbackToCacheTimeout": 0,
      "checkAutomatically": "ON_LOAD",
      "codeSigningCertificate": "./code-signing.crt",
      "codeSigningMetadata": {
        "keyId": "your-key-id",
        "alg": "ES256"
      }
    }
  }
}
```

### Runtime Version

Use a runtime version to ensure OTA updates are compatible with the native
code:

```json
{
  "expo": {
    "updates": {
      "runtimeVersion": "1.0.0"
    }
  }
}
```

Bump the runtime version whenever native code changes. The runtime version
must match between the app binary and the OTA update.

### Publishing Updates

```bash
# Publish to a branch
eas update --branch main --message "Fix notification badge count"

# Publish to a preview channel
eas update --branch preview --message "Test new feature"
```

### Rollbacks

```bash
eas update --branch production --rollback
```

Rollback reverts to the previous embedded bundle. It does not affect
subsequent OTA updates.

### Best Practices

- Always test OTA updates in preview before pushing to production.
- Use `RuntimeVersion.policy` to automate runtime version bumps based on
  your app version.
- OTA updates cannot change native code. If a feature requires new native
  modules, you must ship a new build.
- Monitor update adoption via `eas update:list`.

---

## Common Gotchas

- **Metro cache**: After changing environment variables, clear Metro cache
  with `npx expo start --clear`. Stale cache is the #1 cause of "it works
  on my machine" issues.
- **Pod install**: After adding native modules, run `cd ios && pod install`.
  EAS Build runs this automatically, but local builds do not.
- **Android signing**: Debug builds use the debug keystore. Production builds
  require a separate keystore. Never use the debug keystore in production.
- **Splash screen**: `expo-splash-screen` must be explicitly hidden. The
  splash screen blocks interaction until you call
  `SplashScreen.hideAsync()`.
- **Typed routes**: After adding new routes, run `npx expo customize` to
  regenerate type definitions.
- **Prebuild and git**: Never commit `ios/` or `android/` directories. They
  are generated by prebuild and will cause merge conflicts.
- **EAS Build caching**: Node modules and CocoaPods are cached between builds.
  Use `--clear-cache` flag if dependencies seem stale.

---

## Security Considerations

- **Code signing**: Enable code signing for OTA updates in production to
  prevent tampered bundles from being applied.
- **Runtime version**: Set a strict runtime version policy to prevent
  incompatible OTA updates from reaching old app versions.
- **EAS Secrets**: Store all build credentials (APNs keys, keystore
  passwords, service account keys) as EAS Secrets, never in source code.
- **ProGuard**: Enable ProGuard/R8 minification for Android release builds
  to harden the APK against reverse engineering.
- **SSL pinning**: Consider `expo-ssl-pinning` or a custom module for
  certificate pinning on sensitive API endpoints.
- **Environment variables**: Audit `.env` files before committing. Use
  `.gitignore` to exclude all environment files except `.env.example`.
