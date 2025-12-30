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
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Clipboard } from "react-native";
import { GiftedChat, Bubble, IMessage, Send, Composer, SendProps } from "react-native-gifted-chat";
import { View, XStack, Card, Circle, Image, ScrollView, Stack, Text, Separator } from "tamagui";
import { useChatMediaUploader } from "hooks/useMediaPicker";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { CrossIcon } from "components/icons/CrossIcon";
import ImageView from "react-native-image-viewing";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import { RecordIcon } from "components/icons/RecordIcon";
import { ChatAudioRecorder } from "screens/chat/components/ChatAudioRecorder";
import { uploadChatMedia } from "utils/uploadChatMedia";
import { AudioPlayer } from "components/AudioPlayer";
import { useMutation, usePaginatedQuery } from "convex/react";
import { cvx, Id } from "api/convex";
import { match, P } from "ts-pattern";
import { t } from "locales/config";
import { isNotNullish } from "utils/notNullish";
import { toast } from "components/Toast";

const QUERY_LIMIT = 20;

export const ChatScreen = () => {
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, "ChatScreen">["route"]>();
  const { teamId, interlocutorId, title, supportChat, supportUserId } = params;
  const user = useUser();
  const unsend = useMutation(cvx.messages.unsend);
  const userId = user.id;

  // Determine if this is a support chat (either from supportChat flag or supportUserId presence)
  const isSupportChat = supportChat || !!supportUserId;
  const actualSupportUserId = supportUserId || userId; // Use provided supportUserId or fallback to current user

  if (!teamId && !interlocutorId && !isSupportChat) {
    throw Error("teamId, interlocutorId, or supportChat must be provided");
  }

  const { results, status, loadMore } = usePaginatedQuery(
    cvx.messages.paginate,
    {
      conversation: match({ isSupportChat, teamId, interlocutorId })
        .with({ isSupportChat: true }, () => ({
          type: "support" as const,
          userId: actualSupportUserId,
        }))
        .with({ teamId: P.not(P.nullish) }, ({ teamId }) => ({
          type: "team" as const,
          teamId: teamId,
        }))
        .otherwise(() => ({
          type: "direct" as const,
          participantX: userId,
          participantY: interlocutorId!,
        })),
    },
    { initialNumItems: QUERY_LIMIT }
  );

  // Add welcome message for support chat when there are no messages
  const allMessages = useMemo(() => {
    const fetchedMessages = results?.map(mapMessageToGiftedChatMessage) ?? [];

    // If it's a support chat and there are no messages, add a welcome message
    if (isSupportChat && fetchedMessages.length === 0 && status !== "LoadingFirstPage") {
      const welcomeMessage: IMessage = {
        _id: "welcome-message",
        text: t("support.welcomeMessage"),
        createdAt: new Date(),
        user: {
          _id: "support",
          name: "Support",
        },
        system: true,
      };
      return [welcomeMessage];
    }

    return fetchedMessages;
  }, [results, isSupportChat, status]);

  const messages = allMessages;

  const sendMessages = useMutation(cvx.messages.send);

  const [imagesModalImages, setImagesModalImages] = useState<string[]>([]);
  const [imagesModalIndex, setImagesModalIndex] = useState(0);
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);

  const { pickImage, images, removeImage, upload, isUploading } = useChatMediaUploader();

  if (!teamId && !interlocutorId && !supportChat) {
    throw Error("teamId, interlocutorId, or supportChat must be provided");
  }

  useEffect(() => {
    // Disable the soft input keyboard handling
    AvoidSoftInput.setEnabled(false);
    return () => {
      // Enable the soft input keyboard handling
      AvoidSoftInput.setEnabled(true);
    };
  }, []);

  const onSend = useCallback(
    async (messages: IMessage[] = []) => {
      if (messages.length === 0) return;

      // For support chats, determine the correct senderId
      const effectiveSenderId = isSupportChat && supportUserId ? "support" : userId;

      await sendMessages({
        senderId: effectiveSenderId,
        to: match({ isSupportChat, teamId, interlocutorId })
          .with({ isSupportChat: true }, () => ({
            type: "support" as const,
            userId: actualSupportUserId,
          }))
          .with({ teamId: P.not(P.nullish) }, ({ teamId }) => ({ type: "team" as const, teamId }))
          .otherwise(({ interlocutorId }) => ({
            type: "direct" as const,
            receiverId: interlocutorId!,
          })),
        messages: messages.map(({ text, audio, image, user }) => ({
          text,
          senderName: user.name,
          receiverName: params.title,
          mediaUrl: image ?? audio,
          mediaType: audio ? "audio" : image ? "image" : undefined,
          isSystem: false,
        })),
      });
    },
    [
      isSupportChat,
      supportUserId,
      teamId,
      interlocutorId,
      userId,
      actualSupportUserId,
      sendMessages,
      params.title,
    ]
  );

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
            if (images.length > 0) {
              const uploadedImages = await upload();
              const validUploadedImages = uploadedImages.filter(isNotNullish);
              if (validUploadedImages.length === 0) {
                // All uploads failed
                toast.show({ status: "Error", title: t("chat.imageUploadFailed") });
                return;
              }

              const lastImage = validUploadedImages[validUploadedImages.length - 1];
              const restImages = validUploadedImages.slice(0, validUploadedImages.length - 1);
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
              onSend?.([], true);
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
      {status === "LoadingFirstPage" ? (
        <Stack f={1} jc="center">
          <ActivityIndicator />
        </Stack>
      ) : (
        <Fragment>
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
              _id: isSupportChat && supportUserId ? "support" : user.id,
              name: isSupportChat && supportUserId ? "Support" : user.fullName,
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
            renderAvatar={match({ interlocutorId, isSupportChat })
              .with({ interlocutorId: P.not(P.nullish) }, () => () => null)
              .with({ isSupportChat: true }, () => () => null)
              .otherwise(() => undefined)} // Show avatar in team chats only
            onPressAvatar={(user) => {}} // UX TODO: Implement a chat with someone feature; can be view profile too
            renderSystemMessage={(message) => (
              <Card bg="$white0" p={12} my={16} mx={8} borderRadius={8}>
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
            onLongPress={(context, message) => {
              const options = [
                ...match(message.user._id === userId)
                  .with(true, () => [t("unsend")])
                  .otherwise(() => []),
                t("copy"),
                t("cancel"),
              ];

              const cancelButtonIndex = options.length - 1;
              (context as any).actionSheet().showActionSheetWithOptions(
                {
                  options,
                  cancelButtonIndex,
                },
                (buttonIndex: number) => {
                  match(buttonIndex)
                    .with(0, async () => unsend({ messageId: message._id as Id<"messages"> }))
                    .with(1, () => Clipboard.setString(message.text))
                    .otherwise(() => {});
                }
              );
            }}
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
            loadEarlier={status === "CanLoadMore"}
            onLoadEarlier={() => loadMore(QUERY_LIMIT)}
            isLoadingEarlier={status === "LoadingMore"}
            // UX TODO?: Jump to most recent message component
          />
        </Fragment>
      )}
    </SafeView>
  );
};

const mapMessageToGiftedChatMessage = (
  message: (typeof cvx.messages.paginate)["_returnType"]["page"][number]
) =>
  ({
    _id: message._id,
    text: message.text ?? "",
    createdAt: new Date(message._creationTime),
    user: {
      _id: message.senderId,
      name: message.senderName,
    },
    ...(message.mediaType && {
      [message.mediaType]: message.mediaUrl,
    }),
    system: message.isSystem,
  } satisfies IMessage);
