import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import {supabaseClient} from "../util/supabaseClient.ts";
import HomeRow from "../components/HomeRow.tsx";
import {BACKEND_URL, BOULDER_GRADES, ROPE_GRADES, type UserStats} from "../lib/types.ts";
import "./styles/stats.css";

function sortGrades(grades: string[]): string[] {
    const rank = (g: string): number => {
        if (g in BOULDER_GRADES) return BOULDER_GRADES[g];
        if (g in ROPE_GRADES) return ROPE_GRADES[g];
        return Number.POSITIVE_INFINITY;
    };
    return [...grades].sort((a, b) => rank(a) - rank(b));
}

interface BarRowProps {
    label: string;
    count: number;
    max: number;
}

function BarRow({label, count, max}: BarRowProps) {
    const pct = max === 0 ? 0 : Math.round((count / max) * 100);
    return (
        <div className={"stat-bar-row"}>
            <span className={"stat-bar-label"}>{label}</span>
            <div className={"stat-bar-track"}>
                <div className={"stat-bar-fill"} style={{width: `${pct}%`}}/>
            </div>
            <span className={"stat-bar-count"}>{count}</span>
        </div>
    );
}

export default function Stats() {
    const [user, setUser] = useState<User>();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user ?? undefined);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/stats/${user.id}`);
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                } else {
                    setError(data.error ?? data.message ?? "Failed to load stats");
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const userName = user?.user_metadata?.name;
    const grades = stats ? sortGrades(Object.keys(stats.byGrade)) : [];
    const gradeMax = stats ? Math.max(1, ...Object.values(stats.byGrade)) : 1;
    const typeEntries = stats ? Object.entries(stats.byType) : [];
    const typeMax = stats ? Math.max(1, ...Object.values(stats.byType)) : 1;

    return (
        <>
            <div className={"stats-page"}>
                <div className={"stats-heading"}>
                    <h1>Climbing Stats</h1>
                    {userName && <p className={"stats-subtitle"}>{userName}</p>}
                </div>

                {loading && <p>Loading...</p>}
                {error && <p className={"stats-error"}>{error}</p>}

                {stats && !loading && (
                    <div className={"stats-grid"}>
                        <div className={"stats-card stats-card-total"}>
                            <h2>Total Climbs</h2>
                            <p className={"stats-big-number"}>{stats.total}</p>
                        </div>

                        <div className={"stats-card stats-card-streak"}>
                            <h2>Current Send Streak</h2>
                            <p className={"stats-big-number"}>{stats.currentStreak}</p>
                            <p className={"stats-unit"}>{stats.currentStreak === 1 ? "day" : "days"}</p>
                        </div>

                        <div className={"stats-card stats-card-wide"}>
                            <h2>By Grade</h2>
                            {grades.length === 0 ? (
                                <p>No climbs logged yet.</p>
                            ) : (
                                <div className={"stat-bars"}>
                                    {grades.map(g => (
                                        <BarRow key={g} label={g} count={stats.byGrade[g]} max={gradeMax}/>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={"stats-card stats-card-wide"}>
                            <h2>By Type</h2>
                            {typeEntries.length === 0 ? (
                                <p>No climbs logged yet.</p>
                            ) : (
                                <div className={"stat-bars"}>
                                    {typeEntries.map(([t, c]) => (
                                        <BarRow key={t} label={t} count={c} max={typeMax}/>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {stats && !loading && stats.total === 0 && (
                    <p className={"stats-empty"}>Log a climb from the home page to start building your stats.</p>
                )}
            </div>
            <HomeRow/>
        </>
    );
}
