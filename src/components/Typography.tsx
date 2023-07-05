import { useMemo } from "react";
import { View, Text, TextProps, TextStyle, StyleProp } from "react-native";
import typographiesStyles, { TypographyType } from "styles/typographies";

const LINE_HEIGHT_MULTIPLIER = 1.33;

interface Props extends TextProps {
  type?: TypographyType;
  style?: StyleProp<TextStyle>;
}

const Typography = ({ type = "BodyLight", style, children }: Props) => {
  const typographyStyle = useMemo(() => typographiesStyles[type], [type]);

  return (
    <Text
      style={[
        {
          lineHeight: typographyStyle.fontSize * LINE_HEIGHT_MULTIPLIER,
          ...typographyStyle,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default Typography;
