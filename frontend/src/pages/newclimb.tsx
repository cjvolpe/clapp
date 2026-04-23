import "./styles/newclimb.css"
import HomeRow from "../components/HomeRow.tsx";
import {BACKEND_URL, BOULDER_GRADES, CLIMB_IMAGES_BUCKET, ROPE_GRADES, ROUTE_COLORS} from "../lib/types.ts";
import {useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import {supabaseClient} from "../util/supabaseClient.ts";

export default function NewClimb() {
    const [type, setType] = useState("Boulder");
    const [color, setColor] = useState("Red");
    const [picture, setPicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const onPictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setPicture(file);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
    };

    const uploadPicture = async (file: File): Promise<string | null> => {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;
        const {error: uploadError} = await supabaseClient.storage
            .from(CLIMB_IMAGES_BUCKET)
            .upload(path, file, {contentType: file.type || undefined, upsert: false});
        if (uploadError) {
            console.error("Image upload failed", uploadError);
            toast.error("Image upload failed", {autoClose: 2500});
            return null;
        }
        const {data} = supabaseClient.storage.from(CLIMB_IMAGES_BUCKET).getPublicUrl(path);
        return data.publicUrl;
    };

    const addClimbAction = async (formData: FormData) => {
        setUploading(true);
        let pictureUrl: string | null = null;
        if (picture) {
            pictureUrl = await uploadPicture(picture);
            if (!pictureUrl) {
                setUploading(false);
                return;
            }
        }
        const newClimb = {
            name: formData.get('name') as string,
            difficulty: formData.get('difficulty') as string,
            type: formData.get('type') as string,
            color: formData.get('color') as string,
            setter: formData.get('setter') as string,
            dateSet: formData.get('dateSet') as unknown as Date,
            gym: formData.get('gym') as string,
            picture: pictureUrl,
        }
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
            setPicture(null);
            setPreviewUrl(null);
        } else {
            toast.error("Failed to Log Climb", {autoClose: 2500});
        }
        setUploading(false);
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
                    {type === "Boulder" ? (Object.keys(BOULDER_GRADES).map((boulder) => (<option key={boulder}>{boulder}</option>))) :
                        (Object.keys(ROPE_GRADES).map((grade) => (<option key={grade} value={grade}>{grade}</option>)))}
                </select>
            </label>

            <label>
                <p>What color are the holds?:</p>
                <div className={'color-container'}>
                    <select name="color" required={true} onChange={e => setColor(e.target.value)}>
                        {Object.keys(ROUTE_COLORS).map((c) => (<option key={c} value={c}>{c}</option>))}
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

            <label className={'picture-field'}>
                <p>Photo of the climb (optional):</p>
                <input
                    type="file"
                    name="picture"
                    accept="image/*"
                    onChange={onPictureChange}
                />
                {previewUrl && (
                    <img className={'picture-preview'} src={previewUrl} alt={'Climb preview'}/>
                )}
            </label>
            </div>

            <button className={'add-form-button'} type="submit" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Submit'}
            </button>
        </form>
        <HomeRow/>
    </div>)
}
