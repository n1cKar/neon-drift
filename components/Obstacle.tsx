import React from "react";

type Shape = "square" | "rectangle" | "triangle" | "diamond";

export default function Obstacle({
  x,
  y,
  size,
  shape,
}: {
  x: number;
  y: number;
  size: number;
  shape: Shape;
}) {
  if (shape === "triangle") {
    return (
      <div
        className="absolute"
        style={{
          left: x - size / 2,
          top: y - size / 2,
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid limegreen`,
        }}
      ></div>
    );
  }

  if (shape === "diamond") {
    return (
      <div
        className="absolute bg-purple-500"
        style={{
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          transform: "rotate(45deg)", // rotated square
        }}
      ></div>
    );
  }

  if (shape === "rectangle") {
    return (
      <div
        className="absolute bg-blue-500"
        style={{
          left: x - size,
          top: y - size / 3,
          width: size * 2, // wider than tall
          height: size / 1.5,
        }}
      ></div>
    );
  }

  // Default square
  return (
    <div
      className="absolute bg-red-500 rounded-md"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
    ></div>
  );
}
