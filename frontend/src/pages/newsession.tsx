import "./styles/sessions.css";
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {User} from "@supabase/supabase-js";
import {supabaseClient} from "../util/supabaseClient.ts";
import {BACKEND_URL, type SessionInput} from "../lib/types.ts";
import {toast, ToastContainer} from "react-toastify";

interface CompletedClimbRow {
    id: number;
    climb: number;
    climbs: {
        id: number;
        name: string;
        difficulty: string;
        type: string;
        gym: string;
    } | null;
}

export default function NewSession() {
    const [user, setUser] = useState<User>();
    const [completed, setCompleted] = useState<CompletedClimbRow[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            if (!user) return;
            setUser(user);
            const response = await fetch(`${BACKEND_URL}/climbs/logged/${user.id}`);
            const data = await response.json();
            if (data.success) {
                setCompleted(data.data as CompletedClimbRow[]);
            }
        };
        load();
    }, []);

    const toggleClimb = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleSubmit = async (formData: FormData) => {
        if (!user) return;
        setSubmitting(true);
        const sessionDate = formData.get('sessionDate') as string;
        const durationRaw = formData.get('durationMin') as string;
        const notes = (formData.get('notes') as string) ?? '';
        const payload: SessionInput = {
            user: user.id,
            sessionDate: sessionDate,
            durationMin: durationRaw ? Number(durationRaw) : null,
            notes: notes,
            completedClimbIds: Array.from(selected),
        };
        const res = await fetch(`${BACKEND_URL}/sessions/new`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.success) {
            toast("Session saved", {autoClose: 2000});
            navigate('/sessions');
        } else {
            toast.error("Failed to save session", {autoClose: 2500});
        }
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className={'new-session-page'}>
            <h1 style={{background: '#EDCDB7', border: '3px solid black', padding: '6px 10px', fontSize: '28px', margin: '16px'}}>
                New Session
            </h1>
            <ToastContainer className={'toast'}/>
            <form action={handleSubmit}>
                <label>
                    <p>Session date:</p>
                    <input type="date" name="sessionDate" defaultValue={today} required/>
                </label>

                <label>
                    <p>Duration (minutes):</p>
                    <input type="number" name="durationMin" min={0} placeholder="e.g. 90"/>
                </label>

                <label>
                    <p>Notes:</p>
                    <textarea name="notes" placeholder="How did the session go?"/>
                </label>

                <label>
                    <p>Include logged climbs:</p>
                    <div className={'climb-picker'}>
                        {completed.length === 0 && (
                            <p>No logged climbs yet. Log some climbs first, then group them here.</p>
                        )}
                        {completed.map((row) => {
                            const climb = row.climbs;
                            if (!climb) return null;
                            return (
                                <label key={row.id} className={'climb-picker-row'}>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(row.id)}
                                        onChange={() => toggleClimb(row.id)}
                                    />
                                    <span>{climb.name} — {climb.difficulty} • {climb.type} @ {climb.gym}</span>
                                </label>
                            );
                        })}
                    </div>
                </label>

                <button className={'submit-session-button'} type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Session'}
                </button>
            </form>
            <HomeRow/>
        </div>
    );
}
