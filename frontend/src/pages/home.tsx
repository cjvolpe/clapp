import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import ClimbElement from "../components/ClimbElement.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import type {User} from "@supabase/supabase-js";
import {BACKEND_URL} from "../lib/types.ts";

export default function Home() {
    const [climbs, setClimbs] = useState<any[]>([]);
    const [allClimbs, setAllClimbs] = useState<any[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<any>();
    const [user, setUser] = useState<User>();


    useEffect(() => {
        const fetchClimbs = async () => {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/featured`);
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
        const fetchAllClimbs = async () => {
            const searchResults = await fetch(`${BACKEND_URL}/climbs`);
            const data = await searchResults.json();
            if (data.success) {
                console.log("all climbs: ", data.data);
                setAllClimbs(data.data);
            } else {
                console.log("Failed to fetch all climbs: ", data.error);
            }

        }
        fetchClimbs();
        fetchUser();
        fetchAllClimbs();
    }, []);
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.climb-container') && !target.closest('.log-button')) {
                setLog(null);
            }
        };
        if (log) {
            document.addEventListener("click", handleClick);
        }
        return () => {
            document.removeEventListener("click", handleClick);
        }
    }, [log]);

    const onSearch = async (query: string) => {
        setLoading(true);
        if (query === null) {
            console.log("No featured climbs found");
            setClimbs(featured);
        } else {
            const filteredClimbs = allClimbs.filter((climb) => {
                return climb.name.toLowerCase().includes(query.toLowerCase()) || climb.setter.toLowerCase().includes(query.toLowerCase());
            });
            console.log(filteredClimbs);
            setClimbs(filteredClimbs);

        }
        setLoading(false);
    };

    const onLog = (key) => {
        console.log(key);
        setLog(key);
    }

    const handleLogSubmit = async () => {
        if (!log) return;


        const response = await fetch(`${BACKEND_URL}/climbs/log`, {
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

                    <ClimbElement key={climb.id} climbId={climb.id} jsonClimb={climb} onLog={onLog}
                                  isSelected={log === climb.id}/>
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
        <div className={'home-row'}>
            <HomeRow/>
        </div>

    </div>);
}