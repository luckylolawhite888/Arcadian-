---
name: tnwo-app
description: "The New World Order Android app — Expo/React Native project for io.thenewworldorder.app"
version: 2.0
author: Lola
created: 2026-05-16
---

# TNWO Android App

## Project Overview
- **Purpose:** Native Android app for The New World Order brand
- **Package:** `io.thenewworldorder.app`
- **Framework:** Expo SDK 54, React Native 0.81
- **Expo Project ID:** 80335766-071c-49bb-852a-6d90219aae9a
- **Build server:** IONOS Ubuntu (`/root/tnwo-app/`)
- **Expo account:** tnwo

## Build Pipeline
1. SSH into IONOS server
2. `cd /root/tnwo-app`
3. Set `EXPO_TOKEN` from vault
4. Run `npx eas-cli@latest build --platform android --profile preview2 --non-interactive`
5. Wait ~10-15 min for cloud build
6. Download APK from Expo dashboard or build link

## Build History
| Build | ID | Approach | Result |
|-------|-----|----------|--------|
| 1 | f6a116dd | WebView → native, newArch:true | Crashed on device |
| 2 | 2adbd023 | disabled newArchEnabled | Still crashed |
| 3 | fa8f9591 | Stripped Expo Router, minimal | Still crashed |

## Known Crash Issues
- **Root cause:** Still undiagnosed — builds succeed on Expo cloud but crash immediately on phone
- **Suspects:** Expo Router version conflicts, New Architecture, native module linking
- **Workaround:** Maya building manually in Android Studio
- **Current status:** Stalled — needs dedicated debugging session

## Download Distribution
- **URL:** `https://thenewworldorder.io/tnwo-app-latest.apk`
- **Config:** nginx serves from `/var/www/apk/` directory
- **In-app updates:** Can use Android PackageInstaller API

## What Was Sent to Maya
- Full app briefing email sent to luckylolawhite@gmail.com
- APK download link included
- Summary of build attempts and known issues

## Config Files
- `app.json` — Expo configuration (app name, slug, version, splash screen)
- `eas.json` — Build profiles (preview, preview2)
- Source code under `/root/tnwo-app/` directory
