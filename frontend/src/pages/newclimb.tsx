import "./styles/newclimb.css"
import HomeRow from "../components/HomeRow.tsx";
import {BACKEND_URL, BOULDER_GRADES, ROPE_GRADES, ROUTE_COLORS} from "../lib/types.ts";
import {useState} from "react";
import {toast, ToastContainer} from "react-toastify";

export default function NewClimb() {
    const [type, setType] = useState("Boulder");
    const [color, setColor] = useState("Red");
    const addClimbAction = async (formData: FormData) => {
        const newClimb = {
            name: formData.get('name') as string,
            difficulty: formData.get('difficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            setter: formData.get('setter') as string,
            dateSet: formData.get('dateSet') as string,
            gym: formData.get('gym') as string,
        }
        console.log(newClimb)
        const data = await fetch(`${BACKEND_URL}/climbs/new`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newClimb),
        });
        const response = await data.json();
        if (response.success) {
            toast("Climb successfully added!", {autoClose: 2500});
        } else {
            toast.error("Failed to Log Climb", {autoClose: 2500});
        }

    };


    return (<div className={'add-page'}>
        <h1>Add New Climb</h1>
        <ToastContainer className={'toast'}/>
        <form action={addClimbAction} className={'add-form'}>
            <div className={'add-form-fields'}>
            <label>
                <p>Climb Name:</p>
                <input
                    type="text"
                    name="name"
                    placeholder="Type here"
                    required={true}
                />
            </label>

            <label>
                <p>What type of climb is it:</p>
                <select name="type" onChange={e => setType(e.target.value)} required={true} defaultValue={"Boulder"}>
                    <option value={"Boulder"}>Boulder</option>
                    <option value={"Top Rope"}>Top Rope</option>
                </select>
            </label>

            <label>
                <p>What is the Climb Difficulty:</p>
                <select name="difficulty" required={true}>
                    {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (<option>{boulder}</option>))) :
                        (Object.keys(ROPE_GRADES).map((grade) => (<option value={grade}>{grade}</option>)))}
                </select>
            </label>

            <label>
                <p>What color are the holds?:</p>
                <div className={'color-container'}>
                    <select name="color" required={true} onChange={e => setColor(e.target.value)}>
                        {Object.keys(ROUTE_COLORS).map((color) => (<option value={color}>{color}</option>))}
                    </select>
                    <div className={"cooler-circle"} style={{backgroundColor: ROUTE_COLORS[color]}}></div>
                </div>


            </label>

            <label>
                <p>Who set the climb:</p>
                <input
                    type="text"
                    name="setter"
                    placeholder="Type here"
                    required={true}
                />
            </label>

            <label>
                <p>When was the climb set:</p>
                <input
                    type="date"
                    name="dateSet"
                    placeholder="Enter Date"
                />
            </label>

            <label>
                <p>Which gym is the climb in:</p>
                <select name="gym" required={true} defaultValue={"Fetzer"}>
                    <option value={"Fetzer"}>Fetzer</option>
                    <option value={"Ram's Head"}>Ram's Head</option>
                </select>
            </label>
            </div>

            <button className={'add-form-button'} type="submit">Submit</button>
        </form>
        <HomeRow/>
    </div>)
}