import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import ClimbElement from "../components/ClimbElement.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import type {User} from "@supabase/supabase-js";

export default function Home() {
    const [climbs, setClimbs] = useState<any[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<any>();
    const [user, setUser] = useState<User>();


    useEffect(() => {
        const fetchClimbs = async () => {
            setLoading(true);
            const response = await fetch("http://localhost:8000/featured");
            const data = await response.json();
            if (data.success) {
                setClimbs(data.data);
                setFeatured(data.data);
            } else {
                console.log("Failed to fetch featured climbs: ", data.error);
            }
            setLoading(false);
            console.log(climbs);
        }
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user);
        }
        fetchClimbs();
        fetchUser();
    }, []);

    const onSearch = (data) => {
        setLoading(true);
        if (data === null) {
            console.log("No featured climbs found");
            setClimbs(featured);
        } else {
            setClimbs(data.data);
        }
        setLoading(false);
    };

    const onLog = (data) => {
        console.log(data);
        setLog(data);
    }

    const handleLogSubmit = async () => {
        if (!log) return;


        const response = await fetch("http://localhost:8000/climbs/log", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                user: user?.id,
                climb: log,
            }),
        });
        if (response.ok) {
            setLog(null);
        }
    };

    return (<div className={'home-page'}>
        <SearchBar onSearch={onSearch}/>
        <div className={"climbs"}>
            {climbs.length > 0 ? (climbs.map((climb) => (
                    <ClimbElement key={climb.id} climbId={climb.id} climb={climb} onLog={onLog} isSelected={log === climb.id}/>
                ))
            ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}

        </div>
        <button
            className="log-button"
            onClick={handleLogSubmit}
            disabled={!log}
        >
            Log Climb
        </button>
        <HomeRow/>
    </div>);
}