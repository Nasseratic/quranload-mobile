import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppBar } from "components/AppBar";
import { SafeView } from "components/SafeView";
import { IconButton } from "components/buttons/IconButton";
import { PaperClipIcon } from "components/icons/PaperClipIcon";
import { SendIcon } from "components/icons/SendIcon";
import { Colors } from "constants/Colors";
import { useMaybeUser } from "contexts/auth";
import { RootStackParamList } from "navigation/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Clipboard, TouchableOpacity, ActionSheetIOS, Platform } from "react-native";
import { GiftedChat, Bubble, IMessage, Send, Composer, SendProps, InputToolbar, InputToolbarProps } from "react-native-gifted-chat";
import { View, XStack, Card, Circle, Image, ScrollView, Stack, Text, Separator } from "tamagui";
import { useChatMediaUploader, MediaItem } from "hooks/useMediaPicker";
import { SCREEN_WIDTH } from "constants/GeneralConstants";
import { CrossIcon } from "components/icons/CrossIcon";
import { ImageViewer, ImageViewerRef, ImageWrapper } from "react-native-reanimated-viewer";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import { RecordIcon } from "components/icons/RecordIcon";
import { ChatAudioRecorder } from "screens/chat/components/ChatAudioRecorder";
import { uploadChatMedia } from "utils/uploadChatMedia";
import { AudioPlayer } from "components/AudioPlayer";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { cvx, Id } from "api/convex";
import { match, P } from "ts-pattern";
import { t } from "locales/config";
import { isNotNullish } from "utils/notNullish";
import { toast } from "components/Toast";
import { OptionsIcon } from "components/icons/OptionsIcon";
import { MediaImage } from "components/Image";
import { VideoPlayer } from "components/VideoPlayer";

// Extended message type that includes media key for lazy URL resolution
type ChatMessage = IMessage & {
  mediaKey?: string;
  mediaType?: "image" | "audio" | "video" | "file";
};

const QUERY_LIMIT = 20;

