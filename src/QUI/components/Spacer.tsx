import { Stack } from "tamagui";

type SpacerAxis = "vertical" | "horizontal";

type SpacerProps = {
  size?: number | string;
  axis?: SpacerAxis;
};

const SpacerBase = ({ size = "$sm", axis = "vertical" }: SpacerProps) => {
  const dimensionProps =
    axis === "vertical"
      ? { height: size, width: 0 }
      : { width: size, height: 0 };

  return <Stack aria-hidden pointerEvents="none" {...dimensionProps} />;
};

const SpacerVertical = ({ size = "$sm" }: Omit<SpacerProps, "axis">) => (
  <SpacerBase axis="vertical" size={size} />
);

const SpacerHorizontal = ({ size = "$sm" }: Omit<SpacerProps, "axis">) => (
  <SpacerBase axis="horizontal" size={size} />
);

type SpacerComponent = typeof SpacerBase & {
  Vertical: typeof SpacerVertical;
  Horizontal: typeof SpacerHorizontal;
};

export const Spacer: SpacerComponent = Object.assign(SpacerBase, {
  Vertical: SpacerVertical,
  Horizontal: SpacerHorizontal,
});

export default Spacer;
