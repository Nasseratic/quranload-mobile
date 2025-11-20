import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";

// TODO: upload images to different folders based on teamId and userId
export const uploadChatMedia = async (uri: string,type:'image'|'audio') => {
  try {
    // const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    // const filePath = `${new Date().getTime()}.${type === 'image' ? 'png' : 'mp3'}`;
    // const contentType = type === 'image' ? 'image/png' : 'audio/mpeg';
    // const { data, error } = await supabase.storage
    //   .from("chat-media-1")
    //   .upload(filePath, decode(base64), { contentType });
    // if (error)
    //   throw error;
    // return `https://onvbwwnhwmeckrxkjllj.supabase.co/storage/v1/object/public/chat-media-1/${data?.path}`;
  } catch (e) {
    console.log(e);
  }
};
