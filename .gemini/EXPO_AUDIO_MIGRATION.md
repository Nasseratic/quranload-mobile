# Migration from expo-av to expo-audio

This document summarizes the migration of the `Recorder.tsx` component from `expo-av` to `expo-audio`.

## Key Changes

### 1. **Imports**
- **Before**: `import { Audio } from "expo-av"`
- **After**: Individual imports from `expo-audio`:
  ```typescript
  import {
    AudioRecorder,
    setAudioModeAsync,
    requestRecordingPermissionsAsync,
    getRecordingPermissionsAsync,
    RecordingPresets,
    RecordingOptions,
    AndroidAudioEncoder,
    AndroidOutputFormat,
    IOSOutputFormat,
    AudioQuality,
    PermissionStatus,
  } from "expo-audio";
  ```

### 2. **Permission Handling**
- **Before**: Used `Audio.usePermissions()` hook
  ```typescript
  const [permissionStatus, requestPermission] = Audio.usePermissions({ request: false });
  ```
- **After**: Manual permission management with ref and async functions
  ```typescript
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  // Initialize on mount
  useEffect(() => {
    getRecordingPermissionsAsync().then(({ status }) => {
      permissionStatusRef.current = status;
    });
  }, []);
  // Request when needed
  const { status, granted } = await requestRecordingPermissionsAsync();
  ```

### 3. **Recording Creation**
- **Before**: `Audio.Recording.createAsync()` with callback
  ```typescript
  const { recording } = await Audio.Recording.createAsync(
    options,
    (status) => { /* callback */ },
    100
  );
  ```
- **After**: `new AudioRecorder()` with `prepareToRecordAsync()` and `record()`
  ```typescript
  const recorder = new AudioRecorder(recordingOptions);
  await recorder.prepareToRecordAsync();
  recorder.record();
  ```

### 4. **Recording Status Updates**
- **Before**: Callback parameter in `createAsync()`
- **After**: Event listeners and polling
  ```typescript
  const statusUpdateListener = recorder.addListener("recordingStatusUpdate", (status) => {
    if (status.hasError) {
      console.error("Recording error:", status.error);
    }
  });
  
  const durationInterval = setInterval(() => {
    if (currentRecording) {
      const status = currentRecording.getStatus();
      currentRecordingDurationMillis = status.durationMillis;
    }
  }, 100);
  ```

### 5. **Getting Recording Status**
- **Before**: `await recording.getStatusAsync()` (async)
- **After**: `recording.getStatus()` (synchronous)

### 6. **Getting Recording URI**
- **Before**: `recording.getURI()`
- **After**: `recording.uri` (property access)

### 7. **Stopping Recording**
- **Before**: `recording.stopAndUnloadAsync()`
- **After**: `recording.stop()`

### 8. **Audio Mode Configuration**
- **Before**: `Audio.setAudioModeAsync({ allowsRecordingIOS: true })`
- **After**: `setAudioModeAsync({ allowsRecording: true })`
  - Property renamed from `allowsRecordingIOS` to `allowsRecording`

### 9. **Recording Options Structure**
- **Before**: Platform-specific options with `IOSAudioQuality`
  ```typescript
  ios: {
    audioQuality: IOSAudioQuality.MAX,
    // ...
  }
  ```
- **After**: Platform-specific options with `AudioQuality`
  ```typescript
  ios: {
    audioQuality: AudioQuality.MAX,
    // ...
  }
  ```
- Android encoder changed from `AMR_WB` to `AAC` for better quality

### 10. **Cleanup**
- **Before**: No explicit listener cleanup needed
- **After**: Must clean up event listeners
  ```typescript
  statusUpdateListener.remove();
  clearInterval(durationInterval);
  ```

## Breaking Changes to Note

1. **Status updates are no longer automatic** - You need to either:
   - Add event listeners for `recordingStatusUpdate`
   - Poll `getStatus()` manually (synchronous)
   
2. **Recording options format** changed slightly:
   - Top-level properties required: `extension`, `sampleRate`, `numberOfChannels`, `bitRate`
   - Platform-specific options go in `ios` and `android` objects

3. **Permission API** is now functional instead of hook-based

## Benefits of expo-audio

1. **Simpler API**: More consistent and predictable
2. **Better TypeScript support**: Improved type definitions
3. **Synchronous status access**: `getStatus()` is now synchronous
4. **Cleaner lifecycle**: Explicit `prepareToRecordAsync()` and `record()` steps
5. **Modern architecture**: Uses event-based patterns consistent with other Expo libraries

## Testing Checklist

- [ ] Test recording permission request flow
- [ ] Test recording start/pause/resume functionality
- [ ] Test recording fragmentation (2-minute chunks)
- [ ] Test recording duration tracking
- [ ] Test metering/audio level detection
- [ ] Test background pause behavior
- [ ] Test recording persistence on app restart
- [ ] Test recording submission
- [ ] Test recording discard flow
- [ ] Test iOS-specific behavior
- [ ] Test Android-specific behavior
