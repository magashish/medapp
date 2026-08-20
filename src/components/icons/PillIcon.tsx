import React from "react";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";

export function PillIcon({
  size = 40,
  colorA = "#FFFFFF",
  colorB = "#D8F3E3",
  outline = "#178449",
}: {
  size?: number;
  colorA?: string;
  colorB?: string;
  outline?: string;
}) {
  const w = 100;
  const h = 46;
  return (
    <Svg width={size} height={(size * h) / w} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <ClipPath id="capsuleClip">
          <Rect x={1} y={1} width={w - 2} height={h - 2} rx={(h - 2) / 2} ry={(h - 2) / 2} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#capsuleClip)">
        <Rect x={0} y={0} width={w / 2} height={h} fill={colorA} />
        <Rect x={w / 2} y={0} width={w / 2} height={h} fill={colorB} />
      </G>
      <Rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={(h - 2) / 2}
        ry={(h - 2) / 2}
        fill="none"
        stroke={outline}
        strokeWidth={3}
      />
    </Svg>
  );
}
