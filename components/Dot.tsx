import React, { useEffect, useState } from "react";

export default function Dot({ x, y }: { x: number; y: number }) {
  const neonColors = ["#0ff", "#ff0", "#f0f", "#0f0", "#ff4500", "#00f"];
  const [color, setColor] = useState(neonColors[0]);

  // Change color every 3000ms
  useEffect(() => {
    const interval = setInterval(() => {
      const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
      setColor(randomColor);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: x - 20,
        top: y - 20,
        width: 20,
        height: 20,
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
      }}
    ></div>
  );
}
