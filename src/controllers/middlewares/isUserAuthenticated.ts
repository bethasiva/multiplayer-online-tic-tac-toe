import { NextFunction, Request, Response } from "express";
import { CustomSession } from "../../types";

export default (req: Request, res: Response, next: NextFunction) => {
	const username = (req.session as CustomSession).username;

	console.log((req.session as CustomSession).username);

	if (username && req.path !== "/") {
		return res.redirect(303, "/");
	} else if (!username && req.path === "/") {
		return res.redirect(303, "/signin");
	}

	next();
};
