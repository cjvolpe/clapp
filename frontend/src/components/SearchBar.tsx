import {useState} from "react";
import "./../pages/styles/SearchBar.css";
import {BACKEND_URL} from "../lib/types.ts";

export default function SearchBar({onSearch}) {
    const [search, setSearch] = useState('');
    const searchAction = async () => {
        if (search === "") {

        }

        const searchResults = await fetch(`${BACKEND_URL}/climbs/search`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({search: search}),
        });
        const data = await searchResults.json();
        console.log('search', data);
        if (search === "") {
            onSearch(null);
        } else {
            onSearch(data);
        }
    };


    return (
        <div className={"search-bar"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search"
                 viewBox="0 0 16 16">
                <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
            <form action={searchAction}>
                <br/>
                <input
                    type="search"
                    name="search"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </form>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-filter"
                 viewBox="0 0 16 16">
                <path
                    d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>
        </div>
    )
}