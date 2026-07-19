# EAS Builds

## Overview

Expo Application Services (EAS) build configuration for React Native apps, including build profiles, triggers, custom scripts, and submission.

> **This codebase:** the real config is `app/eas.json` — profiles `base`
> (Node 24.18.0), `development` (dev client, internal, iOS simulator),
> `preview` (internal, production channel), `production` (auto-increment;
> `appVersionSource: "remote"`). Expo Go is not a shipping path (custom
> native modules in `app/modules/`). Android is the launch mobile target;
> iOS later. Examples below are generic — defer to `app/eas.json`.

## Build Profiles

### Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "development",
        "API_URL": "http://localhost:3000"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "staging",
        "API_URL": "https://staging-api.example.com"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production",
        "API_URL": "https://api.example.com"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Profile Selection

| Profile       | Distribution | Use Case                          | Speed    |
|---------------|-------------|-----------------------------------|----------|
| development   | internal    | Local dev with dev client         | Fast     |
| preview       | internal    | Team testing, QA                  | Medium   |
| production    | store       | App Store / Play Store release    | Slow     |

## Build Triggers

### CLI Commands

```bash
# Build for specific profile
eas build --profile preview --platform ios
eas build --profile production --platform android
eas build --profile preview --platform all

# Local build (no cloud)
eas build --profile development --platform ios --local

# Build without git commit
eas build --profile production --platform all --non-interactive
```

### GitHub Actions Integration

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Build iOS
        run: eas build --platform ios --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android
        run: eas build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### Build Hooks

```json
// eas.json with hooks
{
  "build": {
    "production": {
      "hooks": {
        "prebuild": ["./scripts/pre-build.sh"],
        "postbuild": ["./scripts/post-build.sh"]
      }
    }
  }
}
```

## Custom Build Scripts

### Pre-Build Script

```bash
#!/bin/bash
# scripts/pre-build.sh

set -e

echo "Running pre-build tasks..."

# Generate app icons if needed
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  npx react-native generate-ios-icons
fi

# Run code generation
npx codegen

# Validate environment variables
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL not set"
  exit 1
fi

# Update build number
if [ "$EAS_BUILD_PROFILE" = "production" ]; then
  ./scripts/increment-build-number.sh
fi
```

### Post-Build Script

```bash
#!/bin/bash
# scripts/post-build.sh

set -e

echo "Running post-build tasks..."

# Upload source maps to Sentry
if [ "$EAS_BUILD_PLATFORM" = "ios" ]; then
  npx sentry-cli upload-sourcemaps \
    --org my-org \
    --project my-project \
    --release "$APP_VERSION" \
    ./ios/build/*.jsbundle
fi

# Notify team
curl -X POST "$SLACK_WEBHOOK" \
  -H 'Content-type: application/json' \
  -d "{\"text\": \"Build $EAS_BUILD_ID completed for $EAS_BUILD_PLATFORM\"}"
```

## Environment Variables

### Build-Time Variables

```yaml
# eas.json
{
  "build": {
    "production": {
      "env": {
        "APP_ENV": "production",
        "API_URL": "https://api.example.com",
        "SENTRY_DSN": "https://key@sentry.io/project"
      }
    }
  }
}
```

### EAS Secrets (Stored Encrypted)

```bash
# Set secrets via CLI
eas secret:create --scope project --name API_KEY --value "secret123"
eas secret:create --scope project --name IOS_SIGNING_CERT --value "$(base64 cert.p12)"

# List secrets
eas secret:list
```

### Runtime vs Build-Time

| Variable Type   | Set Where         | Available When    | Security        |
|-----------------|-------------------|-------------------|-----------------|
| Build-time      | eas.json env      | During build      | In binary       |
| EAS Secret      | eas secret:create | During build      | Not in binary   |
| App config      | app.json          | Runtime           | Client-exposed  |
| Server config   | Server-side       | Runtime           | Never in client |

## iOS-Specific Configuration

### Build Settings

```json
// app.json (iOS section)
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.example.app",
      "buildNumber": "1.0.0",
      "deploymentTarget": "15.0",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera for profile photos",
        "NSFaceIDUsageDescription": "Authenticate with Face ID",
        "ITSAppUsesNonExemptEncryption": false
      },
      "config": {
        "usesNonExemptEncryption": false
      },
      "appleTeamId": "ABCDE12345"
    }
  }
}
```

### provisioningProfile

```json
{
  "build": {
    "production": {
      "ios": {
        "provisioningProfile": "path/to/profile.mobileprovision",
        "distributionCertificate": {
          "path": "path/to/cert.p12",
          "password": "cert-password"
        }
      }
    }
  }
}
```

## Android-Specific Configuration

### Build Settings

```json
// app.json (Android section)
{
  "expo": {
    "android": {
      "package": "com.example.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Signing

```json
{
  "build": {
    "production": {
      "android": {
        "keystore": {
          "keystorePath": "keystore.jks",
          "keystorePassword": "android",
          "keyAlias": "key0",
          "keyPassword": "android"
        }
      }
    }
  }
}
```

## Submission

### Auto-Submit After Build

```bash
# Build and submit in one step
eas build --profile production --platform ios --auto-submit

# Submit existing build
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### TestFlight (iOS)

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345",
        "ascApiKey": "path/to/AuthKey_XXXXXXXX.p8",
        "ascApiKeyId": "XXXXXXXXXX"
      }
    }
  }
}
```

### Google Play

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal",  // or "alpha", "beta", "production"
        "releaseStatus": "draft",
        "changesNotSentForReview": false
      }
    }
  }
}
```

## Build Optimization

### Caching

```json
{
  "build": {
    "development": {
      "cache": {
        "key": "npm-v1",
        "paths": ["node_modules", ".expo"]
      }
    }
  }
}
```

### Build Speed

| Optimization              | Impact                          |
|---------------------------|---------------------------------|
| Use cache                 | 30-50% faster rebuilds          |
| Skip native init          | Use `--skip-native-dependencies`|
| Prebuild once             | Cache `ios/` and `android/`     |
| Minimize dependencies     | Fewer pods/gradle tasks         |
| Use M1 runner (iOS)       | 2x faster native builds         |

## Monitoring Builds

```bash
# Check build status
eas build:list

# View specific build
eas build:view <build-id>

# View build logs
eas build:view <build-id> --logs
```

## Common Issues

| Issue                          | Solution                                 |
|--------------------------------|------------------------------------------|
| iOS build fails with cert      | Check cert hasn't expired, re-upload     |
| Android keystore error         | Verify keystore path and passwords       |
| Environment variable missing   | Check eas.json + EAS secrets             |
| Build times out                | Reduce dependencies, check network       |
| Provisioning profile mismatch  | Re-generate with correct bundle ID       |
| SDK version too old            | Update expo SDK in package.json          |
