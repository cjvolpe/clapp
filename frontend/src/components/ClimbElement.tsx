import {ROUTE_COLORS} from "../lib/types.ts";
import '../pages/styles/climbelement.css'
import {useNavigate} from "react-router-dom";

interface ClimbRow {
    name: string;
    type: string;
    color: string;
    date_set: string;
    gym: string;
    setter: string;
    difficulty: string;
    picture?: string | null;
}

interface ClimbElementProps {
    jsonClimb: ClimbRow;
    climbId: number;
    onLog: (climb: number) => void;
    isSelected: boolean;
}

export default function ClimbElement({jsonClimb, climbId, onLog, isSelected}: ClimbElementProps) {
    const navigate = useNavigate();
    const climbAdapter = (data: ClimbRow) => {
        return {
            name: data.name,
            type: data.type,
            color: data.color,
            dateSet: data.date_set,
            gym: data.gym,
            setter: data.setter,
            difficulty: data.difficulty,
            picture: data.picture,
        }
    };
    const {name, difficulty, type, color, setter, dateSet, gym, picture} = climbAdapter(jsonClimb);
    const logClimb = () => {
        onLog(climbId);
    }
    const formatLocalHeader = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const shortYear = date.getFullYear().toString().slice(-2);
        return `${month}/${day}/${shortYear}`;
    };

    const openDetails = (event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/climb/${climbId}`);
    };


    return (<div className={`climb-container ${isSelected ? 'highlighted' : ''}`} onClick={logClimb}>
        {picture && (
            <img
                className={'climb-thumbnail'}
                src={picture}
                alt={`${name} climb`}
                onClick={openDetails}
            />
        )}
        <div className={"climb-left-column"}>
            <h1>{name}</h1>
            <p>Set by: {setter}</p>
            <div className={'location'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                     className="bi bi-geo-alt"
                     viewBox="0 0 16 16">
                    <path
                        d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>
                <p>{gym} • {type}</p>
            </div>
            <button type={'button'} className={'climb-details-link'} onClick={openDetails}>
                View details
            </button>

        </div>
        <div className={"climb-right-column"}>
            <h1>{difficulty}</h1>
            <div className={'cooler-circle'} style={{backgroundColor: ROUTE_COLORS[color]}}></div>
            <h4>{formatLocalHeader(dateSet)}</h4>
        </div>
    </div>);

}
