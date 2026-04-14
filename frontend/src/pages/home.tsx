import SearchBar from "../components/SearchBar.tsx";
import "./styles/home.css"

export default function Home() {


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
    </div>)
}