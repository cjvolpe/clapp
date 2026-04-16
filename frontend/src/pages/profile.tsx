import "./styles/profile.css"
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import ClimbElement from "../components/ClimbElement.tsx";
import './styles/profile.css'

export default function Profile() {
    const [user, setUser] = useState<User>();
    const [climbs, setClimbs] = useState<any[]>([]);
    const [loggedClimbs, setLoggedClimbs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user);
        }
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const fetchClimbs = async () => {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/climbs/logged/${user.id}`);
            const data = await response.json();
            if (data.success) setLoggedClimbs(data.data);
            setLoading(false);
            console.log("sdfa", loggedClimbs);
        }
        fetchClimbs();
    }, [user]);
//TODO: link completed climbs to the actual climb objects

    const avatarUrl = user?.user_metadata?.avatar_url;
    const userName = user?.user_metadata?.name;
    return (<>
            <div className={'profile-page'}>

                <p>profile</p>
                <div className={'user-info'}>
                    <img className={"profile-picture"} src={avatarUrl} alt={"user's profile picture"}/>
                    <h1>{userName}</h1>
                </div>
                <div className={'logged-climbs'}>
                    <h1>Completed Climbs</h1>
                    <div className={"climbs-profile"}>
                        {climbs.length > 0 ? (climbs.map((climb) => (
                                <ClimbElement key={climb.id} climbId={climb.id} climb={climb}/>
                            ))
                        ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}

                    </div>
                </div>

            </div>
            <HomeRow/>
        </>
    );
}