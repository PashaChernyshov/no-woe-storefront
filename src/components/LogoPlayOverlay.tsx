"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type GameId = "flappy" | "dino" | "snake" | "memory";

type LogoPlayOverlayProps = {
  game: GameId;
  onClose: () => void;
};

type Phase = "intro" | "countdown" | "playing" | "closing";

type BoardSize = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type Pipe = {
  x: number;
  gapY: number;
  passed: boolean;
};

type FlappyState = {
  birdY: number;
  velocity: number;
  score: number;
  pipes: Pipe[];
};

type DinoObstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
};

type DinoState = {
  playerY: number;
  velocity: number;
  score: number;
  jumpsLeft: number;
  obstacles: DinoObstacle[];
};

type SnakeState = {
  snake: Point[];
  direction: Point;
  nextDirection: Point;
  food: Point;
  score: number;
};

type MemoryCard = {
  id: number;
  pairId: number;
  shape: "circle" | "diamond" | "star" | "ring";
  color: string;
};

type MemoryState = {
  cards: MemoryCard[];
  flipped: number[];
  matched: number[];
  locked: boolean;
};

const LOGO_SRC = "/products/play/logo.jpg";
const FLAPPY_GROUND = 56;
const SNAKE_GRID = 12;
const MEMORY_ICONS: Array<Pick<MemoryCard, "pairId" | "shape" | "color">> = [
  { pairId: 1, shape: "circle", color: "#ff5f5f" },
  { pairId: 2, shape: "diamond", color: "#44c8ff" },
  { pairId: 3, shape: "star", color: "#ffc940" },
  { pairId: 4, shape: "ring", color: "#75eb68" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function getRule(game: GameId, isTouchDevice: boolean) {
  switch (game) {
    case "flappy":
      return isTouchDevice ? "На телефоне тапай по экрану." : "На компьютере жми пробел или Tab.";
    case "dino":
      return isTouchDevice ? "На телефоне тапай по экрану. Есть двойной прыжок." : "На компьютере жми пробел или Tab. Есть двойной прыжок.";
    case "snake":
      return isTouchDevice ? "На телефоне нажимай по сторонам экрана." : "На компьютере используй WASD или стрелки.";
    case "memory":
    default:
      return isTouchDevice ? "На телефоне открывай пары тапом." : "На компьютере открывай пары кликом.";
  }
}

function getTitle(game: GameId) {
  switch (game) {
    case "flappy":
      return "Flappy";
    case "dino":
      return "Dino";
    case "snake":
      return "Змейка";
    case "memory":
    default:
      return "Память";
  }
}

function createFlappyState(board: BoardSize): FlappyState {
  const spacing = clamp(board.width * 0.64, 230, 320);
  const startX = board.width + 120;
  const gap = clamp(board.height * 0.34, 160, 230);

  return {
    birdY: board.height * 0.42,
    velocity: 0,
    score: 0,
    pipes: Array.from({ length: 3 }, (_, index) => ({
      x: startX + index * spacing,
      gapY: randomBetween(70, Math.max(90, board.height - FLAPPY_GROUND - gap - 70)),
      passed: false,
    })),
  };
}

function createDinoState(board: BoardSize): DinoState {
  return {
    playerY: 0,
    velocity: 0,
    score: 0,
    jumpsLeft: 2,
    obstacles: [
      { id: 1, x: board.width + 140, width: 28, height: 48 },
      { id: 2, x: board.width + 280, width: 28, height: 44 },
      { id: 3, x: board.width + 540, width: 34, height: 58 },
    ],
  };
}

function nextDinoObstacle(previousX: number, boardWidth: number, streak: number) {
  const allowTight = streak < 2 && Math.random() > 0.52;
  const spacing = allowTight ? randomBetween(126, 150) : randomBetween(220, 320);
  const width = Math.random() > 0.7 ? 34 : 28;
  const height = allowTight ? randomInt(42, 52) : randomInt(48, 62);

  return {
    obstacle: {
      id: Math.floor(Math.random() * 1_000_000),
      x: previousX + Math.max(spacing, boardWidth * 0.18),
      width,
      height,
    },
    streak: allowTight ? streak + 1 : 0,
  };
}

function createFood(snake: Point[]) {
  while (true) {
    const point = {
      x: Math.floor(Math.random() * SNAKE_GRID),
      y: Math.floor(Math.random() * SNAKE_GRID),
    };

    if (!snake.some((segment) => segment.x === point.x && segment.y === point.y)) {
      return point;
    }
  }
}

function createSnakeState(): SnakeState {
  const snake = [
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ];

  return {
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: createFood(snake),
    score: 0,
  };
}

function createMemoryState(): MemoryState {
  const cards = MEMORY_ICONS.flatMap((item, index) => [
    { ...item, id: index * 2 + 1 },
    { ...item, id: index * 2 + 2 },
  ]);

  for (let index = cards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[swapIndex]] = [cards[swapIndex], cards[index]];
  }

  return {
    cards,
    flipped: [],
    matched: [],
    locked: false,
  };
}

function LogoToken({ size, style, className = "" }: { size: number; style?: CSSProperties; className?: string }) {
  return (
    <div
      className={`mini-play-logo ${className}`.trim()}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${LOGO_SRC})`,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

function MemorySymbol({ shape, color }: Pick<MemoryCard, "shape" | "color">) {
  return <span className={`mini-memory-symbol ${shape}`} style={{ "--symbol-color": color } as CSSProperties} aria-hidden="true" />;
}

export default function LogoPlayOverlay({ game, onClose }: LogoPlayOverlayProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<number | null>(null);
  const snakeRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const memoryTimerRef = useRef<number | null>(null);
  const dinoTightSeriesRef = useRef(0);
  const [boardSize, setBoardSize] = useState<BoardSize>({ width: 360, height: 460 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [flappy, setFlappy] = useState<FlappyState>(() => createFlappyState({ width: 360, height: 460 }));
  const [dino, setDino] = useState<DinoState>(() => createDinoState({ width: 360, height: 460 }));
  const [snake, setSnake] = useState<SnakeState>(() => createSnakeState());
  const [memory, setMemory] = useState<MemoryState>(() => createMemoryState());

  const closeAfterFinish = useCallback(() => {
    setPhase((current) => (current === "closing" ? current : "closing"));

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => onClose(), 260);
  }, [onClose]);

  const resetGameState = useCallback(() => {
    if (game === "flappy") {
      setFlappy(createFlappyState(boardSize));
    }

    if (game === "dino") {
      dinoTightSeriesRef.current = 0;
      setDino(createDinoState(boardSize));
    }

    if (game === "snake") {
      setSnake(createSnakeState());
    }

    if (game === "memory") {
      setMemory(createMemoryState());
    }
  }, [boardSize, game]);

  const startCountdown = useCallback(() => {
    resetGameState();
    setCountdown(3);
    setPhase("countdown");
  }, [resetGameState]);

  const flap = useCallback(() => {
    setFlappy((current) => ({
      ...current,
      velocity: -320,
    }));
  }, []);

  const jump = useCallback(() => {
    setDino((current) => {
      if (current.jumpsLeft <= 0) {
        return current;
      }

      return {
        ...current,
        velocity: current.playerY > 0 ? 400 : 440,
        jumpsLeft: current.jumpsLeft - 1,
      };
    });
  }, []);

  const handleSnakeMove = useCallback((direction: Point) => {
    setSnake((current) => {
      if (direction.x !== 0 && current.direction.x === direction.x * -1) {
        return current;
      }

      if (direction.y !== 0 && current.direction.y === direction.y * -1) {
        return current;
      }

      return {
        ...current,
        nextDirection: direction,
      };
    });
  }, []);

  useEffect(() => {
    document.body.classList.add("play-overlay-open");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const media = window.matchMedia("(pointer: coarse)");
    const syncTouch = () => setIsTouchDevice(media.matches || window.innerWidth <= 720);
    syncTouch();
    media.addEventListener("change", syncTouch);
    window.addEventListener("resize", syncTouch);

    return () => {
      document.body.classList.remove("play-overlay-open");
      document.body.style.overflow = previousOverflow;
      media.removeEventListener("change", syncTouch);
      window.removeEventListener("resize", syncTouch);
      if (engineRef.current) {
        window.clearInterval(engineRef.current);
      }
      if (snakeRef.current) {
        window.clearInterval(snakeRef.current);
      }
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (memoryTimerRef.current) {
        window.clearTimeout(memoryTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setBoardSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    countdownRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
          }
          setPhase("playing");
          return 1;
        }

        return current - 1;
      });
    }, 700);

    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || game !== "flappy") {
      return;
    }

    const birdSize = clamp(boardSize.width * 0.12, 38, 58);
    const pipeWidth = clamp(boardSize.width * 0.14, 46, 66);
    const gap = clamp(boardSize.height * 0.34, 160, 230);
    const birdX = boardSize.width * 0.24;
    const speed = clamp(boardSize.width * 0.38, 130, 185);

    engineRef.current = window.setInterval(() => {
      setFlappy((current) => {
        const dt = 0.016;
        const velocity = current.velocity + 760 * dt;
        const birdY = current.birdY + velocity * dt;
        const moved = current.pipes.map((pipe) => ({ ...pipe, x: pipe.x - speed * dt }));
        let farthest = Math.max(...moved.map((pipe) => pipe.x));
        let score = current.score;
        const groundTop = boardSize.height - FLAPPY_GROUND;
        let crashed = birdY <= 0 || birdY + birdSize >= groundTop;

        const pipes = moved.map((pipe) => {
          let next = pipe;

          if (!next.passed && next.x + pipeWidth < birdX) {
            score += 1;
            next = { ...next, passed: true };
          }

          if (
            birdX + birdSize > next.x &&
            birdX < next.x + pipeWidth &&
            (birdY < next.gapY || birdY + birdSize > next.gapY + gap)
          ) {
            crashed = true;
          }

          if (next.x + pipeWidth < -30) {
            farthest += clamp(boardSize.width * 0.66, 230, 320);
            return {
              x: farthest,
              gapY: randomBetween(70, Math.max(90, boardSize.height - FLAPPY_GROUND - gap - 70)),
              passed: false,
            };
          }

          return next;
        });

        if (crashed) {
          closeAfterFinish();
        }

        return {
          birdY: clamp(birdY, 0, Math.max(0, boardSize.height - FLAPPY_GROUND - birdSize)),
          velocity,
          score,
          pipes,
        };
      });
    }, 16);

    return () => {
      if (engineRef.current) {
        window.clearInterval(engineRef.current);
      }
    };
  }, [boardSize.height, boardSize.width, closeAfterFinish, game, phase]);

  useEffect(() => {
    if (phase !== "playing" || game !== "dino") {
      return;
    }

    const playerSize = 48;
    const playerX = boardSize.width * 0.18;
    const speed = clamp(boardSize.width * 0.54, 180, 230);

    engineRef.current = window.setInterval(() => {
      setDino((current) => {
        const dt = 0.016;
        const velocity = current.velocity - 980 * dt;
        const playerY = Math.max(0, current.playerY + velocity * dt);
        let crashed = false;
        let farthest = Math.max(...current.obstacles.map((obstacle) => obstacle.x));

        const obstacles = current.obstacles.map((obstacle) => {
          const moved = {
            ...obstacle,
            x: obstacle.x - speed * dt,
          };

          if (playerX + playerSize > moved.x && playerX < moved.x + moved.width && playerY < moved.height - 6) {
            crashed = true;
          }

          if (moved.x + moved.width < -24) {
            farthest = Math.max(farthest, moved.x);
            const next = nextDinoObstacle(farthest, boardSize.width, dinoTightSeriesRef.current);
            dinoTightSeriesRef.current = next.streak;
            return next.obstacle;
          }

          farthest = Math.max(farthest, moved.x);
          return moved;
        });

        if (crashed) {
          closeAfterFinish();
        }

        return {
          playerY,
          velocity: playerY <= 0 && velocity < 0 ? 0 : velocity,
          score: current.score + dt * 11,
          jumpsLeft: playerY <= 0 ? 2 : current.jumpsLeft,
          obstacles,
        };
      });
    }, 16);

    return () => {
      if (engineRef.current) {
        window.clearInterval(engineRef.current);
      }
    };
  }, [boardSize.width, closeAfterFinish, game, phase]);

  useEffect(() => {
    if (phase !== "playing" || game !== "snake") {
      return;
    }

    snakeRef.current = window.setInterval(() => {
      setSnake((current) => {
        const head = current.snake[0];
        const direction = current.nextDirection;
        const nextHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };
        const wrappedHead = {
          x: (nextHead.x + SNAKE_GRID) % SNAKE_GRID,
          y: (nextHead.y + SNAKE_GRID) % SNAKE_GRID,
        };
        const hitSelf = current.snake.some((segment) => segment.x === wrappedHead.x && segment.y === wrappedHead.y);

        if (hitSelf) {
          closeAfterFinish();
          return current;
        }

        const ateFood = wrappedHead.x === current.food.x && wrappedHead.y === current.food.y;
        const nextSnake = [wrappedHead, ...current.snake];

        if (!ateFood) {
          nextSnake.pop();
        }

        return {
          snake: nextSnake,
          direction,
          nextDirection: direction,
          food: ateFood ? createFood(nextSnake) : current.food,
          score: ateFood ? current.score + 1 : current.score,
        };
      });
    }, 170);

    return () => {
      if (snakeRef.current) {
        window.clearInterval(snakeRef.current);
      }
    };
  }, [closeAfterFinish, game, phase]);

  useEffect(() => {
    if (memory.matched.length !== memory.cards.length || memory.cards.length === 0) {
      return;
    }

    memoryTimerRef.current = window.setTimeout(() => closeAfterFinish(), 260);
    return () => {
      if (memoryTimerRef.current) {
        window.clearTimeout(memoryTimerRef.current);
      }
    };
  }, [closeAfterFinish, memory.cards.length, memory.matched.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (phase === "intro" && (event.key === " " || event.key === "Tab")) {
        event.preventDefault();
        startCountdown();
        return;
      }

      if (phase !== "playing") {
        return;
      }

      if (game === "flappy" && (event.key === " " || event.key === "Tab" || event.key === "ArrowUp")) {
        event.preventDefault();
        flap();
      }

      if (game === "dino" && (event.key === " " || event.key === "Tab" || event.key === "ArrowUp")) {
        event.preventDefault();
        jump();
      }

      if (game === "snake") {
        if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
          event.preventDefault();
          handleSnakeMove({ x: 0, y: -1 });
        }
        if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
          event.preventDefault();
          handleSnakeMove({ x: 0, y: 1 });
        }
        if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
          event.preventDefault();
          handleSnakeMove({ x: -1, y: 0 });
        }
        if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
          event.preventDefault();
          handleSnakeMove({ x: 1, y: 0 });
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flap, game, handleSnakeMove, jump, onClose, phase, startCountdown]);

  const handlePrimaryTap = () => {
    if (phase === "intro") {
      startCountdown();
      return;
    }

    if (phase !== "playing") {
      return;
    }

    if (game === "flappy") {
      flap();
    }

    if (game === "dino") {
      jump();
    }
  };

  const handleSnakeTap = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isTouchDevice || phase !== "playing") {
      return;
    }

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - bounds.left;
    const localY = event.clientY - bounds.top;
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    const offsetX = localX - halfWidth;
    const offsetY = localY - halfHeight;

    if (Math.abs(offsetX) > Math.abs(offsetY)) {
      handleSnakeMove(offsetX >= 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      return;
    }

    handleSnakeMove(offsetY >= 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  };

  const handleMemoryCard = (cardId: number) => {
    if (phase !== "playing") {
      return;
    }

    setMemory((current) => {
      if (current.locked || current.matched.includes(cardId) || current.flipped.includes(cardId)) {
        return current;
      }

      const flipped = [...current.flipped, cardId];
      if (flipped.length < 2) {
        return {
          ...current,
          flipped,
        };
      }

      const first = current.cards.find((card) => card.id === flipped[0]);
      const second = current.cards.find((card) => card.id === flipped[1]);

      if (!first || !second) {
        return current;
      }

      if (first.pairId === second.pairId) {
        return {
          ...current,
          flipped: [],
          matched: [...current.matched, first.id, second.id],
        };
      }

      window.setTimeout(() => {
        setMemory((state) => ({
          ...state,
          flipped: [],
          locked: false,
        }));
      }, 460);

      return {
        ...current,
        flipped,
        locked: true,
      };
    });
  };

  if (typeof document === "undefined") {
    return null;
  }

  const title = getTitle(game);
  const rule = getRule(game, isTouchDevice);
  const flappyBirdSize = clamp(boardSize.width * 0.12, 38, 58);
  const flappyPipeWidth = clamp(boardSize.width * 0.14, 46, 66);
  const flappyGap = clamp(boardSize.height * 0.34, 160, 230);

  return createPortal(
    <div className={`mini-play-overlay ${phase === "closing" ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Мини-игра NO WOE">
      <div className="mini-play-backdrop" onClick={onClose} />
      <div className="mini-play-dialog">
        <button type="button" className="mini-play-close" onClick={onClose} aria-label="Закрыть мини-игру">
          <span className="mini-play-close-lines" aria-hidden="true" />
        </button>

        <div ref={stageRef} className="mini-play-stage-shell">
          {phase === "intro" ? (
            <button type="button" className="mini-play-intro" onClick={startCountdown} aria-label="Начать игру">
              <LogoToken size={84} className="mini-play-intro-logo" />
              <h2>{title}</h2>
              <p>{rule}</p>
              <span>{isTouchDevice ? "Нажми на экран" : "Пробел или Tab"}</span>
            </button>
          ) : null}

          {phase === "countdown" ? <div className="mini-play-countdown">{countdown}</div> : null}

          {game === "flappy" && phase !== "intro" ? (
            <div className="mini-play-stage mini-play-flappy" onPointerDown={handlePrimaryTap}>
              <div className="mini-play-score">{flappy.score}</div>
              {flappy.pipes.map((pipe, index) => (
                <div key={`${index}-${Math.round(pipe.x)}`}>
                  <div className="mini-play-pipe mini-play-pipe-top" style={{ left: pipe.x, width: flappyPipeWidth, top: 0, height: pipe.gapY }} />
                  <div
                    className="mini-play-pipe mini-play-pipe-bottom"
                    style={{
                      left: pipe.x,
                      width: flappyPipeWidth,
                      top: pipe.gapY + flappyGap,
                      height: Math.max(0, boardSize.height - FLAPPY_GROUND - pipe.gapY - flappyGap),
                    }}
                  />
                </div>
              ))}
              <LogoToken size={flappyBirdSize} style={{ left: boardSize.width * 0.24, top: flappy.birdY }} />
              <div className="mini-play-flappy-ground" />
            </div>
          ) : null}

          {game === "dino" && phase !== "intro" ? (
            <div className="mini-play-stage mini-play-dino" onPointerDown={handlePrimaryTap}>
              <div className="mini-play-score">{Math.floor(dino.score)}</div>
              <div className="mini-play-jumps">{dino.jumpsLeft}</div>
              <div className="mini-play-ground" />
              {dino.obstacles.map((obstacle) => (
                <div
                  key={obstacle.id}
                  className="mini-play-dino-obstacle"
                  style={{ left: obstacle.x, width: obstacle.width, height: obstacle.height, bottom: 52 }}
                />
              ))}
              <LogoToken size={48} style={{ left: boardSize.width * 0.18, bottom: 52 + dino.playerY }} />
            </div>
          ) : null}

          {game === "snake" && phase !== "intro" ? (
            <div className="mini-play-stage mini-play-snake" onPointerDown={handleSnakeTap}>
              <div className="mini-play-score">{snake.score}</div>
              <div className="mini-snake-grid">
                {Array.from({ length: SNAKE_GRID * SNAKE_GRID }, (_, index) => {
                  const x = index % SNAKE_GRID;
                  const y = Math.floor(index / SNAKE_GRID);
                  const isFood = snake.food.x === x && snake.food.y === y;
                  const bodyIndex = snake.snake.findIndex((segment) => segment.x === x && segment.y === y);

                  if (bodyIndex === 0) {
                    return (
                      <div key={`${x}-${y}`} className="mini-snake-cell is-head">
                        <LogoToken size={24} className="mini-snake-head-logo" />
                      </div>
                    );
                  }

                  if (bodyIndex > 0) {
                    return <div key={`${x}-${y}`} className="mini-snake-cell is-body" />;
                  }

                  if (isFood) {
                    return <div key={`${x}-${y}`} className="mini-snake-cell is-food" />;
                  }

                  return <div key={`${x}-${y}`} className="mini-snake-cell" />;
                })}
              </div>
            </div>
          ) : null}

          {game === "memory" && phase !== "intro" ? (
            <div className="mini-play-stage mini-play-memory">
              <div className="mini-play-score">{memory.matched.length / 2}</div>
              <div className="mini-memory-grid">
                {memory.cards.map((card) => {
                  const open = memory.flipped.includes(card.id) || memory.matched.includes(card.id);
                  return (
                    <button key={card.id} type="button" className={`mini-memory-card ${open ? "is-open" : ""}`} onClick={() => handleMemoryCard(card.id)}>
                      <span className="mini-memory-face mini-memory-back">
                        <LogoToken size={34} className="mini-memory-logo" />
                      </span>
                      <span className="mini-memory-face mini-memory-front">
                        <MemorySymbol shape={card.shape} color={card.color} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}





