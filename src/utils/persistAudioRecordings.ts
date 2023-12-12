import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPersistentAudioRecordings = async ({ lessonId }: { lessonId: string }) => {
  const audioRecordings = await AsyncStorage.getItem(getStorageKey(lessonId));
  try {
    if (audioRecordings) {
      return JSON.parse(audioRecordings) as {
        uri: string;
        duration: number;
      }[];
    }
    return [];
  } catch (e) {
    //Implement error handling
    return [];
  }
};

export const persistAudioRecordings = async ({
  lessonId,
  recordings,
}: {
  lessonId: string;
  recordings: { uri: string; duration: number }[];
}) => {
  try {
    await AsyncStorage.setItem(getStorageKey(lessonId), JSON.stringify(recordings));
  } catch (e) {
    //Implement error handling
  }
};

export const clearAudioRecordings = async ({ lessonId }: { lessonId: string }) => {
  try {
    await AsyncStorage.removeItem(getStorageKey(lessonId));
  } catch (e) {
    //Implement error handling
  }
};

const getStorageKey = (lessonId: string) => `audioRecordings-${lessonId}`;
