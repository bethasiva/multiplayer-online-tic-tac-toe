import express from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routes";
import path from "path";
import { createServer } from "http";
import session from "express-session";
import { WebSocket } from "./webSocket";
import createTables from "./models";

(async () => {
	const app = express();
	const httpServer = createServer(app);
	const sessionMiddleware = session({
		secret: "your-secret-key",
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: false, // Set to true if your application is served over HTTPS
			maxAge: 24 * 60 * 60 * 1000, // 1 day (in milliseconds)
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Same as maxAge but using a specific date/time
		},
	});

	WebSocket.getInstance(httpServer).connect();
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(sessionMiddleware);
	app.set("view engine", "ejs");

	app.set("views", path.join(__dirname, "..", "src", "views"));
	app.use(express.static(path.join(__dirname, "..", "src", "public")));
	app.use(router);

	const port = process.env.PORT;
	await createTables();
	httpServer.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
})();
