import {useEffect, useState} from "react";
import {BACKEND_URL, type Tag} from "../lib/types.ts";
import "../pages/styles/tagchips.css";

interface TagChipsProps {
    climbId: number;
    initialTags?: Tag[];
    editable?: boolean;
    onTagsChange?: (tags: Tag[]) => void;
}

export default function TagChips({climbId, initialTags, editable = true, onTagsChange}: TagChipsProps) {
    const [tags, setTags] = useState<Tag[]>(initialTags ?? []);
    const [loaded, setLoaded] = useState<boolean>(initialTags !== undefined);
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (loaded) return;
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/climbs/${climbId}/tags`);
                const payload = await res.json();
                if (cancelled) return;
                if (payload.success) {
                    setTags(payload.data ?? []);
                }
            } catch (err) {
                console.error("Failed to load tags", err);
            } finally {
                if (!cancelled) setLoaded(true);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [climbId, loaded]);

    const publish = (next: Tag[]) => {
        setTags(next);
        onTagsChange?.(next);
    };

    const addTag = async (raw: string) => {
        const name = raw.trim();
        if (!name) return;
        if (tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            setDraft("");
            setAdding(false);
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`${BACKEND_URL}/climbs/tags/add`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({climb: climbId, tag: name}),
            });
            const payload = await res.json();
            if (payload.success && payload.data?.tag) {
                publish([...tags, {id: payload.data.tag.id, name: payload.data.tag.name}]);
            }
        } catch (err) {
            console.error("Failed to add tag", err);
        } finally {
            setBusy(false);
            setDraft("");
            setAdding(false);
        }
    };

    const removeTag = async (tag: Tag) => {
        setBusy(true);
        try {
            const res = await fetch(`${BACKEND_URL}/climbs/tags/remove`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({climb: climbId, tag: tag.name}),
            });
            const payload = await res.json();
            if (payload.success) {
                publish(tags.filter(t => t.id !== tag.id));
            }
        } catch (err) {
            console.error("Failed to remove tag", err);
        } finally {
            setBusy(false);
        }
    };

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div className={"tag-chips"} onClick={stop}>
            {tags.map(tag => (
                <span key={tag.id} className={"tag-chip"}>
                    <span className={"tag-chip-label"}>{tag.name}</span>
                    {editable && (
                        <button
                            type={"button"}
                            className={"tag-chip-remove"}
                            aria-label={`Remove ${tag.name}`}
                            disabled={busy}
                            onClick={(e) => {
                                stop(e);
                                removeTag(tag);
                            }}
                        >
                            ×
                        </button>
                    )}
                </span>
            ))}
            {editable && (adding ? (
                <form
                    className={"tag-chip-form"}
                    onSubmit={(e) => {
                        e.preventDefault();
                        addTag(draft);
                    }}
                >
                    <input
                        autoFocus
                        className={"tag-chip-input"}
                        type={"text"}
                        value={draft}
                        disabled={busy}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => {
                            if (draft.trim()) {
                                addTag(draft);
                            } else {
                                setAdding(false);
                            }
                        }}
                        placeholder={"e.g. crimpy"}
                        maxLength={40}
                    />
                </form>
            ) : (
                <button
                    type={"button"}
                    className={"tag-chip-add"}
                    disabled={busy}
                    onClick={(e) => {
                        stop(e);
                        setAdding(true);
                    }}
                >
                    + tag
                </button>
            ))}
        </div>
    );
}
