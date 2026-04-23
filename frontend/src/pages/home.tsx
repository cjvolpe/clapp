import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"
import HomeRow from "../components/HomeRow.tsx";
import {startTransition, useEffect, useOptimistic, useState} from "react";
import ClimbElement from "../components/ClimbElement.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import type {User} from "@supabase/supabase-js";
import {BACKEND_URL, type Search} from "../lib/types.ts";
import FilterClimbs from "../components/FilterClimbs.tsx";
import WeatherWidget from "../components/WeatherWidget.tsx";
import {toast, ToastContainer} from "react-toastify";

export default function Home() {
    const [climbs, setClimbs] = useState<any[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<any>();
    const [user, setUser] = useState<User>();
    const [filter, setFilter] = useState<boolean>(false);
    const [advSearch, setAdvSearch] = useState();
    const [filtering, setFiltering] = useState(false);

    const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        console.log("click: ", target);
        if (!target.closest('.advanced-search-bar') && !target.closest('.search-bar')) {
            setFilter(false);
        }
        if (!target.closest('.climb-container') && !target.closest('.log-button')) {
            setLog(null);
        }
    };
    // const [optimisticClimbs, setOptimisticClimbs] = useOptimistic(climbs, (climbs) => {
    //         return climbs;
    //     }
    // );


    useEffect(() => {
        const fetchClimbs = async () => {
                setLoading(true);

            // console.log(optimisticClimbs);
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
        fetchClimbs();
        fetchUser();
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        }
    }, []);

    useEffect(() => {
        if (advSearch === undefined) {
            setClimbs(featured)
            setFiltering(false);
            return;
        }
        setLoading(true);
        setClimbs(advSearch);
        setFiltering(true);
        setLoading(false);
    }, [advSearch]);

    const onSearch = async (query: string) => {
        setLoading(true);
        if (query === null) {
            console.log("No featured climbs found");
            if (advSearch !== undefined) {
                setClimbs(advSearch);
            } else {
                setClimbs(featured);
            }
        } else {
            const filteredClimbs = climbs.filter((climb) => {
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
    const onFilter = () => {
        setFilter(!filter);

    }
    const onAdvSearch = async (body: Search) => {
        if (body === undefined) {
            setAdvSearch(undefined);
            return;
        }
        console.log("AdvSearch", body);
        const response = await fetch(`${BACKEND_URL}/climbs/search/filter`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body),
        });
        const data = await response.json();
        console.log("adv return", data);
        if (data.success) {
            setAdvSearch(data.data);
        } else {
            console.log("Failed to fetch all search results: ", data.error);
        }
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
        const data = await response.json();
        if (data.success) {
            toast("Climb Successfully Logged", {autoClose: 2500});
            setLog(null);
        } else{
            toast.error("Failed to Log Climb",{autoClose: 2500});
        }
    };

    return (<div className={'home-page'}>

        <SearchBar onSearch={onSearch} onFilter={onFilter} filtering={filtering}/>
        <FilterClimbs filter={filter} onAdvSearch={onAdvSearch}/>
        <ToastContainer className={'toast'}/>
        <WeatherWidget/>

        <div className={"climbs"}>

            {climbs.length > 0 ? (climbs.map((climb) => (

                    <ClimbElement key={climb.id} climbId={climb.id} jsonClimb={climb} onLog={onLog}
                                  isSelected={log === climb.id}/>
                ))
            ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}

        </div>

        <button
            className={`log-button ${filter ? 'hidden' : ''}`}
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