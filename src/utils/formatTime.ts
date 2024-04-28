import {
  format,
  getTime,
  formatDistanceToNow,
  intervalToDuration,
  minutesToMilliseconds,
} from "date-fns";
import { da } from "date-fns/locale";
import { i18n, t } from "locales/config";
import { match } from "ts-pattern";

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function fDate(date: InputValue | string | number, newFormat?: string) {
  const fm = newFormat || "dd MMM yyyy";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? format(new Date(date), fm, { locale: da }) : "";
}
export function fDateDashed(date: InputValue | string | number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? format(new Date(date), "MM-dd-yy", { locale: da }) : "";
}
export function fDateTime(date: InputValue | string | number, newFormat?: string) {
  const fm = newFormat || "dd.MM.yy HH:mm";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? format(new Date(date), fm, { locale: da }) : "";
}

export function fTimestamp(date: InputValue | string | number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? getTime(new Date(date)) : "";
}

export function fDateTimeSuffix(date: InputValue | string | number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: da }) : "";
}

export function fToNow(date: InputValue | string | number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
  return date ? formatDistanceToNow(new Date(date), { addSuffix: true, locale: da }) : "";
}

export function diffInDays(a: Date, b: Date) {
  const aUTC = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUTC = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((bUTC - aUTC) / MS_PER_DAY);
}

const dateIntlConfig = {
  year: "numeric",
  day: "numeric",
  month: "long",
} satisfies Intl.DateTimeFormatOptions;

const dateShortIntlConfig = {
  year: "2-digit",
  day: "numeric",
  month: "numeric",
} satisfies Intl.DateTimeFormatOptions;

export const intlFormat = (date: Date, format: "date" | "date-short") => {
  return Intl.DateTimeFormat(
    i18n.locale,
    match(format)
      .with("date", () => dateIntlConfig)
      .with("date-short", () => dateShortIntlConfig)
      .exhaustive()
  ).format(date);
};

export const fMinutesDuration = ({ mins }: { mins: number }) => {
  const duration = intervalToDuration({ start: 0, end: minutesToMilliseconds(mins) });

  return (
    `${duration.minutes ? `${duration.minutes}${t("time.m")}` : ""} ${
      duration.seconds ? `${duration.seconds}${t("time.s")}` : ""
    }`.trim() || "0"
  );
};
