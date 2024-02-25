import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types";

export default function validateForm(fields: string[]) {
	return function (req: Request, res: Response, next: NextFunction) {
		const missingFields: string[] = [];

		fields.forEach((field) => {
			if (!req.body[field]) {
				missingFields.push(field);
			}
		});

		if (missingFields.length > 0) {
			return res.render(req.path.substring(1), {
				error: "All fields must not be empty.",
			});
		}

		(req as CustomRequest).isValidData = true;

		next();
	};
}
