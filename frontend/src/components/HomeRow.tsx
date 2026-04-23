import {type NavigateFunction, useNavigate} from "react-router-dom";
import '../pages/styles/homerow.css'
import NotificationBell from "./NotificationBell.tsx";


export default function HomeRow() {
    const navigate: NavigateFunction = useNavigate();
    return (
        <div className={'home-row'}>
            <div className={'home-button'} onClick={() => navigate("/home")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                     className="bi bi-house" viewBox="0 0 16 16" >
                    <path
                        d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
                </svg>
                <p>Home</p>
            </div>
            <div className={'add-button'} onClick={() => navigate("/logclimb")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                     className="bi bi-plus" viewBox="0 0 16 16" >
                    <path
                        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                </svg>
                <p>Add Climb</p>
            </div>
            <NotificationBell/>
            <div className={'profile-button'} onClick={() => navigate("/profile")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor"
                     className="bi bi-person" viewBox="0 0 16 16" >
                    <path
                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                </svg>
                <p>Profile</p>
            </div>
        </div>
    );
}