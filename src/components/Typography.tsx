import React, { useMemo } from "react";
import { Text, TextProps, TextStyle } from "react-native";
import typographiesStyles, { TypographyType } from "styles/Typographies";

const LINE_HEIGHT_MULTIPLIER = 1.33;

interface Props extends TextProps {
  type?: TypographyType;
  style?: TextStyle;
}

const Typography = ({ type = "BodyLight", style, children }: Props) => {
  const typographyStyle = useMemo(() => typographiesStyles[type], [type]);

  return (
    <Text
      style={{
        lineHeight: typographyStyle.fontSize * LINE_HEIGHT_MULTIPLIER,
        ...typographyStyle,
        ...style,
      }}
    >
      {children}
    </Text>
  );
};

export default Typography;
