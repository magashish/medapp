import React from "react";
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";

type PersonSpec = {
  id: string;
  cx: number;
  headTopY: number;
  headR: number;
  bodyWidth: number;
  bodyColor: string;
  skin: string;
  hair: string;
  hairStyle: "cap" | "bun" | "tuft";
  glasses?: boolean;
};

const GROUND_Y = 206;

const PEOPLE: PersonSpec[] = [
  {
    id: "grandpa",
    cx: 36,
    headTopY: 66,
    headR: 17,
    bodyWidth: 40,
    bodyColor: "#5B8CB8",
    skin: "#E8B98C",
    hair: "#C9CDD1",
    hairStyle: "cap",
    glasses: true,
  },
  {
    id: "dad",
    cx: 103,
    headTopY: 38,
    headR: 19,
    bodyWidth: 48,
    bodyColor: "#22A55E",
    skin: "#D9A272",
    hair: "#3B2A20",
    hairStyle: "cap",
  },
  {
    id: "mom",
    cx: 172,
    headTopY: 47,
    headR: 18,
    bodyWidth: 44,
    bodyColor: "#8B5CF6",
    skin: "#EFC7A0",
    hair: "#3B2A20",
    hairStyle: "bun",
  },
  {
    id: "kid",
    cx: 237,
    headTopY: 112,
    headR: 13,
    bodyWidth: 30,
    bodyColor: "#E8A23B",
    skin: "#F0CFA0",
    hair: "#4A2E1E",
    hairStyle: "tuft",
  },
  {
    id: "grandma",
    cx: 302,
    headTopY: 66,
    headR: 16,
    bodyWidth: 38,
    bodyColor: "#E0709A",
    skin: "#EAC69A",
    hair: "#E5E7EA",
    hairStyle: "bun",
    glasses: true,
  },
];

function Person(p: PersonSpec) {
  const cy = p.headTopY + p.headR;
  const bodyTop = p.headTopY + p.headR * 2 - 2;
  const bodyH = GROUND_Y - bodyTop;

  return (
    <G key={p.id}>
      {/* legs/shoes */}
      <Rect
        x={p.cx - p.bodyWidth * 0.32}
        y={GROUND_Y - 12}
        width={p.bodyWidth * 0.64}
        height={12}
        rx={4}
        fill="#3A4A3F"
        opacity={0.85}
      />
      {/* body */}
      <Rect
        x={p.cx - p.bodyWidth / 2}
        y={bodyTop}
        width={p.bodyWidth}
        height={bodyH - 6}
        rx={p.bodyWidth * 0.3}
        fill={p.bodyColor}
      />
      {/* head + hair, clipped to a circle */}
      <Defs>
        <ClipPath id={`clip-${p.id}`}>
          <Circle cx={p.cx} cy={cy} r={p.headR} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip-${p.id})`}>
        <Rect x={p.cx - p.headR} y={cy - p.headR} width={p.headR * 2} height={p.headR * 2} fill={p.skin} />
        <Rect
          x={p.cx - p.headR}
          y={cy - p.headR}
          width={p.headR * 2}
          height={p.headR * (p.hairStyle === "tuft" ? 0.75 : 1.05)}
          fill={p.hair}
        />
      </G>
      {p.hairStyle === "bun" ? <Circle cx={p.cx} cy={cy - p.headR - 3} r={p.headR * 0.28} fill={p.hair} /> : null}
      {/* face */}
      <Circle cx={p.cx - p.headR * 0.35} cy={cy + p.headR * 0.1} r={1.6} fill="#33261D" />
      <Circle cx={p.cx + p.headR * 0.35} cy={cy + p.headR * 0.1} r={1.6} fill="#33261D" />
      <Path
        d={`M ${p.cx - p.headR * 0.3} ${cy + p.headR * 0.45} Q ${p.cx} ${cy + p.headR * 0.65} ${p.cx + p.headR * 0.3} ${cy + p.headR * 0.45}`}
        stroke="#33261D"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
      {p.glasses ? (
        <>
          <Circle cx={p.cx - p.headR * 0.35} cy={cy + p.headR * 0.1} r={p.headR * 0.3} stroke="#3A4A3F" strokeWidth={1.4} fill="none" />
          <Circle cx={p.cx + p.headR * 0.35} cy={cy + p.headR * 0.1} r={p.headR * 0.3} stroke="#3A4A3F" strokeWidth={1.4} fill="none" />
          <Path
            d={`M ${p.cx - p.headR * 0.05} ${cy + p.headR * 0.1} L ${p.cx + p.headR * 0.05} ${cy + p.headR * 0.1}`}
            stroke="#3A4A3F"
            strokeWidth={1.4}
          />
        </>
      ) : null}
    </G>
  );
}

export function FamilyIllustration({ width = 340 }: { width?: number }) {
  const height = (width * 216) / 340;
  return (
    <Svg width={width} height={height} viewBox="0 0 340 216">
      <Path d={`M 0 ${GROUND_Y + 1} L 340 ${GROUND_Y + 1}`} stroke="#D9E6DC" strokeWidth={2} />
      {PEOPLE.map((p) => (
        <Person key={p.id} {...p} />
      ))}
    </Svg>
  );
}
