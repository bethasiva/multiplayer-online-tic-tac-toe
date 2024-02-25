import { Session } from "express-session";
import { Request } from "express";

export interface CustomSession extends Session {
	success?: string;
	error?: string;
	username?: string;
}

export interface CustomRequest extends Request {
	isValidData?: boolean;
	isAuthenticated?: boolean;
	userId: string;
}

export interface WinnerData {
	roomId: string;
	winner: string;
	username: string;
}
