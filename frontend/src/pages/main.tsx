import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router";
import {useEffect, useState} from "react";
import type {Session} from "@supabase/supabase-js";
import { supabaseClient} from "../util/supabaseClient.ts";
import LoginPage from "./login.tsx";
import ProtectedRoute from "./../components/ProtectedRoute";

import Home from "./home.tsx";
import LogClimb from "./newclimb.tsx";
import Profile from "./profile.tsx";
import Snake from "./snake.tsx";

function Root() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabaseClient.auth.getSession().then(({data: {session}}) => {
            setSession(session);
            setLoading(false);
        });

        const {data: {subscription}} = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div> Loading...</div>

    return (<BrowserRouter>
        <Routes>
            <Route index element={<LoginPage/>}/>
            <Route
                path="/home"
                element={
                    <ProtectedRoute session={session}>
                        <Home/>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/logclimb"
                element={
                    <ProtectedRoute session={session}>
                        <LogClimb/>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute session={session}>
                        <Profile/>
                    </ProtectedRoute>
                }
            />
            <Route path="/snake" element={<Snake/>}/>
        </Routes>
    </BrowserRouter>);

}

createRoot(document.getElementById('root')!).render(<Root/>);