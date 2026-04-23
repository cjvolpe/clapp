import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";
import type {User} from "@supabase/supabase-js";
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {
    BACKEND_URL,
    type ClimbComment,
    type ClimbDetail,
    type ClimbLogger,
    type ClimbRating,
    ROUTE_COLORS,
} from "../lib/types.ts";
import "./styles/climbdetail.css";

const formatDate = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
};

const renderStars = (avg: number | null) => {
    if (avg === null) return "—";
    const rounded = Math.round(avg);
    return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
};

const shortClimber = (id: string) => (id.length > 8 ? `${id.slice(0, 8)}…` : id);

export default function ClimbDetailPage() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [detail, setDetail] = useState<ClimbDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [ratingChoice, setRatingChoice] = useState<number>(5);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [commentBody, setCommentBody] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        supabaseClient.auth.getUser().then(({data}) => setUser(data.user));
    }, []);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/climbs/${id}`);
                const json = await response.json();
                if (cancelled) return;
                if (json.success) {
                    setDetail(json.data as ClimbDetail);
                } else {
                    setError(json.error || json.message || "Failed to load climb");
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : "Network error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleLog = async () => {
        if (!user || !id) return;
        const response = await fetch(`${BACKEND_URL}/climbs/log`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: user.id, climb: Number(id)}),
        });
        const data = await response.json();
        if (data.success) {
            toast("Climb Successfully Logged", {autoClose: 2500});
            setDetail((prev) =>
                prev
                    ? {
                          ...prev,
                          loggers: [
                              ...prev.loggers,
                              {climber: user.id, logged_at: new Date().toISOString()},
                          ],
                      }
                    : prev
            );
        } else {
            toast.error("Failed to Log Climb", {autoClose: 2500});
        }
    };

    const handleSubmitRating = async () => {
        if (!user || !id) return;
        setSubmittingRating(true);
        try {
            const response = await fetch(`${BACKEND_URL}/climbs/${id}/ratings`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: user.id, rating: ratingChoice}),
            });
            const data = await response.json();
            if (data.success) {
                toast("Rating saved", {autoClose: 2000});
                const newRating: ClimbRating = {
                    id: Date.now(),
                    climb: Number(id),
                    climber: user.id,
                    rating: ratingChoice,
                    created_at: new Date().toISOString(),
                };
                setDetail((prev) => {
                    if (!prev) return prev;
                    const items = prev.ratings.items.filter((r) => r.climber !== user.id);
                    items.push(newRating);
                    const sum = items.reduce((s, r) => s + r.rating, 0);
                    return {
                        ...prev,
                        ratings: {
                            items,
                            count: items.length,
                            average: items.length === 0 ? null : sum / items.length,
                        },
                    };
                });
            } else {
                toast.error("Failed to save rating", {autoClose: 2500});
            }
        } catch {
            toast.error("Failed to save rating", {autoClose: 2500});
        } finally {
            setSubmittingRating(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!user || !id || commentBody.trim().length === 0) return;
        setSubmittingComment(true);
        try {
            const response = await fetch(`${BACKEND_URL}/climbs/${id}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({user: user.id, body: commentBody.trim()}),
            });
            const data = await response.json();
            if (data.success) {
                const newComment: ClimbComment = {
                    id: Date.now(),
                    climb: Number(id),
                    climber: user.id,
                    body: commentBody.trim(),
                    created_at: new Date().toISOString(),
                };
                setDetail((prev) =>
                    prev ? {...prev, comments: [...prev.comments, newComment]} : prev
                );
                setCommentBody("");
                toast("Comment posted", {autoClose: 2000});
            } else {
                toast.error("Failed to post comment", {autoClose: 2500});
            }
        } catch {
            toast.error("Failed to post comment", {autoClose: 2500});
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="climb-detail-page">
                    <p>Loading climb…</p>
                </div>
                <HomeRow/>
            </>
        );
    }

    if (error || !detail) {
        return (
            <>
                <div className="climb-detail-page">
                    <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                    <p className="detail-empty">{error ?? "Climb not found"}</p>
                </div>
                <HomeRow/>
            </>
        );
    }

    const climb = detail.climb as {
        name: string;
        setter: string;
        gym: string;
        type: string;
        difficulty: string;
        color: string;
        date_set: string;
        archived?: boolean;
    };
    const colorHex = ROUTE_COLORS[climb.color];

    return (
        <>
            <div className="climb-detail-page">
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

                <div className="climb-detail-card">
                    <div className="meta">
                        <h1>{climb.name}</h1>
                        <p>Set by: {climb.setter}</p>
                        <p>{climb.gym} • {climb.type}</p>
                        <p>Set on: {formatDate(climb.date_set)}</p>
                        {climb.archived ? <p><strong>Archived</strong></p> : null}
                    </div>
                    <div className="visual">
                        <p className="difficulty">{climb.difficulty}</p>
                        {colorHex ? (
                            <div className="color-swatch" style={{backgroundColor: colorHex}}/>
                        ) : null}
                    </div>
                </div>

                <section className="climb-detail-section">
                    <h2>Ratings</h2>
                    <div className="rating-summary">
                        <span className="stars">{renderStars(detail.ratings.average)}</span>
                        <span className="count">
                            {detail.ratings.average !== null
                                ? `${detail.ratings.average.toFixed(1)} from ${detail.ratings.count} climber${detail.ratings.count === 1 ? "" : "s"}`
                                : "No ratings yet"}
                        </span>
                    </div>
                    {user ? (
                        <div className="rating-form">
                            <label htmlFor="rating-select">Your rating:</label>
                            <select
                                id="rating-select"
                                value={ratingChoice}
                                onChange={(e) => setRatingChoice(Number(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <button onClick={handleSubmitRating} disabled={submittingRating}>
                                {submittingRating ? "Saving…" : "Submit"}
                            </button>
                        </div>
                    ) : null}
                </section>

                <section className="climb-detail-section">
                    <h2>Logged by ({detail.loggers.length})</h2>
                    {detail.loggers.length === 0 ? (
                        <p className="detail-empty">Nobody has logged this climb yet.</p>
                    ) : (
                        <ul className="loggers-list">
                            {detail.loggers.map((logger: ClimbLogger, idx) => (
                                <li key={`${logger.climber}-${idx}`}>
                                    {shortClimber(logger.climber)}
                                    {logger.logged_at ? ` — ${formatDate(logger.logged_at)}` : ""}
                                </li>
                            ))}
                        </ul>
                    )}
                    {user ? (
                        <div className="rating-form">
                            <button onClick={handleLog}>Log this climb</button>
                        </div>
                    ) : null}
                </section>

                <section className="climb-detail-section">
                    <h2>Comments ({detail.comments.length})</h2>
                    {detail.comments.length === 0 ? (
                        <p className="detail-empty">No comments yet.</p>
                    ) : (
                        <ul className="comments-list">
                            {detail.comments.map((c) => (
                                <li key={c.id}>
                                    <p className="comment-meta">
                                        {shortClimber(c.climber)} • {formatDateTime(c.created_at)}
                                    </p>
                                    <p className="comment-body">{c.body}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    {user ? (
                        <div className="comment-form">
                            <textarea
                                placeholder="Share beta or thoughts…"
                                value={commentBody}
                                onChange={(e) => setCommentBody(e.target.value)}
                                maxLength={2000}
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={submittingComment || commentBody.trim().length === 0}
                            >
                                {submittingComment ? "Posting…" : "Post comment"}
                            </button>
                        </div>
                    ) : null}
                </section>

                <ToastContainer className="toast"/>
            </div>
            <HomeRow/>
        </>
    );
}
