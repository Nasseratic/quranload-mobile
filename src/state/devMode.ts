import { atom } from "jotai";
import { jotaiStore } from "state/store";

const MAX_LOGS = 200;

type DevLogPayload = Record<string, unknown> | string | undefined;

export const devModeAtom = atom(false);

export const devLogsAtom = atom<string[]>([]);

export const appendDevLogAtom = atom(null, (get, set, log: string) => {
  const logs = get(devLogsAtom);
  const nextLogs = [...logs, log];
  if (nextLogs.length > MAX_LOGS) {
    nextLogs.splice(0, nextLogs.length - MAX_LOGS);
  }
  set(devLogsAtom, nextLogs);
});

export const clearDevLogsAtom = atom(null, (_get, set) => {
  set(devLogsAtom, []);
});

const formatPayload = (payload: DevLogPayload) => {
  if (payload === undefined) return "";
  if (typeof payload === "string") {
    return ` – ${payload}`;
  }
  try {
    return ` – ${JSON.stringify(payload)}`;
  } catch (error) {
    return ` – ${String(error)}`;
  }
};

export const logDevEvent = (message: string, payload?: DevLogPayload) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}${formatPayload(payload)}`;
  jotaiStore.set(appendDevLogAtom, entry);
};
