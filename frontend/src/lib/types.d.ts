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
export declare const BACKEND_URL: string;
export declare const FRONTEND_URL: string;
export declare const ROPE_GRADES: Record<string, number>;
export declare const BOULDER_GRADES: Record<string, number>;
export declare const ROUTE_COLORS: Record<string, string>;
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
//# sourceMappingURL=types.d.ts.map