import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"
import HomeRow from "../components/HomeRow.tsx";
import {useState} from "react";

export default function Home() {
    const {climbs, setClimbs} = useState();
    const {loading, setLoading} = useState(false);

    async function fetchClimbs(): Promise<void> {
        const response = await fetch("http//localhost:8000/featured", {
            method: "GET",
            body: JSON.stringify({})
        })
        const data = await reponse.json();
        setClimbs(data);

    }


    //
    // async function submitFilters() {
    //     const respond = await fetch("http://localhost:8000/newclimbs", {
    //         method: "POST",
    //         body: JSON.stringify({
    //
    //         })
    //     })
    //    
    //     const data = await respond.json()
    //
    //     setState(data)
    // }


    return (<div className={'home-page'}>
        <SearchBar/>
<p>{climbs}</p>
        <HomeRow/>
    </div>)
}