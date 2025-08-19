import React from "react";

export default function ScoreBoard({
  score,
  highScore,
}: {
  score: number;
  highScore: number;
}) {
  return (
    <div className="absolute top-2 left-2 text-white text-lg font-bold">
      <p>Score: {score}</p>
      <p>High: {highScore}</p>
    </div>
  );
}
