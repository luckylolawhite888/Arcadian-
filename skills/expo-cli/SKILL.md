---
name: expo-cli
description: Expo Application Services (EAS) CLI tool for building and deploying React Native APKs
version: 1.0
author: Lola
created: 2026-05-16
---

# Expo CLI / EAS Build Tool

## What It Is
Expo's cloud build service that compiles React Native apps into APK/IPA files without needing Android Studio/Xcode locally.

## Key Commands

### Build an APK
```bash
cd /root/tnwo-app
export EXPO_TOKEN="<token>"
npx eas-cli@latest build --platform android --profile preview --non-interactive
```

### Check Build Status
```bash
npx eas-cli@latest build:list --platform android --limit 1 --non-interactive
```

### View Build Details
```bash
npx eas-cli@latest build:view <build-id>
```

## Build Profiles (eas.json)
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "preview2": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    }
  }
}
```

## Known Issues
- **Crashes on device:** Builds succeed on Expo but crash on launch. Likely causes:
  - `newArchEnabled: true` (React Native New Architecture incompatibility)
  - Expo Router version conflicts
  - Native module linking issues
- **Fix attempts:** Disabled newArch, stripped Expo Router → minimal app still crashed
- **Status:** Build debugging paused — Maya to try Android Studio build
- **Workaround:** Build manually in Android Studio for debugging
- **Expo account:** tnwo | **Project ID:** 80335766-071c-49bb-852a-6d90219aae9a
- **Access token:** In vault (`expo.access_token`)

## APK Distribution
- Host APK at: `https://thenewworldorder.io/tnwo-app-latest.apk`
- Or use nginx to serve from `/apk/` directory
- Can use Android PackageInstaller API for in-app updates

## Authentication
```bash
npx eas-cli@latest login
# or use EXPO_TOKEN env variable for CI/automation
```

## Requirements
- Expo SDK, React Native, eas-cli installed on build machine
- Source code at `/root/tnwo-app/` on IONOS server
- Android package name: `io.thenewworldorder.app`
