import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Circle, G, Rect, Text } from "react-native-svg";
import { ColorValue, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import type {
  LineChartData,
  LineChartProps,
} from "react-native-chart-kit/dist/line-chart/LineChart";
import { Colors } from "constants/Colors";
import { fMinutesDuration } from "utils/formatTime";

const screenWidth = Dimensions.get("window").width - 32;

const Tooltip = ({
  x,
  y,
  textX,
  textY,
  stroke,
  pointStroke,
  position,
}: {
  x: number;
  y: number;
  textX: string;
  textY: number;
  stroke: ColorValue;
  pointStroke: ColorValue;
  position: string;
}) => {
  let tipW = 65,
    tipH = 36,
    tipX = 5,
    tipY = -9,
    tipTxtX = 12,
    tipTxtY = 6;
  const posY = y;
  const posX = x;

  if (posX > screenWidth - tipW) {
    tipX = -(tipX + tipW);
    tipTxtX = tipTxtX - tipW - 6;
  }

  const boxPosX = position === "left" ? posX - tipW - 10 : posX;

  return (
    <G>
      <Circle
        cx={posX}
        cy={posY}
        r={4}
        stroke={pointStroke}
        strokeWidth={2}
        fill={Colors.Success[1]}
      />
      <G x={boxPosX < 40 ? 40 : boxPosX} y={posY}>
        <Rect
          x={tipX + 1}
          y={tipY - 1}
          width={tipW - 2}
          height={tipH - 2}
          fill={"rgba(255, 255, 255, 0.9)"}
          rx={2}
          ry={2}
        />
        <Rect
          x={tipX}
          y={tipY}
          width={tipW}
          height={tipH}
          rx={2}
          ry={2}
          fill={"transparent"}
          stroke={stroke}
        />
        <Text x={tipTxtX} y={tipTxtY} fontSize="10" textAnchor="start">
          {textX}
        </Text>

        <Text x={tipTxtX} y={tipTxtY + 14} fontSize="11" textAnchor="start">
          {fMinutesDuration({ mins: textY })}
        </Text>
      </G>
    </G>
  );
};

Tooltip.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  stroke: PropTypes.string,
  pointStroke: PropTypes.string,
  textX: PropTypes.string,
  textY: PropTypes.number,
  position: PropTypes.string,
};

Tooltip.defaultProps = {
  position: "right",
};

type ValueFormatter = (value: number) => number;

type LineChartWithTooltipsProps = Omit<LineChartProps, "decorator" | "onDataPointClick"> & {
  valueFormatter?: ValueFormatter;
};

type DataPointEvent = Parameters<NonNullable<LineChartProps["onDataPointClick"]>>[0];

const tooltipDecorators = (
  state: DataPointEvent | null,
  data: LineChartData,
  valueFormatter: ValueFormatter
) => () => {
  if (state === null) {
    return null;
  }

  const { index, value, x, y } = state;
  const labels = data.labels ?? [];
  const textX = labels[index] ?? "";
  const position = labels.length === index + 1 ? "left" : "right";

  return (
    <Tooltip
      textX={String(textX)}
      textY={valueFormatter(value)}
      x={x}
      y={y}
      stroke={Colors.Success[1]}
      pointStroke={Colors.Success[1]}
      position={position}
    />
  );
};

const LineChartWithTooltips = ({
  valueFormatter: providedValueFormatter,
  data,
  ...props
}: LineChartWithTooltipsProps) => {
  const [state, setState] = useState<DataPointEvent | null>(null);

  const valueFormatter = useMemo<ValueFormatter>(
    () => providedValueFormatter ?? ((value: number) => value),
    [providedValueFormatter]
  );

  return (
    <LineChart
      {...props}
      data={data}
      decorator={tooltipDecorators(state, data, valueFormatter)}
      onDataPointClick={setState}
    />
  );
};

LineChartWithTooltips.propTypes = {
  valueFormatter: PropTypes.func,
};

LineChartWithTooltips.defaultProps = {
  valueFormatter: (value: number) => value,
};

export default LineChartWithTooltips;
