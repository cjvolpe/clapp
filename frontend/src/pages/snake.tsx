import {useCallback, useEffect, useRef, useState} from "react";
import "./styles/snake.css";

const BOARD_SIZE = 20;
const CELL_SIZE = 20;
const TICK_MS = 110;
const HIGH_SCORE_KEY = "clapp.snake.highScore";

type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

const DIRECTION_VECTORS: Record<Direction, Point> = {
    up: {x: 0, y: -1},
    down: {x: 0, y: 1},
    left: {x: -1, y: 0},
    right: {x: 1, y: 0},
};

const OPPOSITES: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
};

const INITIAL_SNAKE: Point[] = [
    {x: 10, y: 10},
    {x: 9, y: 10},
    {x: 8, y: 10},
];

function randomFoodPosition(snake: Point[]): Point {
    while (true) {
        const candidate = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
        };
        if (!snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y)) {
            return candidate;
        }
    }
}

function readStoredHighScore(): number {
    if (typeof window === "undefined") return 0;
    const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
    if (!stored) return 0;
    const parsed = parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export default function Snake() {
    const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Direction>("right");
    const [food, setFood] = useState<Point>(() => randomFoodPosition(INITIAL_SNAKE));
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState<number>(readStoredHighScore);
    const [gameOver, setGameOver] = useState(false);
    const [paused, setPaused] = useState(false);

    const pendingDirectionRef = useRef<Direction>("right");
    const directionRef = useRef<Direction>("right");

    const resetGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setFood(randomFoodPosition(INITIAL_SNAKE));
        setDirection("right");
        directionRef.current = "right";
        pendingDirectionRef.current = "right";
        setScore(0);
        setGameOver(false);
        setPaused(false);
    }, []);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            const key = event.key;
            let next: Direction | null = null;
            if (key === "ArrowUp" || key === "w" || key === "W") next = "up";
            else if (key === "ArrowDown" || key === "s" || key === "S") next = "down";
            else if (key === "ArrowLeft" || key === "a" || key === "A") next = "left";
            else if (key === "ArrowRight" || key === "d" || key === "D") next = "right";

            if (next) {
                event.preventDefault();
                if (next !== OPPOSITES[directionRef.current]) {
                    pendingDirectionRef.current = next;
                }
                return;
            }

            if (key === " " || key === "Enter") {
                event.preventDefault();
                if (gameOver) {
                    resetGame();
                } else {
                    setPaused((p) => !p);
                }
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameOver, resetGame]);

    useEffect(() => {
        if (gameOver || paused) return;
        const interval = window.setInterval(() => {
            setSnake((prev) => {
                const nextDirection = pendingDirectionRef.current;
                directionRef.current = nextDirection;
                setDirection(nextDirection);

                const vector = DIRECTION_VECTORS[nextDirection];
                const head = prev[0];
                const newHead: Point = {x: head.x + vector.x, y: head.y + vector.y};

                if (
                    newHead.x < 0 ||
                    newHead.x >= BOARD_SIZE ||
                    newHead.y < 0 ||
                    newHead.y >= BOARD_SIZE
                ) {
                    setGameOver(true);
                    return prev;
                }

                const ateFood = newHead.x === food.x && newHead.y === food.y;
                const body = ateFood ? prev : prev.slice(0, -1);

                if (body.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
                    setGameOver(true);
                    return prev;
                }

                const nextSnake = [newHead, ...body];

                if (ateFood) {
                    setFood(randomFoodPosition(nextSnake));
                    setScore((s) => {
                        const next = s + 1;
                        setHighScore((hs) => {
                            if (next > hs) {
                                window.localStorage.setItem(HIGH_SCORE_KEY, String(next));
                                return next;
                            }
                            return hs;
                        });
                        return next;
                    });
                }

                return nextSnake;
            });
        }, TICK_MS);
        return () => window.clearInterval(interval);
    }, [food, gameOver, paused]);

    const boardPixelSize = BOARD_SIZE * CELL_SIZE;

    return (
        <div className="snake-page">
            <h1 className="snake-title">Snake</h1>
            <div className="snake-scoreboard">
                <span>Score: {score}</span>
                <span>High Score: {highScore}</span>
            </div>
            <div
                className="snake-board"
                style={{width: boardPixelSize, height: boardPixelSize}}
                role="grid"
                aria-label="Snake game board"
            >
                {snake.map((segment, index) => (
                    <div
                        key={`${segment.x}-${segment.y}-${index}`}
                        className={`snake-segment${index === 0 ? " snake-head" : ""}`}
                        style={{
                            left: segment.x * CELL_SIZE,
                            top: segment.y * CELL_SIZE,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                        }}
                    />
                ))}
                <div
                    className="snake-food"
                    style={{
                        left: food.x * CELL_SIZE,
                        top: food.y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                    }}
                />
                {(gameOver || paused) && (
                    <div className="snake-overlay">
                        {gameOver ? (
                            <>
                                <div className="snake-overlay-title">Game Over</div>
                                <div className="snake-overlay-sub">Press Enter to play again</div>
                            </>
                        ) : (
                            <>
                                <div className="snake-overlay-title">Paused</div>
                                <div className="snake-overlay-sub">Press Space to resume</div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <div className="snake-controls">
                <button onClick={resetGame}>Restart</button>
                <button
                    onClick={() => setPaused((p) => !p)}
                    disabled={gameOver}
                >
                    {paused ? "Resume" : "Pause"}
                </button>
            </div>
            <p className="snake-hint">
                Arrow keys or WASD to move · Space to pause · Direction: {direction}
            </p>
        </div>
    );
}
