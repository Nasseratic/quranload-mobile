import { ComponentProps, ReactNode } from "react";
import { Stack, XStack, YStack, styled } from "tamagui";
import { Typography } from "./Typography";

export type ListItemTone = "default" | "success" | "danger" | "warning" | "primary";
export type ListItemDensity = "comfortable" | "compact";

const ListItemFrame = styled(XStack, {
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: "$lg",
  borderRadius: "$md",
  backgroundColor: "$surface",
  borderColor: "$border",
  borderWidth: 1,
  pressStyle: {
    backgroundColor: "$surfaceMuted",
  },
  hoverStyle: {
    backgroundColor: "$surfaceMuted",
  },
  variants: {
    density: {
      comfortable: {
        paddingVertical: "$md",
        gap: "$md",
      },
      compact: {
        paddingVertical: "$sm",
        gap: "$sm",
      },
    },
    tone: {
      default: {},
      success: {
        borderColor: "$success",
      },
      danger: {
        borderColor: "$danger",
      },
      warning: {
        borderColor: "$warning",
      },
      primary: {
        borderColor: "$primary",
      },
    },
    interactive: {
      true: {
        cursor: "pointer",
      },
      false: {
        cursor: "default",
      },
    },
  },
  defaultVariants: {
    density: "comfortable",
    tone: "default",
    interactive: true,
  },
});

export type ListItemProps = ComponentProps<typeof ListItemFrame> & {
  title: string;
  subtitle?: string;
  description?: string;
  meta?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  tone?: ListItemTone;
  density?: ListItemDensity;
};

export const ListItem = ({
  title,
  subtitle,
  description,
  meta,
  leading,
  trailing,
  tone = "default",
  density = "comfortable",
  ...rest
}: ListItemProps) => (
  <ListItemFrame density={density} tone={tone} {...rest}>
    <XStack gap="$md" alignItems="center" flex={1}>
      {leading ? <Stack>{leading}</Stack> : null}
      <YStack flex={1} gap="$xxs">
        <Typography variant="subheader" weight="semibold">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" tone="muted">
            {subtitle}
          </Typography>
        ) : null}
        {description ? (
          <Typography variant="body" tone="subtle">
            {description}
          </Typography>
        ) : null}
      </YStack>
    </XStack>
    <XStack gap="$sm" alignItems="center" justifyContent="flex-end">
      {typeof meta === "string" ? (
        <Typography tone={tone === "default" ? "muted" : "default"}>{meta}</Typography>
      ) : (
        meta
      )}
      {trailing ? <Stack>{trailing}</Stack> : null}
    </XStack>
  </ListItemFrame>
);

export { ListItemFrame };
