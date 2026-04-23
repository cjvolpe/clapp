import {useEffect, useState} from "react";
import HomeRow from "../components/HomeRow.tsx";
import {BACKEND_URL, type LeaderboardEntry} from "../lib/types.ts";
import "./styles/leaderboard.css";

export default function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/leaderboard`);
                const data = await response.json();
                if (data.success) {
                    setEntries(data.data);
                } else {
                    setError(data.message ?? "Failed to load leaderboard");
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const initials = (name: string | null, userId: string) => {
        const source = name?.trim() || userId;
        const parts = source.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "?";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (<>
        <div className={'leaderboard-page'}>
            <div className={'leaderboard-heading'}>
                <h1>Leaderboard</h1>
                <p className={'leaderboard-subtitle'}>Top climbers by climbs sent in the past 30 days</p>
            </div>

            <div className={'leaderboard-list'}>
                {loading && <p>Loading...</p>}
                {error && !loading && <p className={'leaderboard-error'}>{error}</p>}
                {!loading && !error && entries.length === 0 && (
                    <p>No climbs logged in the past 30 days yet.</p>
                )}
                {!loading && !error && entries.map((entry, index) => (
                    <div key={entry.userId} className={`leaderboard-row rank-${Math.min(index + 1, 4)}`}>
                        <div className={'leaderboard-rank'}>{index + 1}</div>
                        <div className={'leaderboard-avatar'}>
                            {entry.avatarUrl ? (
                                <img src={entry.avatarUrl} alt={`${entry.name ?? 'climber'} avatar`}/>
                            ) : (
                                <span className={'avatar-fallback'}>{initials(entry.name, entry.userId)}</span>
                            )}
                        </div>
                        <div className={'leaderboard-name'}>
                            {entry.name ?? `Climber ${entry.userId.slice(0, 8)}`}
                        </div>
                        <div className={'leaderboard-count'}>
                            <span className={'count-number'}>{entry.count}</span>
                            <span className={'count-label'}>climb{entry.count === 1 ? '' : 's'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <HomeRow/>
    </>);
}
