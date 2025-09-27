import { ComponentProps } from "react";
import { styled } from "tamagui";
import { ButtonFrame } from "./Button";

const IconButtonFrame = styled(ButtonFrame, {
  backgroundColor: "$surface",
  color: "$text",
  paddingHorizontal: 0,
  paddingVertical: 0,
  aspectRatio: 1,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "$full",
  variants: {
    size: {
      sm: {
        width: "$sm",
        height: "$sm",
      },
      md: {
        width: "$md",
        height: "$md",
      },
      lg: {
        width: "$lg",
        height: "$lg",
      },
    },
  },
  defaultVariants: {
    size: "md" as const,
  },
});

export const QUIIconButton = (props: ComponentProps<typeof IconButtonFrame>) => {
  return <IconButtonFrame {...props} />;
};

export type QUIIconButtonProps = ComponentProps<typeof IconButtonFrame>;
