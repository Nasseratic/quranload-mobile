import { ComponentProps } from "react";
import { Paragraph, styled } from "tamagui";

type TypographyVariant =
  | "display"
  | "headline"
  | "title"
  | "subheader"
  | "body"
  | "caption"
  | "small";

type TypographyTone = "default" | "muted" | "subtle" | "inverse" | "success" | "warning" | "danger";

type TypographyWeight = "regular" | "medium" | "semibold" | "bold";

const lineHeights: Record<TypographyVariant, number> = {
  display: 48,
  headline: 32,
  title: 28,
  subheader: 24,
  body: 22,
  caption: 18,
  small: 16,
};

const fontSizes: Record<TypographyVariant, number> = {
  display: 36,
  headline: 24,
  title: 20,
  subheader: 16,
  body: 14,
  caption: 12,
  small: 10,
};

const weightMap: Record<TypographyWeight, string> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const toneMap: Record<TypographyTone, string> = {
  default: "$text",
  muted: "$textMuted",
  subtle: "$textSubtle",
  inverse: "$textInverse",
  success: "$success",
  warning: "$warning",
  danger: "$danger",
};

export const TypographyFrame = styled(
  Paragraph,
  {
  color: "$text",
  fontFamily: "$body",
  variants: {
    variant: {
      display: {
        fontSize: fontSizes.display,
        lineHeight: lineHeights.display,
        fontFamily: "$heading",
      },
      headline: {
        fontSize: fontSizes.headline,
        lineHeight: lineHeights.headline,
        fontFamily: "$heading",
      },
      title: {
        fontSize: fontSizes.title,
        lineHeight: lineHeights.title,
        fontFamily: "$heading",
      },
      subheader: {
        fontSize: fontSizes.subheader,
        lineHeight: lineHeights.subheader,
      },
      body: {
        fontSize: fontSizes.body,
        lineHeight: lineHeights.body,
      },
      caption: {
        fontSize: fontSizes.caption,
        lineHeight: lineHeights.caption,
      },
      small: {
        fontSize: fontSizes.small,
        lineHeight: lineHeights.small,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      },
    },
    weight: {
      regular: {
        fontWeight: weightMap.regular,
        fontFamily: "$body",
      },
      medium: {
        fontWeight: weightMap.medium,
        fontFamily: "$body",
      },
      semibold: {
        fontWeight: weightMap.semibold,
        fontFamily: "$heading",
      },
      bold: {
        fontWeight: weightMap.bold,
        fontFamily: "$heading",
      },
    },
    tone: {
      default: {
        color: toneMap.default,
      },
      muted: {
        color: toneMap.muted,
      },
      subtle: {
        color: toneMap.subtle,
      },
      inverse: {
        color: toneMap.inverse,
      },
      success: {
        color: toneMap.success,
      },
      warning: {
        color: toneMap.warning,
      },
      danger: {
        color: toneMap.danger,
      },
    },
    underline: {
      true: {
        textDecorationLine: "underline",
      },
    },
    align: {
      left: { textAlign: "left" },
      center: { textAlign: "center" },
      right: { textAlign: "right" },
    },
  },
  } as const,
);

export type TypographyProps = ComponentProps<typeof TypographyFrame> & {
  variant?: TypographyVariant;
  tone?: TypographyTone;
  weight?: TypographyWeight;
};

export const Typography = ({
  variant = "body",
  tone = "default",
  weight = "regular",
  ...rest
}: TypographyProps) => {
  return <TypographyFrame variant={variant} tone={tone} weight={weight} {...rest} />;
};

export const Heading = ({ variant = "headline", weight = "bold", ...rest }: TypographyProps) => (
  <TypographyFrame variant={variant} weight={weight} {...rest} />
);

export const Subheading = ({ variant = "subheader", weight = "semibold", ...rest }: TypographyProps) => (
  <TypographyFrame variant={variant} weight={weight} {...rest} />
);

export default Typography;
