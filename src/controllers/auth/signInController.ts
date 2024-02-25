import { Request, Response } from "express";
import { CustomRequest, CustomSession } from "../../types";
import { sqlPool } from "../../models";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";

export default async (req: Request, res: Response) => {
	const success = (req.session as CustomSession).success;
	const error = (req.session as CustomSession).error;

	if (success) {
		delete (req.session as CustomSession).success;
	} else if (error) {
		delete (req.session as CustomSession).error;
	}

	if ((req as CustomRequest).isValidData) {
		const connection = await sqlPool.getConnection();

		try {			
			let {username, password} = req.body;
			username = username.toLowerCase();
			const getUserQuery = "SELECT * FROM players WHERE username = ?";
			const [user] = await connection.execute<RowDataPacket[]>(getUserQuery,[username]);			
			
			if (!user[0]) {
				(req.session as CustomSession).error = "User does not exists.Please Signup.";
				return res.redirect(303, "/signup");
			}

			const match = await bcrypt.compare(password,user[0].password);			
			if(!match){
				return res.render("signin", { error: "Invalid username or password" });
			}

			(req.session as CustomSession).username = username.toLowerCase();
			(req.session as CustomSession).success = "Authentication successful!";
			return res.redirect(303, "/");
		} catch (error) {
			console.log(`Signin failed. ${error}`);
			return res.render("signin", { error: "Something went wrong.Please try again after sometime." });
		}finally {
			connection.release();
		}
	}

	res.render("signin", { success, error });
}
