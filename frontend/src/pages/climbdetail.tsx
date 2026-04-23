import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {BACKEND_URL, ROUTE_COLORS} from "../lib/types.ts";
import HomeRow from "../components/HomeRow.tsx";
import "./styles/climbdetail.css";

interface ClimbRecord {
    id: number;
    name: string;
    difficulty: string;
    type: string;
    color: string;
    setter: string;
    date_set: string;
    gym: string;
    picture?: string | null;
    archived?: boolean;
}

export default function ClimbDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const [climb, setClimb] = useState<ClimbRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchClimb = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/climbs/${id}`);
                const data = await response.json();
                if (cancelled) return;
                if (data.success) {
                    setClimb(data.data);
                } else {
                    setError(data.message || "Failed to load climb");
                }
            } catch (err) {
                if (!cancelled) setError((err as Error).message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchClimb();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) return <div className={'climb-detail-page'}><p>Loading…</p><HomeRow/></div>;
    if (error || !climb) {
        return (
            <div className={'climb-detail-page'}>
                <p>{error ?? "Climb not found"}</p>
                <button onClick={() => navigate(-1)}>Go back</button>
                <HomeRow/>
            </div>
        );
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split('-').map(Number);
        return `${month}/${day}/${year}`;
    };

    return (
        <div className={'climb-detail-page'}>
            <button className={'back-button'} onClick={() => navigate(-1)}>← Back</button>
            <div className={'climb-detail-card'}>
                {climb.picture ? (
                    <img className={'climb-detail-image'} src={climb.picture} alt={`${climb.name} route`}/>
                ) : (
                    <div className={'climb-detail-placeholder'}>No photo yet</div>
                )}
                <div className={'climb-detail-body'}>
                    <div className={'climb-detail-heading'}>
                        <h1>{climb.name}</h1>
                        <div className={'cooler-circle'} style={{backgroundColor: ROUTE_COLORS[climb.color]}}></div>
                    </div>
                    <p><strong>Grade:</strong> {climb.difficulty}</p>
                    <p><strong>Type:</strong> {climb.type}</p>
                    <p><strong>Setter:</strong> {climb.setter}</p>
                    <p><strong>Gym:</strong> {climb.gym}</p>
                    <p><strong>Set on:</strong> {formatDate(climb.date_set)}</p>
                    {climb.archived && <p className={'archived-tag'}>Archived</p>}
                </div>
            </div>
            <HomeRow/>
        </div>
    );
}
