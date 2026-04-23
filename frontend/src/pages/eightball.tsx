import {useCallback, useEffect, useRef, useState} from "react";
import HomeRow from "../components/HomeRow.tsx";
import "./styles/eightball.css";

const ANSWERS: string[] = [
    "Send it, champ.",
    "That project? All yours this session.",
    "Absolutely — crimp with confidence.",
    "Flash incoming.",
    "Your beta is flawless.",
    "Trust the feet.",
    "Chalk up and commit.",
    "Stars are aligned for a send.",
    "Hmm, take a longer rest first.",
    "Ask your belayer.",
    "The holds are spinning... try again.",
    "Signs point to a heel hook.",
    "Maybe next burn.",
    "Not today, flapper city.",
    "Better chalk up and retry.",
    "Skin says no. Listen to skin.",
    "Only if you warm up properly.",
    "Doubtful — the crux looks spicy.",
    "Route setter says lol no.",
    "Core engaged? Then yes."
];

const ENCOURAGEMENTS: string[] = [
    "You got this!",
    "Crush it.",
    "Strong like gastone.",
    "Climb on!"
];

function pickAnswer(): string {
    return ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
}

function pickEncouragement(): string {
    return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export default function EightBall() {
    const [question, setQuestion] = useState<string>("");
    const [answer, setAnswer] = useState<string>("Ask a climbing question...");
    const [shaking, setShaking] = useState<boolean>(false);
    const [revealing, setRevealing] = useState<boolean>(false);
    const [shakeCount, setShakeCount] = useState<number>(0);
    const lastShakeRef = useRef<number>(0);
    const lastMotionRef = useRef<{x: number; y: number; z: number} | null>(null);

    const roll = useCallback(() => {
        if (shaking) return;
        setShaking(true);
        setRevealing(false);
        const nextAnswer = pickAnswer();
        setTimeout(() => {
            setAnswer(nextAnswer);
            setShaking(false);
            setRevealing(true);
        }, 900);
    }, [shaking]);

    useEffect(() => {
        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
            const current = {x: acc.x, y: acc.y, z: acc.z};
            const prev = lastMotionRef.current;
            lastMotionRef.current = current;
            if (!prev) return;
            const delta =
                Math.abs(current.x - prev.x) +
                Math.abs(current.y - prev.y) +
                Math.abs(current.z - prev.z);
            const now = Date.now();
            if (delta > 25 && now - lastShakeRef.current > 1200) {
                lastShakeRef.current = now;
                setShakeCount((c) => c + 1);
                roll();
            }
        };
        window.addEventListener("devicemotion", handleMotion);
        return () => window.removeEventListener("devicemotion", handleMotion);
    }, [roll]);

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        roll();
    };

    const requestMotionPermission = async () => {
        type MotionPermissionCtor = {
            requestPermission?: () => Promise<"granted" | "denied">;
        };
        const ctor = (window as unknown as {DeviceMotionEvent?: MotionPermissionCtor}).DeviceMotionEvent;
        if (ctor && typeof ctor.requestPermission === "function") {
            try {
                await ctor.requestPermission();
            } catch {
                // user declined or unavailable
            }
        }
    };

    return (
        <>
            <div className="eightball-page">
                <h1 className="eightball-title">Climbing Magic 8-Ball</h1>
                <p className="eightball-subtitle">
                    {pickEncouragement()} Ask the ball about your next send.
                </p>

                <div
                    className={`eightball ${shaking ? "shaking" : ""}`}
                    onClick={roll}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") roll();
                    }}
                    aria-label="Shake the magic 8-ball"
                >
                    <div className="eightball-inner">
                        <div className="eightball-window">
                            <div className={`eightball-triangle ${revealing ? "revealed" : ""} ${shaking ? "hidden" : ""}`}>
                                <span className="eightball-answer">{answer}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form className="eightball-form" onSubmit={onSubmit}>
                    <input
                        type="text"
                        className="eightball-input"
                        placeholder="Will I send my project today?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button type="submit" className="eightball-button" disabled={shaking}>
                        {shaking ? "Shaking..." : "Ask the Ball"}
                    </button>
                </form>

                <button
                    type="button"
                    className="eightball-motion"
                    onClick={requestMotionPermission}
                >
                    Enable shake-to-roll (mobile)
                </button>
                {shakeCount > 0 && (
                    <p className="eightball-shakes">Shakes detected: {shakeCount}</p>
                )}
            </div>
            <HomeRow/>
        </>
    );
}
