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

  const [extremeMode, setExtremeMode] = useState(false);
  const [lastExtremeScore, setLastExtremeScore] = useState(0);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCountdown, setTutorialCountdown] = useState(3); // ⬅ countdown state

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

  // Tutorial countdown effect
  useEffect(() => {
    if (showTutorial) {
      setTutorialCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setTutorialCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          setShowTutorial(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTutorial]);

  // Game loop
  useEffect(() => {
    if (!running || showTutorial) return;

    let animationFrame: number;
    let lastTime = performance.now();
    let timeElapsed = 0;

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      timeElapsed += delta * 0.001;
      setScore((s) => s + delta * 0.001);

      const scoreFloor = Math.floor(score);

      // Trigger soft extreme mode every multiple of 20
      if (
        !extremeMode &&
        scoreFloor % 20 === 0 &&
        scoreFloor > 0 &&
        scoreFloor !== lastExtremeScore
      ) {
        setExtremeMode(true);
        setLastExtremeScore(scoreFloor);
        setTimeout(() => setExtremeMode(false), 5000);
      }

      // Spawn chance
      const spawnChance = extremeMode
        ? 0.08
        : Math.min(0.02 + timeElapsed * 0.005, 0.3);

      if (Math.random() < spawnChance) {
        const shapes: ObstacleType["shape"][] = [
          "square",
          "rectangle",
          "triangle",
          "diamond",
        ];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const obstacleCount = extremeMode ? 2 : Math.random() < 0.3 ? 2 : 1;

        setObstacles((obs) => [
          ...obs,
          ...Array.from({ length: obstacleCount }).map(() => ({
            id: Date.now() + Math.random(),
            x: Math.random() * gameWidth,
            y: -20,
            size: 15 + Math.random() * 25,
            speed:
              2 +
              Math.random() * 3 +
              timeElapsed * 0.05 +
              (extremeMode ? 0.5 : 0),
            shape: randomShape,
          })),
        ]);
      }

      // Move obstacles
      setObstacles((obs) =>
        obs
          .map((o) => ({
            ...o,
            speed: o.speed + timeElapsed * 0.008,
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
  }, [
    running,
    playerPos,
    obstacles,
    score,
    gameWidth,
    gameHeight,
    extremeMode,
    lastExtremeScore,
    showTutorial,
  ]);

  // Player movement
  const handleMove = (x: number, y: number) => {
    const clampedX = Math.max(20, Math.min(x, gameWidth - 20));
    const clampedY = Math.max(20, Math.min(y, gameHeight - 20));
    setPlayerPos({ x: clampedX, y: clampedY });
  };

  const handleTouch = (e: React.TouchEvent) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleMouse = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    handleMove(e.clientX - rect.left, e.clientY - rect.top);
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
                setScore(0);
                setObstacles([]);
                setRunning(true);
                setShowTutorial(true); // show tutorial
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

      {/* Tutorial Screen */}
      {showTutorial && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
          <p className="text-2xl font-bold text-blue-400 animate-pulse mb-6">
            Move the ball to dodge obstacles!
          </p>

          {/* Show ball at start position */}
          <div
            className="absolute bg-pink-500 rounded-full shadow-[0_0_15px_rgba(255,0,255,0.8)]"
            style={{
              left: playerPos.x - 20,
              top: playerPos.y - 20,
              width: 20,
              height: 20,
            }}
          ></div>

          {/* Countdown text */}
          <p className="text-6xl font-bold text-pink-400 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
            {tutorialCountdown > 0 ? tutorialCountdown : "GO!"}
          </p>
        </div>
      )}


      {/* Game Over Screen */}
      {!running && !showStart && !showTutorial && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-white text-xl">
          <p>Game Over</p>
          <p className="mt-2">Score: {Math.floor(score)}</p>
          <button
            onClick={() => {
              setScore(0);
              setObstacles([]);
              setRunning(true);
              setExtremeMode(false);
              setLastExtremeScore(0);
              setShowTutorial(true);
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
