import {useEffect, useState} from "react";
import type {User} from "@supabase/supabase-js";
import {supabaseClient} from "../util/supabaseClient.ts";
import {BACKEND_URL, type Notification} from "../lib/types.ts";
import HomeRow from "../components/HomeRow.tsx";
import "./styles/notifications.css";

function formatTimeAgo(iso: string): string {
    const created = new Date(iso).getTime();
    const diffSeconds = Math.max(0, Math.floor((Date.now() - created) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(iso).toLocaleDateString();
}

export default function Notifications() {
    const [user, setUser] = useState<User>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const {data: {user}} = await supabaseClient.auth.getUser();
            setUser(user ?? undefined);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${BACKEND_URL}/notifications/${user.id}`);
                const payload = await response.json();
                if (payload.success) {
                    setNotifications(payload.data as Notification[]);
                }
            } catch (error) {
                console.log("Failed to fetch notifications", error);
            }
            setLoading(false);
        };
        fetchNotifications();
    }, [user]);

    const markRead = async (id: number) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? {...n, read: true} : n)));
        try {
            await fetch(`${BACKEND_URL}/notifications/${id}/read`, {method: "PATCH"});
        } catch (error) {
            console.log("Failed to mark notification as read", error);
        }
    };

    const markAllRead = async () => {
        if (!user?.id) return;
        setNotifications((prev) => prev.map((n) => ({...n, read: true})));
        try {
            await fetch(`${BACKEND_URL}/notifications/${user.id}/read-all`, {method: "PATCH"});
        } catch (error) {
            console.log("Failed to mark all notifications as read", error);
        }
    };

    const hasUnread = notifications.some((n) => !n.read);

    return (
        <>
            <div className={'notifications-page'}>
                <div className={'notifications-heading'}>
                    <h1>Notifications</h1>
                    <button
                        className={'mark-all-read'}
                        onClick={markAllRead}
                        disabled={!hasUnread}
                    >
                        Mark all read
                    </button>
                </div>

                <div className={'notifications-list'}>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.read ? '' : 'unread'}`}
                                onClick={() => !notification.read && markRead(notification.id)}
                            >
                                <div className={'notification-content'}>
                                    <h3>{notification.title}</h3>
                                    {notification.body && <p>{notification.body}</p>}
                                    <span className={'notification-time'}>
                                        {formatTimeAgo(notification.created_at)}
                                    </span>
                                </div>
                                {!notification.read && <div className={'unread-dot'}/>}
                            </div>
                        ))
                    ) : (
                        loading ? <p>Loading...</p> : <p>No notifications yet</p>
                    )}
                </div>
            </div>
            <HomeRow/>
        </>
    );
}
