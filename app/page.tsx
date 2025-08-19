"use client";

import React, { useEffect, useRef, useState } from "react";
import Dot from "@/components/Dot";
import Obstacle from "@/components/Obstacle";
import ScoreBoard from "@/components/ScoreBoard";

interface Position {
  x: number;
  y: number;
}

interface ObstacleType {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  shape: "square" | "rectangle" | "triangle" | "diamond";
}

export default function Home() {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 150, y: 400 });
  const [obstacles, setObstacles] = useState<ObstacleType[]>([]);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showStart, setShowStart] = useState(true);

  const [gameWidth, setGameWidth] = useState(400);
  const [gameHeight, setGameHeight] = useState(800);

  // Update game area dimensions dynamically
  useEffect(() => {
    const updateSize = () => {
      if (gameAreaRef.current) {
        setGameWidth(gameAreaRef.current.clientWidth);
        setGameHeight(gameAreaRef.current.clientHeight);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Game loop
  useEffect(() => {
    if (!running) return;

    let animationFrame: number;
    let lastTime = performance.now();
    let timeElapsed = 0;

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      timeElapsed += delta * 0.001; // seconds survived
      setScore((s) => s + delta * 0.001);

      // Dynamic difficulty: spawn rate increases over time
      const spawnChance = Math.min(0.02 + timeElapsed * 0.005, 0.3); // max 30% chance

      if (Math.random() < spawnChance) {
        const shapes: ObstacleType["shape"][] = ["square", "rectangle", "triangle", "diamond"];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

        // Sometimes spawn multiple obstacles at once
        const obstacleCount = Math.random() < 0.3 ? 2 : 1;

        setObstacles((obs) => [
          ...obs,
          ...Array.from({ length: obstacleCount }).map(() => ({
            id: Date.now() + Math.random(),
            x: Math.random() * gameWidth,
            y: -20,
            size: 15 + Math.random() * 25, // more size variation
            speed: 2 + Math.random() * 3 + timeElapsed * 0.05, // faster increase
            shape: randomShape,
          })),
        ]);
      }

      // Move obstacles & increase speed gradually
      setObstacles((obs) =>
        obs
          .map((o) => ({
            ...o,
            speed: o.speed + timeElapsed * 0.01, // continuous speed increase
            y: o.y + o.speed,
          }))
          .filter((o) => o.y < gameHeight)
      );

      // Collision detection
      obstacles.forEach((o) => {
        const dx = playerPos.x - o.x;
        const dy = playerPos.y - o.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 20 + o.size / 2) {
          setRunning(false);
          setHighScore((h) => Math.max(h, Math.floor(score)));
        }
      });

      animationFrame = requestAnimationFrame(loop);
    };

    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [running, playerPos, obstacles, score, gameWidth, gameHeight]);


  // Handle touch / mouse drag
  const handleMove = (x: number, y: number) => {
    setPlayerPos({ x, y });
  };

  const handleTouch = (e: React.TouchEvent) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleMouse = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      handleMove(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  return (
    <div
      ref={gameAreaRef}
      onTouchMove={handleTouch}
      onMouseMove={handleMouse}
      className="relative w-full max-w-md h-[80vh] bg-gradient-to-b from-gray-900 to-black overflow-hidden rounded-2xl mx-auto mt-5 touch-none"
    >
      <ScoreBoard score={Math.floor(score)} highScore={highScore} />
      <Dot x={playerPos.x} y={playerPos.y} />
      {obstacles.map((o) => (
        <Obstacle key={o.id} x={o.x} y={o.y} size={o.size} shape={o.shape} />
      ))}

      {/* Start Screen */}
      {showStart && (
        <div className="absolute inset-0 bg-black/80 text-white text-2xl">
          <div className="flex flex-col justify-center items-center h-full">
            <p className="mb-10 font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] text-4xl">
              Neon Drift
            </p>
            <button
              onClick={() => {
                setShowStart(false);
                setRunning(true);
                setScore(0);
                setObstacles([]);
              }}
              className="px-6 py-3 bg-green-500 rounded-xl text-lg"
            >
              Start Game
            </button>
          </div>
          <footer className="absolute bottom-2 w-full text-center text-white text-sm">
            Made by Nimash Mendis
          </footer>
        </div>
      )}

      {/* Game Over Screen */}
      {!running && !showStart && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-white text-xl">
          <p>Game Over</p>
          <p className="mt-2">Score: {Math.floor(score)}</p>
          <button
            onClick={() => {
              setScore(0);
              setObstacles([]);
              setRunning(true);
            }}
            className="mt-4 px-4 py-2 bg-green-500 rounded-xl"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
