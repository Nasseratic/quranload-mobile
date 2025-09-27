import { PropsWithChildren, ReactNode } from "react";
import { Button, GetProps, Spinner, XStack, styled } from "tamagui";

type VisualVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "danger" | "link" | "surface";
type SizeVariant = "sm" | "md" | "lg";

export const ButtonFrame = styled(
  Button,
  {
  fontFamily: "$button",
  borderRadius: "$md",
  gap: "$xs",
  pressStyle: {
    scale: 0.97,
  },
  variants: {
    visual: {
      primary: {
        backgroundColor: "$primary",
        color: "$textInverse",
        hoverStyle: {
          backgroundColor: "$primaryHover",
        },
      },
      secondary: {
        backgroundColor: "$accent",
        color: "$textInverse",
        hoverStyle: {
          backgroundColor: "$accentHover",
        },
      },
      surface: {
        backgroundColor: "$surface",
        color: "$text",
        borderColor: "$border",
        borderWidth: 1,
      },
      outline: {
        backgroundColor: "transparent",
        color: "$text",
        borderColor: "$border",
        borderWidth: 1,
        hoverStyle: {
          borderColor: "$primary",
          backgroundColor: "$surfaceMuted",
        },
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$text",
        hoverStyle: {
          backgroundColor: "$surfaceMuted",
        },
      },
      success: {
        backgroundColor: "$success",
        color: "$textInverse",
      },
      danger: {
        backgroundColor: "$danger",
        color: "$textInverse",
      },
      link: {
        backgroundColor: "transparent",
        color: "$primary",
        paddingHorizontal: 0,
      },
    },
    size: {
      sm: {
        height: "$sm",
        paddingHorizontal: "$sm",
        borderRadius: "$sm",
        fontSize: 14,
      },
      md: {
        height: "$md",
        paddingHorizontal: "$md",
        borderRadius: "$md",
        fontSize: 16,
      },
      lg: {
        height: "$lg",
        paddingHorizontal: "$lg",
        borderRadius: "$lg",
        fontSize: 18,
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
    isLoading: {
      true: {
        pointerEvents: "none",
        opacity: 0.8,
      },
    },
  },
  } as const,
);

type ButtonProps = PropsWithChildren<{
  visual?: VisualVariant;
  size?: SizeVariant;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  isLoading?: boolean;
}> &
  Omit<GetProps<typeof ButtonFrame>, "children">;

export const QUIButton = ({
  children,
  startIcon,
  endIcon,
  isLoading,
  disabled,
  visual = "primary",
  size = "md",
  ...rest
}: ButtonProps) => {
  const spinnerColor =
    visual === "primary" ||
    visual === "secondary" ||
    visual === "success" ||
    visual === "danger"
      ? "$textInverse"
      : "$text";

  return (
    <ButtonFrame
      {...rest}
      visual={visual}
      size={size}
      disabled={disabled || isLoading}
      isLoading={isLoading}
    >
      <XStack alignItems="center" gap="$xs" justifyContent="center">
        {startIcon}
        {children}
        {isLoading ? <Spinner size="small" color={spinnerColor} /> : endIcon}
      </XStack>
    </ButtonFrame>
  );
};

export type QUIButtonProps = Parameters<typeof QUIButton>[0];
