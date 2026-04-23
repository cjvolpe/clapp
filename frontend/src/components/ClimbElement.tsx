import {type Climb, ROUTE_COLORS, BACKEND_URL} from "../lib/types.ts";
import '../pages/styles/climbelement.css'
import {useEffect, useState} from "react";
import RatingStars from "./RatingStars.tsx";
import {toast} from "react-toastify";

interface ClimbElementProps {
    jsonClimb: Climb;
    climbId: number;
    onLog: (climb: Climb) => void;
    isSelected: boolean;
    userId?: string;
}

export default function ClimbElement({jsonClimb, climbId, onLog, isSelected, userId}: ClimbElementProps) {
    const climbAdapter = (data) => {
        return {
            name: data.name,
            type: data.type,
            color: data.color,
            dateSet: data.date_set,
            gym: data.gym,
            setter: data.setter,
            difficulty: data.difficulty,

        }
    };
    const {name, difficulty, type, color, setter, dateSet, gym} = climbAdapter(jsonClimb);
    const [average, setAverage] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    const [userRating, setUserRating] = useState<number>(0);

    useEffect(() => {
        let cancelled = false;
        const fetchSummary = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/climbs/rating/${climbId}`);
                const data = await res.json();
                if (!cancelled && data.success) {
                    setAverage(data.data.average ?? 0);
                    setCount(data.data.count ?? 0);
                }
            } catch {
                // network error — leave defaults
            }
        };
        fetchSummary();
        return () => {
            cancelled = true;
        };
    }, [climbId]);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const fetchUserRating = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/climbs/rating/${climbId}/${userId}`);
                const data = await res.json();
                if (!cancelled && data.success) {
                    setUserRating(data.data.rating ?? 0);
                }
            } catch {
                // ignore
            }
        };
        fetchUserRating();
        return () => {
            cancelled = true;
        };
    }, [climbId, userId]);

    const logClimb = () => {
        onLog(climbId);
    }
    const formatLocalHeader = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const shortYear = date.getFullYear().toString().slice(-2);
        return `${month}/${day}/${shortYear}`;
    };

    const handleRate = async (rating: number) => {
        if (!userId) {
            toast.error("Sign in to rate climbs", {autoClose: 2500});
            return;
        }
        const previous = userRating;
        setUserRating(rating);
        try {
            const res = await fetch(`${BACKEND_URL}/climbs/rate`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: userId, climb: climbId, rating}),
            });
            const data = await res.json();
            if (!data.success) {
                setUserRating(previous);
                toast.error("Failed to save rating", {autoClose: 2500});
                return;
            }
            const summaryRes = await fetch(`${BACKEND_URL}/climbs/rating/${climbId}`);
            const summary = await summaryRes.json();
            if (summary.success) {
                setAverage(summary.data.average ?? 0);
                setCount(summary.data.count ?? 0);
            }
            toast(previous === 0 ? "Rating submitted" : "Rating updated", {autoClose: 2000});
        } catch {
            setUserRating(previous);
            toast.error("Failed to save rating", {autoClose: 2500});
        }
    };


    return (<div className={`climb-container ${isSelected ? 'highlighted' : ''}`} onClick={logClimb}>
        <div className={"climb-left-column"}>
            <h1>{name}</h1>
            <p>Set by: {setter}</p>
            <div className={'location'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-geo-alt"
                     viewBox="0 0 16 16">
                    <path
                        d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
                <p>{gym} • {type}</p>
            </div>
            <div className={'climb-rating'}>
                <RatingStars
                    value={userId ? userRating || average : average}
                    count={count}
                    interactive={!!userId}
                    onRate={handleRate}
                    size={16}
                />
            </div>

        </div>
        <div className={"climb-right-column"}>
            <h1>{difficulty}</h1>
            <div className={'cooler-circle'} style={{backgroundColor: ROUTE_COLORS[color]}}></div>
            <h4>{formatLocalHeader(dateSet)}</h4>
        </div>
    </div>);

}
