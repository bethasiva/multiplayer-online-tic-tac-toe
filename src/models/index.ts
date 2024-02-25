import mysql from "mysql2/promise";
import createTableQueries from "./tables";

// Create a connection pool
const sqlPool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// Execute CREATE TABLE queries sequentially
export default async function createTables() {
	const connection = await sqlPool.getConnection();
	try {
		if (!Array.isArray(createTableQueries)) {
			throw new Error("createTableQueries is not an array");
		}

		for (const query of createTableQueries) {
			await connection.execute(query);
		}
		console.log("Tables created successfully");
	} catch (err) {
		console.error("Error creating tables:", err);
	} finally {
		connection.release();
	}
}

export { sqlPool };
