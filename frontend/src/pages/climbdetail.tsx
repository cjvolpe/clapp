import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {User} from "@supabase/supabase-js";
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {BACKEND_URL, type Comment, ROUTE_COLORS} from "../lib/types.ts";

type ClimbRecord = {
    id: number;
    name: string;
    difficulty: string;
    type: string;
    color: string;
    setter: string;
    gym: string;
    date_set?: string;
};
import {toast, ToastContainer} from "react-toastify";
import "./styles/climbdetail.css";

const MAX_LENGTH = 2000;

export default function ClimbDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [climb, setClimb] = useState<ClimbRecord | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [user, setUser] = useState<User>();
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user ?? undefined);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchClimb = async () => {
            const response = await fetch(`${BACKEND_URL}/climbs/${id}`);
            const data = await response.json();
            if (data.success) setClimb(data.data);
        };
        const fetchComments = async () => {
            const response = await fetch(`${BACKEND_URL}/climbs/${id}/comments`);
            const data = await response.json();
            if (data.success) setComments(data.data);
        };
        setLoading(true);
        Promise.all([fetchClimb(), fetchComments()]).finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id || !user || submitting) return;
        const trimmed = body.trim();
        if (!trimmed) return;
        setSubmitting(true);
        try {
            const response = await fetch(`${BACKEND_URL}/climbs/${id}/comments`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    climb: Number(id),
                    author: user.id,
                    authorName: user.user_metadata?.name ?? user.email ?? null,
                    authorAvatar: user.user_metadata?.avatar_url ?? null,
                    body: trimmed,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setBody("");
                const refreshed = await fetch(`${BACKEND_URL}/climbs/${id}/comments`);
                const refreshedData = await refreshed.json();
                if (refreshedData.success) setComments(refreshedData.data);
                toast("Comment posted", {autoClose: 1500});
            } else {
                toast.error("Failed to post comment", {autoClose: 2500});
            }
        } catch {
            toast.error("Failed to post comment", {autoClose: 2500});
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimestamp = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleString();
    };

    return (
        <>
            <div className={"climb-detail-page"}>
                <button className={"climb-detail-back"} onClick={() => navigate(-1)}>← Back</button>
                <ToastContainer className={"toast"}/>
                {loading && !climb ? (
                    <p>Loading...</p>
                ) : climb ? (
                    <div className={"climb-detail-header"}>
                        <h1>{climb.name}</h1>
                        <div className={"climb-detail-header-meta"}>
                            <span>{climb.difficulty}</span>
                            <span>•</span>
                            <span>{climb.type}</span>
                            <span>•</span>
                            <span>{climb.gym}</span>
                            <span
                                className={"cooler-circle"}
                                style={{backgroundColor: ROUTE_COLORS[climb.color] ?? "transparent"}}
                                title={climb.color}
                            />
                        </div>
                        <div>Set by {climb.setter}</div>
                    </div>
                ) : (
                    <p>Climb not found.</p>
                )}

                <section className={"climb-comments"}>
                    <h2>Comments</h2>

                    <form className={"comment-form"} onSubmit={handleSubmit}>
                        <textarea
                            value={body}
                            onChange={(event) => setBody(event.target.value.slice(0, MAX_LENGTH))}
                            placeholder={user ? "Share beta or a note..." : "Sign in to comment"}
                            disabled={!user || submitting}
                            maxLength={MAX_LENGTH}
                        />
                        <div className={"comment-form-row"}>
                            <span>{body.length}/{MAX_LENGTH}</span>
                            <button type={"submit"} disabled={!user || submitting || !body.trim()}>
                                {submitting ? "Posting..." : "Post comment"}
                            </button>
                        </div>
                    </form>

                    <div className={"comment-list"}>
                        {comments.length === 0 ? (
                            <p>No comments yet — be the first to share beta.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className={"comment-item"}>
                                    <div className={"comment-meta"}>
                                        {comment.author_avatar ? (
                                            <img
                                                className={"comment-avatar"}
                                                src={comment.author_avatar}
                                                alt={comment.author_name ?? "user avatar"}
                                            />
                                        ) : null}
                                        <strong>{comment.author_name ?? "Anonymous"}</strong>
                                        <span>•</span>
                                        <span>{formatTimestamp(comment.created_at)}</span>
                                    </div>
                                    <p className={"comment-body"}>{comment.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
            <HomeRow/>
        </>
    );
}
