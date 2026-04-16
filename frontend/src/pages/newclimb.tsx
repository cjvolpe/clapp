import "./styles/newclimb.css"
import HomeRow from "../components/HomeRow.tsx";
import {BOULDER_GRADES, type Climb, ROPE_GRADES, ROUTE_COLORS} from "../lib/types.ts";
import {useState} from "react";

export default function NewClimb() {
    const [type, setType] = useState("Boulder");
    // const [color, setColor] = useState("Red");
    const addClimbAction = async (formData: FormData) => {
        const newClimb = {
            name: formData.get('name') as string,
            difficulty: formData.get('difficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            setter: formData.get('setter') as string,
            dateSet: formData.get('dateSet') as Date,
            gym: formData.get('gym') as string,
        }
        console.log(newClimb)
        await fetch("http://localhost:8000/climbs", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newClimb),
        });

    };


    return (<div className={'add-page'}>
        <h1>Add New Climb</h1>
        <form action={addClimbAction}>
            <label>Climb Name:
                <br/>
                <input
                    type="text"
                    name="name"
                    placeholder="Type here"
                    required={true}
                />
            </label>
            <br/>
            <label>What type of climb is it:
                <br/>
                <select name="type" onChange={e => setType(e.target.value)} required={true} defaultValue={"Boulder"}>
                    <option value={"Boulder"}>Boulder</option>
                    <option value={"Top Rope"}>Top Rope</option>
                </select>
            </label>
            <br/>
            <label>What is the Climb Difficulty:
                <br/>
                <select name="difficulty" required={true}>
                    {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (<option>{boulder}</option>))) :
                        (Object.keys(ROPE_GRADES).map((grade) => (<option value={grade}>{grade}</option>)))}
                </select>
            </label>
            <br/>
            <label>What color are the holds?:
                <br/>
                <select name="color" required={true}>
                    {Object.keys(ROUTE_COLORS).map((color) => (<option value={color}>{color}</option>))}
                </select>
            </label>
            <br/>
            <label>Who set the climb:
                <br/>
                <input
                    type="text"
                    name="setter"
                    placeholder="Type here"
                    required={true}
                />
            </label>
            <br/>
            <label>When was the climb set:
                <br />
                <input
                    type="date"
                    name="dateSet"
                    placeholder="Enter Date"
                />
            </label>
            <br />
            <label>Which gym is the climb in:
                <br/>
                <select name="gym" required={true} defaultValue={"Fetzer"}>
                    <option value={"Fetzer"}>Fetzer</option>
                    <option value={"Ram's Head"}>Ram's Head</option>
                </select>
            </label>
            <br/>
            <button type="submit">Submit</button>
        </form>
        <HomeRow/>
    </div>)
}