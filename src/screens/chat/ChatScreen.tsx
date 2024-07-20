import { useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { AppBar } from "components/AppBar";
import { SafeView } from "components/SafeView";
import { IconButton } from "components/buttons/IconButton";
import { PaperClipIcon } from "components/icons/PaperClipIcon";
import { SendIcon } from "components/icons/SendIcon";
import { Colors } from "constants/Colors";
import { useUser } from "contexts/auth";
import { RootStackParamList } from "navigation/navigation";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import {
  GiftedChat,
  Bubble,
  IMessage,
  Send,
  Composer,
  SendProps,
  MessageImage,
} from "react-native-gifted-chat";
import { View, XStack, Card, Circle, Image, ScrollView, Stack, Text, Separator } from "tamagui";
import { supabase } from "utils/supabase";
import { useSupabaseMediaUploader } from "hooks/useMediaPicker";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { CrossIcon } from "components/icons/CrossIcon";
import ImageView from "react-native-image-viewing";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import { RecordIcon } from "components/icons/RecordIcon";
import { ChatAudioRecorder } from "screens/chat/components/ChatAudioRecorder";
import { uploadChatMedia } from "utils/uploadChatMedia";
import { AudioPlayer } from "components/AudioPlayer";
import { Database } from "types/Supabase";

export const ChatScreen = () => {
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, "ChatScreen">["route"]>();
  const { teamId, interlocutorId, title } = params;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [isMore, setIsMore] = useState(true);
  const [imagesModalImages, setImagesModalImages] = useState<string[]>([]);
  const [imagesModalIndex, setImagesModalIndex] = useState(0);
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);

  const { pickImage, images, removeImage, upload, isUploading } = useSupabaseMediaUploader();

  const user = useUser();
  const queryClient = useQueryClient();

  const QUERY_LIMIT = 2;

  if (!teamId) {
    throw Error("teamId is required");
  }

  const loadMessages = ({ isInitial }: { isInitial: boolean }) => {
    if (!isInitial) setIsLoadingEarlier(true);

    const query = supabase
      .from("messages")
      .select()
      .range(messages.length, messages.length + QUERY_LIMIT - 1) // Subtracting 1 because the to value is inclusive
      .order("createdAt", { ascending: false });

    // The interlocutorId if-condition needs to come first because the teamId is passed in all chat types
    if (interlocutorId) {
      // Fetch messages between logged in user and interlocutor
      query.in("senderId", [interlocutorId, user?.id]).in("receiverId", [interlocutorId, user?.id]);
    } else if (teamId) {
      // Fetch team messages (shouldn't have a receiverId)
      query.eq("teamId", teamId).is("receiverId", null);
    }

    query.then(({ data }) => {
      if (data) {
        setMessages((oldMessages) => [
          ...oldMessages,
          ...data.map((message) => ({
            _id: message.id,
            text: message.text ?? "",
            createdAt: new Date(message.createdAt),
            user: {
              _id: message.senderId,
              name: message.senderName ?? "-",
            },
            ...(message.mediaType && {
              [message.mediaType]: message.mediaUrl,
            }),
            system: message.isSystem,
          })),
        ]);

        // Hide load earlier button
        if (data.length < QUERY_LIMIT) setIsMore(false);
      } else {
        // if no data, hide the load earlier messages button
        setIsMore(false);
      }

      // Hide loading indicators
      if (isInitial) setIsLoadingInitial(false);
      else setIsLoadingEarlier(false);
    });
  };

  useEffect(() => {
    loadMessages({ isInitial: true });

    // Disable the soft input keyboard handling
    AvoidSoftInput.setEnabled(false);

    // Current user subscribes to inserts (either user is receiver
    // or sender in private chat or part of team where receiver id is null)
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `teamId=eq.${teamId}`,
        },
        (payload) => {
          if (payload.eventType !== "INSERT") {
            return;
          }
          const message = payload.new;

          const isPrivateMessageToUser =
            interlocutorId &&
            (message.senderId == user.id || message.receiverId == user.id) &&
            (message.senderId == interlocutorId || message.receiverId == interlocutorId);
          const isTeamMessageToUser =
            !interlocutorId && message.teamId == teamId && message.receiverId == null;

          if (!isPrivateMessageToUser && !isTeamMessageToUser) {
            return;
          }
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [
              {
                _id: message.id,
                text: message.text,
                createdAt: new Date(message.createdAt),
                user: {
                  _id: message.senderId,
                  name: message.senderName,
                },
                ...(message.mediaType && {
                  [message.mediaType]: message.mediaUrl,
                }),
                system: message.isSystem,
              },
            ])
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();

      // Enable the soft input keyboard handling
      AvoidSoftInput.setEnabled(true);
    };
  }, []);

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    const { error } = await supabase
      .from("messages")
      .insert(
        messages.map(
          ({ text, audio, image, user }) =>
            ({
              text,
              senderId: user._id as string,
              senderName: user.name,
              receiverId: interlocutorId ? interlocutorId : null,
              receiverName: params.title,
              teamId,
              mediaUrl: image ?? audio,
              mediaType: audio ? "audio" : image ? "image" : null,
            } satisfies Database["public"]["Tables"]["messages"]["Insert"])
        )
      )
      .select();

    if (interlocutorId) queryClient.invalidateQueries(["latest-private-messages", teamId]);
    else queryClient.invalidateQueries(["latest-team-message", teamId]);
  }, []);

  const renderSend = ({ onSend, text, sendButtonProps, ...props }: SendProps<IMessage>) => {
    const isTextOrImages = text || images.length > 0;
    return (
      <Send
        {...props}
        sendButtonProps={{
          ...sendButtonProps,
          disabled: isUploading,
          onPress: async () => {
            if (!isTextOrImages) {
              return setIsRecorderVisible(true);
            }
            if (images) {
              const uploadedImages = await upload();
              const lastImage = uploadedImages[uploadedImages.length - 1];
              const restImages = uploadedImages.slice(0, uploadedImages.length - 1);
              onSend?.(
                [
                  ...restImages.map((image) => ({ image })),
                  {
                    text: text?.trim(),
                    image: lastImage,
                  },
                ],
                true
              );
            } else {
              onSend?.({ text: text?.trim() }, true);
            }
          },
        }}
      >
        <Stack pr="$3" h={32} jc="center">
          {isUploading ? (
            <ActivityIndicator size="small" color="black" />
          ) : isTextOrImages ? (
            <SendIcon size={30} />
          ) : (
            <RecordIcon color="#000" size={28} />
          )}
        </Stack>
      </Send>
    );
  };

  const renderActions = () => {
    return (
      <Stack pl="$3">
        <IconButton onPress={pickImage} icon={<PaperClipIcon size={28} />} size="xs" />
      </Stack>
    );
  };

  // Style the text input to be inline with the attachment and send icons
  const renderComposer = (props: {}) => (
    <Composer
      textInputStyle={{
        paddingTop: 15,
      }}
      {...props}
    />
  );

  const renderMessageAudio = (props: { currentMessage: IMessage }) => {
    if (!props.currentMessage.audio) return null;
    return <AudioPlayer uri={props.currentMessage.audio} isVisible={true} isCompact width={250} />;
  };

  // Render attached images
  const renderChatFooter = () => (
    <View gap="$2" marginBottom={5}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingLeft: 10,
        }}
        w={SCREEN_WIDTH}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <XStack gap="$2">
          {images?.map((image, index) => (
            <Stack
              ov="visible"
              key={index}
              borderRadius="$2"
              borderStyle="solid"
              borderColor="$gray6Light"
              bw={1}
              h={60}
              w={60}
              onPress={() => {
                setImagesModalIndex(index);
                setImagesModalImages(images);
              }}
              pressStyle={{ opacity: 0.5 }}
            >
              <Image key={image} height={60} width={60} borderRadius="$2" source={{ uri: image }} />
              <Circle
                position="absolute"
                right={-5}
                top={-5}
                bg="black"
                p={4}
                zIndex={1}
                pressStyle={{
                  opacity: 0.5,
                }}
                onPress={() => removeImage(image)}
              >
                <CrossIcon width={16} height={16} />
              </Circle>
            </Stack>
          ))}
        </XStack>
      </ScrollView>
    </View>
  );

  return (
    // UX TODO: Identify which messages are from the teacher (can be done using the avatar or the message sender name)
    // UX TODO: This might need to be done in the ChatListScreen as well?
    <SafeView f={1}>
      <ChatAudioRecorder
        isOpen={isRecorderVisible}
        onClose={() => setIsRecorderVisible(false)}
        onSend={async ({ uri }) => {
          const uploadedUri = await uploadChatMedia(uri, "audio");
          if (uploadedUri) {
            await onSend([
              {
                _id: uploadedUri,
                user: {
                  _id: user.id,
                  name: user.fullName,
                },
                createdAt: new Date(),
                text: "",
                audio: uploadedUri,
              },
            ]);
          }
          setIsRecorderVisible(false);
        }}
      />
      <AppBar title={title} />
      <Separator />
      {isLoadingInitial ? (
        <Stack f={1} jc="center">
          <ActivityIndicator />
        </Stack>
      ) : (
        <>
          <ImageView
            // Change the images type from string[] to ImageSource[]
            images={images.map((image) => ({
              uri: image,
            }))}
            imageIndex={imagesModalIndex}
            visible={imagesModalImages.length > 0}
            onRequestClose={() => setImagesModalImages([])}
          />

          <GiftedChat
            keyboardShouldPersistTaps="never" // For Android
            messages={messages}
            user={{
              _id: user.id,
              name: user.fullName,
            }}
            onSend={onSend}
            renderSend={renderSend}
            // Show send icon when there are images attached
            alwaysShowSend
            renderActions={renderActions}
            renderComposer={renderComposer}
            renderChatFooter={renderChatFooter}
            renderMessageAudio={renderMessageAudio}
            renderUsernameOnMessage={!interlocutorId} // Show sender name only in team chats
            renderAvatarOnTop // Render avatars at the top of consecutive messages, rather than the bottom
            showAvatarForEveryMessage={false} // One avatar for consecutive messages from the same user on the same day
            renderAvatar={interlocutorId ? () => null : undefined} // Show avatar in team chats only
            onPressAvatar={(user) => {}} // UX TODO: Implement a chat with someone feature; can be view profile too
            renderSystemMessage={(message) => (
              <Card bg="$background" p={12} my={16} mx={8} borderRadius={8}>
                <Text color="$gray11" textAlign="center">
                  {message.currentMessage?.text}
                </Text>
              </Card>
            )}
            renderMessageImage={(props) => (
              <Image
                height={200}
                width={200}
                m={4}
                borderCurve="continuous"
                borderRadius="$4"
                pressStyle={{ opacity: 0.7 }}
                onPress={() => {
                  setImagesModalIndex(0);
                  setImagesModalImages([props.currentMessage?.image ?? ""]);
                }}
                source={{ uri: props.currentMessage?.image }}
              />
            )}
            renderBubble={(props) => (
              <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    backgroundColor: Colors.Success[1],
                  },
                }}
              />
            )}
            loadEarlier={isMore}
            onLoadEarlier={() => loadMessages({ isInitial: false })}
            isLoadingEarlier={isLoadingEarlier}
            // UX TODO?: Jump to most recent message component
          />
        </>
      )}
    </SafeView>
  );
};
