import "./styles/profile.css"
import HomeRow from "../components/HomeRow.tsx";
import {supabaseClient} from "../util/supabaseClient.ts";
import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import ClimbElement from "../components/ClimbElement.tsx";
import './styles/profile.css'
import {BACKEND_URL} from "../lib/types.ts";

export default function Profile() {
    const [user, setUser] = useState<User>();
    const [climbs, setClimbs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            const fetchUser = async () => {
                const {data: {user}} = await supabaseClient.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }
                setUser(user);
                setLoading(true);
                const response = await fetch(`${BACKEND_URL}/climbs/logged/${user.id}`);
                const data = await response.json();
                if (data.success) setClimbs(data.data);
                setLoading(false);
                console.log("sdfa", climbs);
            }
            fetchUser();
        }, []
    );

    useEffect(() => {
        if (!user?.id) return;

        const fetchClimbs = async () => {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/climbs/logged/${user.id}`);
            const data = await response.json();
            if (data.success) setClimbs(data.data);
            setLoading(false);
            console.log("sdfa", climbs);
        }
        fetchClimbs();
    }, [user]);

    const avatarUrl = user?.user_metadata?.avatar_url;
    const userName = user?.user_metadata?.name;
    return (<>
            <div className={'profile-page'}>

                <div className={'heading'}>
                    <div className={'user-info'}>
                        <img className={"profile-picture"} src={avatarUrl} alt={"user's profile picture"}/>
                        <h1>{userName}</h1>
                    </div>
                    <h1 className={"completed-climbs"}>Completed Climbs</h1>
                </div>

                <div className={'logged-climbs'}>

                    <div className={"climbs-profile"}>
                        {climbs.length > 0 ? (climbs.map((climb) => (
                                <ClimbElement key={climb.id} climbId={climb.climbs?.id ?? climb.id} jsonClimb={climb.climbs} onLog={() => {
                                }} isSelected={false} userId={user?.id}/>
                            ))
                        ) : (loading ? (<p>Loading...</p>) : (<p>No climbs found</p>))}
                    </div>
                </div>

            </div>
            <HomeRow/>
        </>
    );
}