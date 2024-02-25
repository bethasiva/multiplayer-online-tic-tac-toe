import { Request, Response } from "express";

export default (req: Request, res: Response) => {
	req.session.destroy((error) => {
		if (error) {
			console.log(`Something went wrong.${error}`);
		}

		res.redirect(303, "/signin");
	});
};
