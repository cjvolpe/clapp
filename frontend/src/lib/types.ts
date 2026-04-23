export interface Climb {
    name: string;
    difficulty: string;
    type: string;
    color: string;
    setter: string;
    dateSet: Date;
    gym: string;
    picture: string;
    archived: boolean;
    claimed: boolean;

}

export interface Search {
    lowerDifficulty: string;
    upperDifficulty: string;
    type: string;
    color: string;
    startDate: Date;
    endDate: Date;
    gym: string;
    archived: boolean;
}

export interface Log {
    user: string;
    climb: number;
}

export interface LeaderboardEntry {
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    count: number;
}

export const BACKEND_URL: string = 'http://localhost:8000';
export const FRONTEND_URL: string = 'http://localhost:5173';

export const ROPE_GRADES: Record<string, number> = {
    "5.5": 5.55, "5.5+": 5.6,
    "5.6-": 5.6, "5.6": 5.65, "5.6+": 5.7,
    "5.7-": 5.7, "5.7": 5.75, "5.7+": 5.8,
    "5.8-": 5.8, "5.8": 5.85, "5.8+": 5.9,
    "5.9-": 5.9, "5.9": 5.95, "5.9+": 6.0,
    "5.10-": 10.1, "5.10a": 10.1, "5.10b": 10.2, "5.10": 10.25, "5.10c": 10.3, "5.10d": 10.4, "5.10+": 10.4,
    "5.11-": 11.1, "5.11a": 11.1, "5.11b": 11.2, "5.11": 11.25, "5.11c": 11.3, "5.11d": 11.4, "5.11+": 11.4,
    "5.12-": 12.1, "5.12a": 12.1, "5.12b": 12.2, "5.12": 12.25, "5.12c": 12.3, "5.12d": 12.4, "5.12+": 12.4,
    "5.13-": 13.1, "5.13a": 13.1, "5.13b": 13.2, "5.13": 13.25, "5.13c": 13.3, "5.13d": 13.4, "5.13+": 13.4,
    "5.14-": 14.1, "5.14a": 14.1, "5.14b": 14.2, "5.14": 14.25, "5.14c": 14.3, "5.14d": 14.4, "5.14+": 14.4,
    "5.15-": 15.1, "5.15a": 15.1, "5.15b": 15.2, "5.15": 15.25, "5.15c": 15.3, "5.15d": 15.4, "5.15+": 15.4
};


export const BOULDER_GRADES: Record<string, number> = {
    "VB": 19.0,
    "V0-": 19.7, "V0": 20.0, "V0+": 20.3,
    "V1-": 20.7, "V1": 21.0, "V1+": 21.3,
    "V2-": 21.7, "V2": 22.0, "V2+": 22.3,
    "V3-": 22.7, "V3": 23.0, "V3+": 23.3,
    "V4-": 23.7, "V4": 24.0, "V4+": 24.3,
    "V5-": 24.7, "V5": 25.0, "V5+": 25.3,
    "V6-": 25.7, "V6": 26.0, "V6+": 26.3,
    "V7-": 26.7, "V7": 27.0, "V7+": 27.3,
    "V8-": 27.7, "V8": 28.0, "V8+": 28.3,
    "V9-": 28.7, "V9": 29.0, "V9+": 29.3,
    "V10-": 29.7, "V10": 30.0, "V10+": 30.3,
    "V11-": 30.7, "V11": 31.0, "V11+": 31.3,
    "V12-": 31.7, "V12": 32.0, "V12+": 32.3,
    "V13-": 32.7, "V13": 33.0, "V13+": 33.3,
    "V14-": 33.7, "V14": 34.0, "V14+": 34.3,
    "V15-": 34.7, "V15": 35.0, "V15+": 35.3,
    "V16": 36.0,
    "V17": 37.0
};

export const ROUTE_COLORS: Record<string, string> = {
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "White": "#FFFFFF",
    "Black": "#000000",
    "Teal": "#008080",
    "Green": "#008000",
    "Lime": "#00FF00",
    "Orange": "#ff7100",
    "Purple": "#800080",
    "Pink": "#FF6EC7",
    "Wood": "#966F33",
    "Burnt Wood": "#5A3A22",
    "Brown": "#D2B48C",
    "Chartreuse": "#D9FF36",
    "Turquoise": "#40E0D0",
    "Marble": "#F2F2F2",
    "Yellow": "#FFC700"
};

export interface Success<T> {
    success: true;
    data: T;
}

export interface Failure {
    success: false;
    error: Error;
    code?: number;
}

export interface SuccessReply<T> {
    success: true;
    data: T;
}

export interface FailureReply {
    success: false;
    error: string;
    message: string;
}

export type BaseReply<T> = SuccessReply<T> | FailureReply;
export type Process<T> = Success<T> | Failure;
export type Task = Process<void>;

export interface ReplyConfig<T> {
    reply: BaseReply<T>;
    code: number;
}