export const ChatScreen = () => {
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, "ChatScreen">["route"]>();
  const { teamId, interlocutorId, title, supportChat, supportUserId } = params;
  const user = useMaybeUser();
  const navigation = useNavigation();
  const unsend = useMutation(cvx.messages.unsend);
  const archiveSupportConversation = useMutation(cvx.messages.archiveSupportConversation);
  const unarchiveSupportConversation = useMutation(cvx.messages.unarchiveSupportConversation);
  const userId = user?.id;

  // Determine if this is a support chat (either from supportChat flag or supportUserId presence)
  const isSupportChat = supportChat || !!supportUserId;
  const actualSupportUserId = supportUserId || userId; // Use provided supportUserId or fallback to current user

  if (!teamId && !interlocutorId && !isSupportChat) {
    throw Error("teamId, interlocutorId, or supportChat must be provided");
  }

  const conversationId = isSupportChat ? `support_${actualSupportUserId}` : null;

  // Get archived status for support chats
  const conversationStatus = useQuery(
    cvx.messages.getSupportConversationStatus,
    conversationId ? { conversationId } : "skip"
  );
  const isArchived = conversationStatus?.archived ?? false;

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

  const messageCacheRef = useRef<Map<string, ChatMessage>>(new Map());

  // Map results to chat messages with media keys
  const mappedMessages = useMemo<ChatMessage[]>(() => {
    if (!results) return [];
    const nextCache = new Map<string, ChatMessage>();
    const mapped = results.map((message) => {
      const cached = messageCacheRef.current.get(message._id);
      const isSame =
        cached &&
        cached.text === (message.text ?? "") &&
        cached.user._id === message.senderId &&
        cached.user.name === message.senderName &&
        cached.system === message.isSystem &&
        cached.mediaKey === (message.mediaKey ?? undefined) &&
        cached.mediaType === (message.mediaType ?? undefined) &&
        cached.createdAt.getTime() === message._creationTime;

      if (isSame) {
        nextCache.set(message._id, cached);
        return cached;
      }

      const mappedMessage = mapMessageToGiftedChatMessage(message);
      nextCache.set(message._id, mappedMessage);
      return mappedMessage;
    });
    messageCacheRef.current = nextCache;
    return mapped;
  }, [results]);

  // Add welcome message for support chat when there are no messages
  const messages = useMemo<ChatMessage[]>(() => {
    // If it's a support chat and there are no messages, add a welcome message
    if (isSupportChat && mappedMessages.length === 0 && status !== "LoadingFirstPage") {
      const welcomeMessage: ChatMessage = {
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

    return mappedMessages;
  }, [mappedMessages, isSupportChat, status]);

  const sendMessages = useMutation(cvx.messages.send);

  const imageViewerRef = useRef<ImageViewerRef>(null);
  const [isRecorderVisible, setIsRecorderVisible] = useState(false);

  // Allow videos only in support chat
  const { pickMedia, mediaItems, removeMedia, upload, isUploading } = useChatMediaUploader({
    allowVideos: isSupportChat,
  });

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
        messages: messages.map(({ text, audio, image, video, user }: IMessage & { video?: string }) => ({
          text,
          senderName: user.name,
          receiverName: params.title,
          // Store the R2 key - URLs are resolved when fetching messages
          mediaKey: video ?? image ?? audio,
          mediaType: video ? "video" : audio ? "audio" : image ? "image" : undefined,
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

  const renderSend = useCallback(
    ({ onSend, text, sendButtonProps, ...props }: SendProps<IMessage>) => {
      const isTextOrMedia = text || mediaItems.length > 0;
      return (
        <Send
          {...props}
          sendButtonProps={{
            ...sendButtonProps,
            disabled: isUploading,
            onPress: async () => {
              if (!isTextOrMedia) {
                return setIsRecorderVisible(true);
              }
              if (mediaItems.length > 0) {
                const uploadedMedia = await upload();
                const validUploadedMedia = uploadedMedia.filter(isNotNullish);
                if (validUploadedMedia.length === 0) {
                  // All uploads failed
                  toast.show({ status: "Error", title: t("chat.mediaUploadFailed") });
                  return;
                }

                // Build messages for each media item
                const mediaMessages = validUploadedMedia.map((media, index) => {
                  const isLast = index === validUploadedMedia.length - 1;
                  return {
                    // For images, use 'image' field; for videos, use 'video' field
                    ...(media.type === "image" ? { image: media.key } : { video: media.key }),
                    // Include text only with the last media item
                    text: isLast ? text?.trim() : undefined,
                  };
                });

                onSend?.(mediaMessages, true);
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
            ) : isTextOrMedia ? (
              <SendIcon size={30} />
            ) : (
              <RecordIcon color="#000" size={28} />
            )}
          </Stack>
        </Send>
      );
    },
    [isUploading, mediaItems, upload, t, toast]
  );

  const renderActions = useCallback(() => {
    return (
      <Stack pl="$3">
        <IconButton onPress={pickMedia} icon={<PaperClipIcon size={28} />} size="xs" />
      </Stack>
    );
  }, [pickMedia]);

  // Style the text input to be inline with the attachment and send icons
  const composerTextInputStyle = useMemo(() => ({ paddingTop: 15 }), []);
  const renderComposer = useCallback(
    (props: {}) => <Composer textInputStyle={composerTextInputStyle} {...props} />,
    [composerTextInputStyle]
  );

  const renderMessageAudio = useCallback((props: { currentMessage: IMessage }) => {
    if (!props.currentMessage.audio) return null;
    // audio field contains mediaKey from R2 storage, not a direct URL
    return <AudioPlayer mediaKey={props.currentMessage.audio} isVisible={true} isCompact width={250} />;
  }, []);

  const renderMessageVideo = useCallback((props: { currentMessage: IMessage }) => {
    const message = props.currentMessage as ChatMessage;
    if (!message.video || message.mediaType !== "video") return null;
    // video field contains mediaKey from R2 storage
    return (
      <Stack m={4}>
        <VideoPlayer mediaKey={message.video} width={200} height={200} borderRadius={16} />
      </Stack>
    );
  }, []);

  // Render attached media (images and videos)
  const chatFooterContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingLeft: 10,
    }),
    []
  );
  const renderChatFooter = useCallback(
    () => (
      <View gap="$2" marginBottom={5}>
        <ScrollView
          contentContainerStyle={chatFooterContentContainerStyle}
          w={SCREEN_WIDTH}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <XStack gap="$2">
            {mediaItems?.map((item, index) => (
              <Stack ov="visible" key={index}>
                {item.type === "image" ? (
                  <ImageWrapper
                    viewerRef={imageViewerRef}
                    index={index}
                    source={{ uri: item.uri }}
                    style={{
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#e5e5e5",
                      height: 60,
                      width: 60,
                    }}
                  >
                    <Image height={60} width={60} borderRadius="$2" source={{ uri: item.uri }} />
                  </ImageWrapper>
                ) : (
                  <VideoPlayer uri={item.uri} width={60} height={60} borderRadius={8} />
                )}
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
                  onPress={() => removeMedia(item.uri)}
                >
                  <CrossIcon width={16} height={16} />
                </Circle>
              </Stack>
            ))}
          </XStack>
        </ScrollView>
      </View>
    ),
    [chatFooterContentContainerStyle, mediaItems, removeMedia]
  );

  const handleSupportChatOptions = useCallback(() => {
    if (!isSupportChat || !conversationId) return;

    const actionText = isArchived ? t("unarchive") : t("archive");
    const options = [actionText, t("cancel")];
    const cancelButtonIndex = 1;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex: number) => {
          if (buttonIndex === 0) {
            if (isArchived) {
              // Unarchive
              await unarchiveSupportConversation({
                conversationId,
                userId: actualSupportUserId,
              });
              toast.show({ status: "Success", title: t("support.unarchived") });
            } else {
              // Archive
              await archiveSupportConversation({
                conversationId,
                userId: actualSupportUserId,
              });
              toast.show({ status: "Success", title: t("support.archived") });
            }
            navigation.goBack();
          }
        }
      );
    } else {
      // For Android, directly archive/unarchive
      if (isArchived) {
        unarchiveSupportConversation({
          conversationId,
          userId: actualSupportUserId,
        }).then(() => {
          toast.show({ status: "Success", title: t("support.unarchived") });
          navigation.goBack();
        });
      } else {
        archiveSupportConversation({
          conversationId,
          userId: actualSupportUserId,
        }).then(() => {
          toast.show({ status: "Success", title: t("support.archived") });
          navigation.goBack();
        });
      }
    }
  }, [
    actualSupportUserId,
    archiveSupportConversation,
    conversationId,
    isArchived,
    isSupportChat,
    navigation,
    t,
    toast,
    unarchiveSupportConversation,
  ]);

  const renderInputToolbar = useCallback(
    (props: InputToolbarProps<IMessage>) => {
      if (isRecorderVisible) {
        return (
          <ChatAudioRecorder
            isVisible={isRecorderVisible}
            onClose={() => setIsRecorderVisible(false)}
            onSend={async ({ uri }) => {
              const uploadedUri = await uploadChatMedia(uri, "audio");
              if (uploadedUri && user) {
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
        );
      }
      return <InputToolbar {...props} />;
    },
    [isRecorderVisible, onSend, user]
  );

  const imageViewerData = useMemo(
    () =>
      mediaItems
        .filter((item) => item.type === "image")
        .map((item) => ({
          key: item.uri,
          source: { uri: item.uri },
        })),
    [mediaItems]
  );

  const chatUser = useMemo(
    () => ({
      _id: isSupportChat && supportUserId ? "support" : user?.id ?? "unknown",
      name: isSupportChat && supportUserId ? "Support" : user?.fullName ?? "User",
    }),
    [isSupportChat, supportUserId, user?.fullName, user?.id]
  );

  const renderAvatar = useMemo(() => {
    return match({ interlocutorId, isSupportChat })
      .with({ interlocutorId: P.not(P.nullish) }, () => () => null)
      .with({ isSupportChat: true }, () => () => null)
      .otherwise(() => undefined);
  }, [interlocutorId, isSupportChat]);

  const onPressAvatar = useCallback(() => {}, []);

  const renderSystemMessage = useCallback(
    (message: { currentMessage?: IMessage }) => (
      <Card bg="$white0" p={12} my={16} mx={8} borderRadius={8}>
        <Text color="$gray11" textAlign="center">
          {message.currentMessage?.text}
        </Text>
      </Card>
    ),
    []
  );

  const renderMessageImage = useCallback((props: { currentMessage?: IMessage }) => {
    const message = props.currentMessage as ChatMessage | undefined;
    const mediaKey = message?.mediaKey;

    return (
      <Stack m={4}>
        <MediaImage
          mediaKey={mediaKey}
          height={200}
          width={200}
          borderCurve="continuous"
          borderRadius="$4"
          viewerEnabled
        />
      </Stack>
    );
  }, []);

  const renderBubble = useCallback(
    (props: any) => (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Colors.Success[1],
          },
        }}
      />
    ),
    []
  );

  const handleLongPress = useCallback(
    (context: unknown, message: IMessage) => {
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
    },
    [unsend, userId, t]
  );

  return (
    // UX TODO: Identify which messages are from the teacher (can be done using the avatar or the message sender name)
    // UX TODO: This might need to be done in the ChatListScreen as well?
    <SafeView f={1}>
      <AppBar
        title={title}
        rightComponent={
          isSupportChat && supportUserId ? (
            <TouchableOpacity onPress={handleSupportChatOptions} style={{ paddingHorizontal: 8 }}>
              <OptionsIcon size={24} color={Colors.Primary[1]} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      <Separator />
      {status === "LoadingFirstPage" ? (
        <Stack f={1} jc="center">
          <ActivityIndicator />
        </Stack>
      ) : (
        <Fragment>
          {/* ImageViewer for footer/upload images (only images, not videos) */}
          <ImageViewer
            ref={imageViewerRef}
            data={imageViewerData}
          />

          <GiftedChat
            keyboardShouldPersistTaps="never" // For Android
            messages={messages}
            user={chatUser}
            onSend={onSend}
            renderSend={renderSend}
            // Show send icon when there are images attached
            alwaysShowSend
            renderActions={renderActions}
            renderComposer={renderComposer}
            renderInputToolbar={renderInputToolbar}
            renderChatFooter={renderChatFooter}
            renderMessageAudio={renderMessageAudio}
            renderMessageVideo={renderMessageVideo}
            renderUsernameOnMessage={!interlocutorId} // Show sender name only in team chats
            renderAvatarOnTop // Render avatars at the top of consecutive messages, rather than the bottom
            showAvatarForEveryMessage={false} // One avatar for consecutive messages from the same user on the same day
            renderAvatar={renderAvatar} // Show avatar in team chats only
            onPressAvatar={onPressAvatar} // UX TODO: Implement a chat with someone feature; can be view profile too
            renderSystemMessage={renderSystemMessage}
            renderMessageImage={renderMessageImage}
            onLongPress={handleLongPress}
            renderBubble={renderBubble}
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
): ChatMessage => ({
  _id: message._id,
  text: message.text ?? "",
  createdAt: new Date(message._creationTime),
  user: {
    _id: message.senderId,
    name: message.senderName,
  },
  system: message.isSystem,
  // Include mediaKey for lazy URL resolution in render components
  mediaKey: message.mediaKey ?? undefined,
  mediaType: message.mediaType ?? undefined,
  // Set image/audio/video to mediaKey so GiftedChat knows to render the media component
  ...(message.mediaType === "image" && message.mediaKey ? { image: message.mediaKey } : {}),
  ...(message.mediaType === "audio" && message.mediaKey ? { audio: message.mediaKey } : {}),
  ...(message.mediaType === "video" && message.mediaKey ? { video: message.mediaKey } : {}),
});
