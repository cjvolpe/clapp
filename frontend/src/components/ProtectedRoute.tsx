import {Navigate, useLocation} from 'react-router-dom';
import type {Session} from '@supabase/supabase-js';

interface ProtectedRouteProps {
    session: Session | null;
    children: React.ReactNode;
}

export default function ProtectedRoute({session, children}: ProtectedRouteProps) {
    const location = useLocation();

    if (!session) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return <>{children}</>;
}