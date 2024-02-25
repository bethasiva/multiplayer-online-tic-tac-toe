import { Request, Response } from "express";
import { CustomSession } from "../../types";
import { sqlPool } from "../../models";
import { RowDataPacket } from "mysql2/promise";

export default async (req: Request, res: Response) => {
	const connection = await sqlPool.getConnection();
	try {
		const success = (req.session as CustomSession).success;
		delete (req.session as CustomSession).success;
		const username = (req.session as CustomSession).username;
		const getUserQuery = "SELECT * FROM player_results WHERE username = ? ORDER BY timestamp DESC";
		let [gameDetails] = await connection.execute<RowDataPacket[]>(getUserQuery, [username]);

		if (!Array.isArray(gameDetails)) {
			gameDetails = [];
		}
		return res.render("home", { gameDetails, success, username });
	} catch (error) {
		console.log(`Something went wrong. ${error}`);	
		return res.render("home", { error: 'Something went wrong on the server' });
	}
	finally{
		connection.release();
	}
};
