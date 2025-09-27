import { ComponentProps } from "react";
import { Paragraph, styled } from "tamagui";

export type BadgeTone = "default" | "primary" | "success" | "warning" | "danger" | "neutral";

const BadgeFrame = styled(Paragraph, {
  fontFamily: "$button",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  borderRadius: "$full",
  paddingHorizontal: "$sm",
  paddingVertical: 4,
  backgroundColor: "$surfaceMuted",
  color: "$text",
  alignSelf: "flex-start",
  variants: {
    tone: {
      default: {},
      neutral: {
        backgroundColor: "$surface",
        borderWidth: 1,
        borderColor: "$border",
      },
      primary: {
        backgroundColor: "$primary",
        color: "$textInverse",
      },
      success: {
        backgroundColor: "$success",
        color: "$textInverse",
      },
      warning: {
        backgroundColor: "$warning",
        color: "$text",
      },
      danger: {
        backgroundColor: "$danger",
        color: "$textInverse",
      },
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export type BadgeProps = ComponentProps<typeof BadgeFrame> & {
  tone?: BadgeTone;
};

export const Badge = (props: BadgeProps) => <BadgeFrame {...props} />;

export default Badge;
