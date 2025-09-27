import { ComponentProps } from "react";
import { Stack, XStack, YStack, styled } from "tamagui";
import { Typography } from "./Typography";

const shadowStyles = {
  none: {},
  sm: {
    shadowColor: "$shadow",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  md: {
    shadowColor: "$shadow",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const CardFrame = styled(YStack, {
  backgroundColor: "$surface",
  borderRadius: "$md",
  padding: "$lg",
  gap: "$sm",
  borderWidth: 1,
  borderColor: "$border",
  variants: {
    interactive: {
      true: {
        hoverStyle: {
          backgroundColor: "$surfaceMuted",
          shadowColor: "$shadowStrong",
        },
        pressStyle: {
          backgroundColor: "$surfaceStrong",
        },
      },
    },
    tone: {
      default: {},
      primary: {
        borderColor: "$primary",
      },
      success: {
        borderColor: "$success",
      },
      danger: {
        borderColor: "$danger",
      },
    },
    elevation: {
      none: shadowStyles.none,
      sm: shadowStyles.sm,
      md: shadowStyles.md,
    },
  },
  defaultVariants: {
    elevation: "sm",
    tone: "default",
  },
});

export type CardProps = ComponentProps<typeof CardFrame>;

export const Card = (props: CardProps) => <CardFrame {...props} />;

export const CardHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <XStack alignItems="center" justifyContent="space-between" gap="$md">
    <YStack flex={1} gap="$xxs">
      <Typography variant="subheader" weight="semibold">
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" tone="muted">
          {subtitle}
        </Typography>
      ) : null}
    </YStack>
    {action ? <Stack>{action}</Stack> : null}
  </XStack>
);

export const CardContent = (props: ComponentProps<typeof YStack>) => (
  <YStack gap="$sm" {...props} />
);

export const CardFooter = (props: ComponentProps<typeof XStack>) => (
  <XStack alignItems="center" gap="$sm" justifyContent="flex-end" {...props} />
);

export default Card;
