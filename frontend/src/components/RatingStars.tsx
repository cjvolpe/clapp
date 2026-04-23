import {useState} from "react";
import "../pages/styles/ratingstars.css";

interface RatingStarsProps {
    value: number;
    count?: number;
    interactive?: boolean;
    size?: number;
    onRate?: (rating: number) => void;
}

export default function RatingStars({value, count, interactive = false, size = 18, onRate}: RatingStarsProps) {
    const [hover, setHover] = useState<number | null>(null);
    const display = hover ?? value;

    const handleClick = (e: React.MouseEvent, star: number) => {
        if (!interactive || !onRate) return;
        e.stopPropagation();
        onRate(star);
    };

    return (
        <div
            className={`rating-stars ${interactive ? "interactive" : ""}`}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => interactive && e.stopPropagation()}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = display >= star;
                const half = !filled && display >= star - 0.5;
                return (
                    <span
                        key={star}
                        className={`star ${filled ? "filled" : half ? "half" : "empty"}`}
                        style={{fontSize: `${size}px`, lineHeight: 1}}
                        onMouseEnter={() => interactive && setHover(star)}
                        onClick={(e) => handleClick(e, star)}
                        role={interactive ? "button" : undefined}
                        aria-label={interactive ? `Rate ${star} stars` : undefined}
                    >
                        {filled ? "★" : half ? "★" : "☆"}
                    </span>
                );
            })}
            {count !== undefined && count > 0 && (
                <span className="rating-count">({count})</span>
            )}
        </div>
    );
}
