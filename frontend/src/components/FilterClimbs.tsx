import {BOULDER_GRADES, ROPE_GRADES, ROUTE_COLORS, type Search} from "../lib/types.ts";
import {useEffect, useState} from "react";
import {
    type FilterPreset,
    type PresetFilter,
    loadPresets,
    savePresets,
    upsertPreset,
    removePreset,
    presetToSearch,
} from "../lib/filterPresets.ts";
import {toast} from "react-toastify";
import '../pages/styles/filterclimbs.css'

export default function FilterClimbs({filter, onAdvSearch}) {
    const [type, setType] = useState("Any");
    const [lowerDifficulty, setLowerDifficulty] = useState("VB");
    const [upperDifficulty, setUpperDifficulty] = useState("V17");
    const [color, setColor] = useState("Any");
    const [gym, setGym] = useState("Any");
    const [archived, setArchived] = useState<boolean>(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [presets, setPresets] = useState<FilterPreset[]>(() => loadPresets());
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [newPresetName, setNewPresetName] = useState<string>("");

    const advancedSearch = (formData: FormData) => {
        const newFilter: Search = {
            lowerDifficulty: formData.get('lowerDifficulty') as string,
            upperDifficulty: formData.get('upperDifficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            startDate: formData.get('startDate') as Date,
            endDate: formData.get('endDate') as Date,
            gym: formData.get('gym') as string,
            archived: formData.get('archived') as boolean,
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
        setLowerDifficulty(type === "Boulder" ? "VB" : "5.5");
    }, [type]);

    const applyPreset = (name: string) => {
        setSelectedPreset(name);
        if (!name) return;
        const preset = presets.find(p => p.name === name);
        if (!preset) return;
        const f = preset.filter;
        setType(f.type);
        setLowerDifficulty(f.lowerDifficulty);
        setUpperDifficulty(f.upperDifficulty);
        setColor(f.color);
        setGym(f.gym);
        setStartDate(f.startDate);
        setEndDate(f.endDate);
        setArchived(f.archived);
        onAdvSearch(presetToSearch(f));
        toast(`Applied preset "${preset.name}"`, {autoClose: 2000});
    };

    const saveCurrentAsPreset = () => {
        const name = newPresetName.trim();
        if (!name) {
            toast.error("Enter a name for the preset", {autoClose: 2000});
            return;
        }
        const filter: PresetFilter = {
            type, lowerDifficulty, upperDifficulty, color, gym, startDate, endDate, archived,
        };
        const exists = presets.some(p => p.name === name);
        const next = upsertPreset(presets, {name, filter});
        setPresets(next);
        savePresets(next);
        setSelectedPreset(name);
        setNewPresetName("");
        toast(exists ? `Updated preset "${name}"` : `Saved preset "${name}"`, {autoClose: 2000});
    };

    const deletePreset = (name: string) => {
        const next = removePreset(presets, name);
        setPresets(next);
        savePresets(next);
        if (selectedPreset === name) setSelectedPreset("");
        toast(`Deleted preset "${name}"`, {autoClose: 2000});
    };

    return (
        <div className={`advanced-search-bar ${filter ? 'show' : 'hidden'}`}>
            <form action={advancedSearch} className={'filter'}>
                <div className={'filter-presets'}>
                    <label className={'preset-select'}>
                        <p>Preset</p>
                        <select
                            value={selectedPreset}
                            onChange={e => applyPreset(e.target.value)}
                        >
                            <option value="">-- Select a preset --</option>
                            {presets.map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                        {selectedPreset && (
                            <button
                                type="button"
                                className={'preset-delete'}
                                aria-label={`Delete preset ${selectedPreset}`}
                                onClick={() => deletePreset(selectedPreset)}
                            >
                                Delete
                            </button>
                        )}
                    </label>
                    <label className={'preset-save'}>
                        <p>Save as Preset</p>
                        <input
                            type="text"
                            placeholder="e.g. My boulder warmups"
                            value={newPresetName}
                            onChange={e => setNewPresetName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    saveCurrentAsPreset();
                                }
                            }}
                        />
                        <button type="button" onClick={saveCurrentAsPreset}>Save</button>
                    </label>
                </div>
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
                        <select name="lowerDifficulty" value={lowerDifficulty}
                                onChange={(e) => setLowerDifficulty(e.target.value)}>
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option key={"filter.lower." + boulder} value={boulder}>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter.lower." + grade}>{grade}</option>)))}
                        </select>
                        to
                        <select name="upperDifficulty" value={upperDifficulty}
                                onChange={(e) => setUpperDifficulty(e.target.value)}>
                            {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (
                                    <option key={"filter.upper." + boulder} value={boulder}>{boulder}</option>))) :
                                (Object.keys(ROPE_GRADES).map((grade) => (
                                    <option value={grade} key={"filter.upper." + grade}>{grade}</option>)))}
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
                        setLowerDifficulty("VB");
                        setUpperDifficulty("V17");
                        setColor("Any");
                        setStartDate("");
                        setEndDate("");
                        setGym("Any");
                        setArchived(false);
                        setSelectedPreset("");
                        onAdvSearch(undefined);
                    }}>Clear Filters
                    </button>
                </div>

            </form>

        </div>);
}
