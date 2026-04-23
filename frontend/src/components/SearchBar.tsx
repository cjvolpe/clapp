import {useEffect, useState} from "react";
import "./../pages/styles/SearchBar.css";

interface SearchBarProps {
    onSearch: (query: string | null) => void;
    onFilter: () => void;
    filtering: boolean;
}

export default function SearchBar({onSearch, onFilter, filtering}: SearchBarProps) {
    const [search, setSearch] = useState('');

    useEffect(() => {
        const searchAction = async () => {

            console.log('search', search);
            if (search === "") {
                onSearch(null);
            } else {
                onSearch(search);
            }
        };
        searchAction();
    }, [search]);


    return (
        <div className={"search-bar"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search"
                 viewBox="0 0 16 16">
                <path
                    d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
            <form>
                <br/>
                <input
                    type="search"
                    name="search"
                    placeholder="Search by Route Name or Setter"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }}
                />
            </form>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                 className={`filter ${filtering ? 'enabled' : ''}`}
                 onClick={onFilter}
                 viewBox="0 0 16 16">
                <path
                    d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5"/>
            </svg>
        </div>
    )
}