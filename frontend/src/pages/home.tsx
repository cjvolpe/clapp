import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"
import HomeRow from "../components/HomeRow.tsx";
import {useEffect, useState} from "react";
import ClimbElement from "../components/ClimbElement.tsx";

export default function Home() {
    const [climbs, setClimbs] = useState<any[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);


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
        fetchClimbs();
    }, []);
    const onSearch = (data) => {
        setLoading(true);
        if(data===null){
            console.log("No featured climbs found");
            setClimbs(featured);
        }else{
            setClimbs(data.data);
        }
        setLoading(false);
    };
    return (<div className={'home-page'}>
        <SearchBar onSearch={onSearch}/>
        <div className={"climbs"}>
            {climbs.length > 0 ? (climbs.map((climb) => (
                    <ClimbElement key={climb.id} climb={climb}/>
                ))
            ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}
        </div>
        <HomeRow/>
    </div>);
}