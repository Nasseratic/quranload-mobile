# FFmpeg-Kit iOS Migration Guide

This document describes the changes made to support the deprecated `react-native-ffmpeg` with the custom FFmpeg pods for iOS.

## Changes Made

### 1. Package.json Updates

- Added `patch-package` (v8.0.0) to devDependencies
- Added `postinstall` script to automatically apply patches after `npm install`

### 2. Custom Expo Config Plugin

Created `plugins/with-ffmpeg-pod.js` that:

- Automatically modifies the iOS Podfile during `expo prebuild`
- Adds the custom FFmpeg pod dependencies:
  - `shaquillehinds-ffmpeg-kit-ios` (version 6.0.2)
  - `ffmpeg-kit-react-native` (local path reference)

### 3. Patch File

Created `patches/ffmpeg-kit-react-native+6.0.2.patch` that:

- Modifies the podspec to use `shaquillehinds-ffmpeg-kit-ios` instead of official pods
- Changes default subspec from 'min' to 'https'
- Adds `static_framework = true` flag
- Updates all subspecs to use the custom pod dependency

### 4. App Configuration

Updated `app.json` to include the custom plugin:

```json
"plugins": [
  ["@config-plugins/ffmpeg-kit-react-native", {"package": "audio"}],
  "./plugins/with-ffmpeg-pod.js",
  ...
]
```

## Usage Instructions

### For Expo Development

1. Install dependencies:

```bash
npm install
```

2. Run prebuild with clean flag:

```bash
expo prebuild --clean
```

3. Navigate to iOS directory and install pods:

```bash
cd ios
pod install --repo-update
```

4. Build and run:

```bash
npm run ios
```

### For Fresh Setup

If you encounter issues, perform a clean rebuild:

```bash
# Clean everything
rm -rf node_modules
rm -rf ios
rm -rf android
rm package-lock.json

# Reinstall
npm install

# Prebuild
expo prebuild --clean

# Install iOS pods
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..

# Run
npm run ios
```

## What This Fixes

- Resolves iOS build failures with the deprecated `react-native-ffmpeg`
- Uses the maintained fork `shaquillehinds-ffmpeg-kit-ios` (v6.0.2)
- Ensures audio processing features work correctly on iOS
- Automatically applies changes after dependency installation via patch-package

## Files Modified

1. `/package.json` - Added patch-package and postinstall script
2. `/app.json` - Added custom config plugin
3. `/plugins/with-ffmpeg-pod.js` - New: Custom Expo config plugin
4. `/patches/ffmpeg-kit-react-native+6.0.2.patch` - New: Podspec modifications

## Important Notes

- The patch file will be automatically applied after `npm install` runs
- The custom plugin will modify the Podfile during `expo prebuild`
- Always commit the `patches/` directory to version control
- The custom FFmpeg pods are pulled from: https://github.com/shaquillehinds/ffmpeg

## Testing

After setup, test the audio functionality:

1. Open the app on iOS
2. Navigate to recording screens
3. Test audio recording and playback
4. Verify audio concatenation works (uses FFmpegKit)

## Troubleshooting

**Issue:** Pods not installing correctly
**Solution:** Clean pods and reinstall:

```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Issue:** Patch not applying
**Solution:** Manually run patch-package:

```bash
npx patch-package ffmpeg-kit-react-native
```

**Issue:** Config plugin not running
**Solution:** Clear prebuild cache and rebuild:

```bash
expo prebuild --clean
```
