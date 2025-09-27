import { ComponentProps } from "react";
import { Input, TextArea, YStack, styled } from "tamagui";
import { Typography } from "./Typography";

const baseFieldStyles = {
  borderRadius: "$sm",
  borderWidth: 1,
  borderColor: "$border",
  backgroundColor: "$surface",
  color: "$text",
  paddingHorizontal: "$md",
  fontSize: 16,
  placeholderTextColor: "$textSubtle",
  focusStyle: {
    borderColor: "$focus",
    shadowColor: "$shadow",
    shadowRadius: 12,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
  },
};

const InputFrame = styled(Input, {
  ...baseFieldStyles,
  height: "$md",
});

const TextAreaFrame = styled(TextArea, {
  ...baseFieldStyles,
  paddingVertical: "$sm",
  minHeight: 96,
});

export type QUIInputProps = ComponentProps<typeof InputFrame> & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export const QUIInput = ({ label, helperText, errorText, ...rest }: QUIInputProps) => {
  const helperTone = errorText ? "danger" : "muted";

  return (
    <YStack gap="$xxs">
      {label ? (
        <Typography variant="subheader" weight="semibold">
          {label}
        </Typography>
      ) : null}
      <InputFrame
        {...rest}
        borderColor={errorText ? "$danger" : rest.borderColor}
        aria-invalid={Boolean(errorText)}
      />
      {errorText ? (
        <Typography variant="caption" tone="danger">
          {errorText}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" tone={helperTone}>
          {helperText}
        </Typography>
      ) : null}
    </YStack>
  );
};

export type QUITextAreaProps = ComponentProps<typeof TextAreaFrame> & {
  label?: string;
  helperText?: string;
  errorText?: string;
};

export const QUITextArea = ({ label, helperText, errorText, ...rest }: QUITextAreaProps) => (
  <YStack gap="$xxs">
    {label ? (
      <Typography variant="subheader" weight="semibold">
        {label}
      </Typography>
    ) : null}
    <TextAreaFrame
      {...rest}
      borderColor={errorText ? "$danger" : rest.borderColor}
      aria-invalid={Boolean(errorText)}
    />
    {errorText ? (
      <Typography variant="caption" tone="danger">
        {errorText}
      </Typography>
    ) : helperText ? (
      <Typography variant="caption" tone="muted">
        {helperText}
      </Typography>
    ) : null}
  </YStack>
);

export { InputFrame, TextAreaFrame };
