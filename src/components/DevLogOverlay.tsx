import { FunctionComponent, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "tamagui";
import { useAtomValue } from "jotai";
import { devLogsAtom, devModeAtom } from "state/devMode";

interface DevLogOverlayProps {
  style?: ViewStyle;
  maxVisibleEntries?: number;
}

export const DevLogOverlay: FunctionComponent<DevLogOverlayProps> = ({
  style,
  maxVisibleEntries = 12,
}) => {
  const isDevMode = useAtomValue(devModeAtom);
  const logs = useAtomValue(devLogsAtom);

  const visibleLogs = useMemo(() => {
    if (!logs.length) return [];
    return logs.slice(Math.max(0, logs.length - maxVisibleEntries));
  }, [logs, maxVisibleEntries]);

  if (!isDevMode || visibleLogs.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Text fontSize={12} fontWeight="700" color="white" marginBottom={4}>
        Dev Logs
      </Text>
      {visibleLogs.map((log, index) => (
        <Text key={`${log}-${index}`} fontSize={10} color="white">
          {log}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
    maxWidth: "100%",
    zIndex: 1000,
  },
});
