import "./styles/sessions.css";
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {User} from "@supabase/supabase-js";
import {supabaseClient} from "../util/supabaseClient.ts";
import {BACKEND_URL, type SessionRecord} from "../lib/types.ts";
import {toast, ToastContainer} from "react-toastify";

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, (month ?? 1) - 1, day);
    return date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
}

export default function Sessions() {
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [expandedDetail, setExpandedDetail] = useState<SessionRecord | null>(null);
    const navigate = useNavigate();

    const fetchSessions = async (userId: string) => {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/sessions/${userId}`);
        const data = await response.json();
        if (data.success) {
            setSessions(data.data as SessionRecord[]);
        } else {
            toast.error("Failed to load sessions", {autoClose: 2500});
        }
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            if (!user) return;
            setUser(user);
            await fetchSessions(user.id);
        };
        init();
    }, []);

    const handleToggleExpand = async (sessionId: number) => {
        if (expandedId === sessionId) {
            setExpandedId(null);
            setExpandedDetail(null);
            return;
        }
        setExpandedId(sessionId);
        setExpandedDetail(null);
        const response = await fetch(`${BACKEND_URL}/sessions/detail/${sessionId}`);
        const data = await response.json();
        if (data.success) {
            setExpandedDetail(data.data as SessionRecord);
        } else {
            toast.error("Failed to load session detail", {autoClose: 2500});
        }
    };

    const handleDelete = async (sessionId: number) => {
        const response = await fetch(`${BACKEND_URL}/sessions/${sessionId}`, {method: "DELETE"});
        const data = await response.json();
        if (data.success) {
            toast("Session deleted", {autoClose: 2000});
            if (user) await fetchSessions(user.id);
            if (expandedId === sessionId) {
                setExpandedId(null);
                setExpandedDetail(null);
            }
        } else {
            toast.error("Failed to delete session", {autoClose: 2500});
        }
    };

    return (
        <div className={'sessions-page'}>
            <h1>Session History</h1>
            <ToastContainer className={'toast'}/>
            <button className={'new-session-button'} onClick={() => navigate('/sessions/new')}>
                + New Session
            </button>

            <div className={'sessions-list'}>
                {sessions.length > 0 ? sessions.map((s) => (
                    <div key={s.id} className={'session-card'}>
                        <div className={'session-card-header'}>
                            <span className={'session-card-date'}>{formatDate(s.session_date)}</span>
                            <span className={'session-card-meta'}>
                                {s.duration_min != null ? `${s.duration_min} min` : 'No duration'}
                            </span>
                        </div>
                        {s.notes && <div className={'session-card-notes'}>{s.notes}</div>}
                        {expandedId === s.id && (
                            <div>
                                {expandedDetail === null && <p>Loading climbs...</p>}
                                {expandedDetail?.session_climbs?.length === 0 && (
                                    <p>No climbs logged for this session.</p>
                                )}
                                {expandedDetail?.session_climbs?.map((sc) => {
                                    const climb = sc.completed_climbs?.climbs;
                                    if (!climb) return null;
                                    return (
                                        <div key={sc.id} className={'session-climb-row'}>
                                            <span>{climb.name}</span>
                                            <span>{climb.difficulty} • {climb.type}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className={'session-card-actions'}>
                            <button onClick={() => handleToggleExpand(s.id)}>
                                {expandedId === s.id ? 'Hide climbs' : 'View climbs'}
                            </button>
                            <button className={'danger'} onClick={() => handleDelete(s.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                )) : (loading ? <p className={'empty-state'}>Loading...</p> :
                    <p className={'empty-state'}>No sessions yet. Tap "+ New Session" to log one.</p>)}
            </div>

            <HomeRow/>
        </div>
    );
}
