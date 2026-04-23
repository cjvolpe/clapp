import {BOULDER_GRADES, ROPE_GRADES, ROUTE_COLORS, type Search} from "../lib/types.ts";
import {useEffect, useState} from "react";
import '../pages/styles/filterclimbs.css'

interface FilterClimbsProps {
    filter: boolean;
    onAdvSearch: (body: Search | undefined) => void;
}

export default function FilterClimbs({filter, onAdvSearch}: FilterClimbsProps) {
    const [type, setType] = useState("Any");
    const [upperDifficulty, setUpperDifficulty] = useState("V17");
    const [color, setColor] = useState("Any");
    const [gym, setGym] = useState("Any");
    const [archived, setArchived] = useState<boolean>(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const advancedSearch = (formData: FormData) => {
        const newFilter: Search = {
            lowerDifficulty: formData.get('lowerDifficulty') as string,
            upperDifficulty: formData.get('upperDifficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            gym: formData.get('gym') as string,
            archived: formData.get('archived') === 'on',
        }
        if (newFilter.archived === null && newFilter.color === "Any" && newFilter.gym === "Any" && newFilter.type === "Any" && newFilter.startDate === "" && newFilter.endDate === "") {
            onAdvSearch(undefined);
            return;
        }
        console.log(newFilter);
        onAdvSearch(newFilter);
    };
    useEffect(() => {
        setUpperDifficulty(type === "Boulder" ? "V17" : "5.15+");
    }, [type]);


    return (
        <div className={`advanced-search-bar ${filter ? 'show' : 'hidden'}`}>
            <form action={advancedSearch} className={'filter'}>
                <div className={'filter-r1'}>
                    <label>
                        <p>Type</p>
                        <select name="type" onChange={e => setType(e.target.value)}
                                value={type}>
                            <option value={"Any"}>Any</option>
                            <option value={"Boulder"}>Boulder</option>
                            <option value={"Top Rope"}>Top Rope</option>
                        </select>
                    </label>

                    <label className={"difficulty"} style={{visibility: type === "Any" ? "hidden" : "visible"}}>
                        <p>Difficulty Range</p>
                        <select name="lowerDifficulty">
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter." + grade}>{grade}</option>)))}
                        </select>
                        to
                        <select name="upperDifficulty" defaultValue={upperDifficulty} value={upperDifficulty}
                                onChange={(e) => setUpperDifficulty(e.target.value)}>
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter." + grade}>{grade}</option>)))}
                        </select>
                    </label>
                </div>
                <div className={'filter-r2'}>
                    <label className={"color"}>
                        <p>Color</p>
                        <select name="color" value={color} onChange={e => setColor(e.target.value)}>
                            <option value={"Any"}>Any</option>
                            {Object.keys(ROUTE_COLORS).map((color) => (
                                <option value={color} key={"filter." + color}>{color}</option>))}
                        </select>
                    </label>
                    <label className={"gym"}>
                        <p>Gym</p>
                        <select name="gym" value={gym} onChange={e => setGym(e.target.value)}>
                            <option value={"Any"}>Any</option>
                            <option value={"Fetzer"}>Fetzer</option>
                            <option value={"Ram's Head"}>Ram's Head</option>
                        </select>
                    </label>
                </div>


                <label className={"dates"}>
                    <p>Dates Set</p>
                    <input
                        type="date"
                        name="startDate"
                        placeholder="Enter Date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    to
                    <input
                        type="date"
                        name="endDate"
                        placeholder="Enter Date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </label>


                <label className={'archived-climbs'}>
                    <p>Include Archived Climbs</p>
                    <input name={'archived'} type={"checkbox"} checked={archived}
                           onChange={e => setArchived(e.target.checked)}/>
                </label>
                <div className={'advanced-search-bar-buttons'}>
                    <button type="submit"
                            onSubmit={e => e.preventDefault()}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                }
                            }}>Apply Filters
                    </button>
                    <button type="button" onClick={() => {
                        setType("Any");
                        setUpperDifficulty("V17");
                        setColor("Any");
                        setStartDate("");
                        setEndDate("");
                        setGym("Any");
                        setArchived(false);
                        onAdvSearch(undefined);
                    }}>Clear Filters
                    </button>
                </div>

            </form>

        </div>);
}