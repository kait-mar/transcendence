import { type } from "os";

declare namespace NodeJs{
    export interface  ProcessEnv{
    PG_DB_Host?: string;
    PG_DB_PORT?: string;
    PG_DB_USER?: string;
    PG_DB_PASS?: string;
    PG_DB_NAME?: string;
    PORT?: string;
    ENVIRONMENT?: Environment,
    INTRA_CLIENT_ID?: string;
    INTRA_CLIENT_SECRET?: string;
    INTRA_CALLBACK_URL?: string;
    IP_ADDRESS?:string;
    REACT_APP_IP_ADDRESS?:string;
    PORT_REACT?:string;
    PORT_NEST?:string;
    }
    export type ENVIRONMENT = 'DEVLOPMENT' | 'PRODUCTION' | 'TEST'
}

// declare module 'passport-42'