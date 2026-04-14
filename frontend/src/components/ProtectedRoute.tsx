import {Navigate, type Session, useLocation} from 'react-router-dom';

interface ProtectedRouteProps {
    session: Session;
    children: React.ReactNode;
}

export default function ProtectedRoute({session, children}: ProtectedRouteProps) {
    const location = useLocation();

    if (!session) {
        return <Navigate to="/" state={{from: location}} replace/>;
    }

    return <>{children}</>;
}