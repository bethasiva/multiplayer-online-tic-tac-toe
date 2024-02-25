import { Request, Response } from "express";
import { CustomSession, CustomRequest } from "../../types";
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
			let { username, password, confirm_password } = req.body;

			if (password !== confirm_password) {
				return res.render("signup", { error: "Passwords must match" });
			}

			const insertUserQuery = "INSERT INTO players (username, password) VALUES (?, ?)";
			const getUserQuery = "SELECT * FROM players WHERE username = ?";
			const [user] = await connection.execute<RowDataPacket[]>(getUserQuery,[username]);			
		
			if (user[0] && user[0].username) {
				(req.session as CustomSession).error = "User already exists.Please Login.";
				return res.redirect(303, "/signin");
			}
			
			password = await bcrypt.hash(password, 10);
			username = username.toLowerCase();
			
			// Execute SQL query to insert data into players table
			await connection.execute(insertUserQuery, [username, password]);			
			(req.session as CustomSession).success = "Sign Up successful.Please Login.";
			return res.redirect(303, "/signin");
		} catch (error) {
			console.log(`Signup failed. ${error}`);
			return res.render("signup", { error: "Something went wrong.Please try again after sometime." });
		} finally {
			connection.release();
		}
	}

	res.render("signup", { success, error });
};
