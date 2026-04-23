import {useEffect, useState} from "react";
import {BACKEND_URL, ROUTE_COLORS} from "../lib/types.ts";
import {supabaseClient} from "../util/supabaseClient.ts";
import {toast} from "react-toastify";
import "../pages/styles/climboftheday.css";

interface DailyClimb {
    id: number;
    name: string;
    difficulty: string;
    type: string;
    color: string;
    setter: string;
    gym: string;
}

export default function ClimbOfTheDay() {
    const [climb, setClimb] = useState<DailyClimb | null>(null);
    const [loading, setLoading] = useState(true);
    const [logging, setLogging] = useState(false);

    useEffect(() => {
        const fetchClimbOfTheDay = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/climbs/of-the-day`);
                const data = await response.json();
                if (data.success && data.data) {
                    setClimb(data.data);
                }
            } catch (err) {
                console.log("Failed to fetch climb of the day:", err);
            }
            setLoading(false);
        };
        fetchClimbOfTheDay();
    }, []);

    const handleLog = async () => {
        if (!climb || logging) return;
        setLogging(true);
        const {data: {user}} = await supabaseClient.auth.getUser();
        if (!user) {
            toast.error("You must be signed in to log a climb", {autoClose: 2500});
            setLogging(false);
            return;
        }
        const response = await fetch(`${BACKEND_URL}/climbs/log`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: user.id, climb: climb.id}),
        });
        const data = await response.json();
        if (data.success) {
            toast("Climb of the Day logged!", {autoClose: 2500});
        } else {
            toast.error("Failed to log Climb of the Day", {autoClose: 2500});
        }
        setLogging(false);
    };

    if (loading) {
        return (
            <div className={"climb-of-the-day-card climb-of-the-day-empty"}>
                <p>Finding today's climb...</p>
            </div>
        );
    }

    if (!climb) {
        return (
            <div className={"climb-of-the-day-card climb-of-the-day-empty"}>
                <h2>Climb of the Day</h2>
                <p>No climbs are available yet. Add one to get started!</p>
            </div>
        );
    }

    return (
        <div className={"climb-of-the-day-card"}>
            <div className={"climb-of-the-day-header"}>
                <span className={"climb-of-the-day-badge"}>Climb of the Day</span>
                <div
                    className={"climb-of-the-day-color"}
                    style={{backgroundColor: ROUTE_COLORS[climb.color]}}
                />
            </div>
            <h2 className={"climb-of-the-day-name"}>{climb.name}</h2>
            <p className={"climb-of-the-day-meta"}>
                {climb.difficulty} • {climb.type} • {climb.gym}
            </p>
            <p className={"climb-of-the-day-setter"}>Set by {climb.setter}</p>
            <button
                className={"climb-of-the-day-button"}
                onClick={handleLog}
                disabled={logging}
            >
                {logging ? "Logging..." : "Log it"}
            </button>
        </div>
    );
}
