export declare const SessionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly CLOSED: "CLOSED";
};
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];
