import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { WinnerData } from "../types";
import { sqlPool } from "../models";
import { RowDataPacket } from "mysql2";

export default class WebSocket {
	private static instance: WebSocket;
	private io: SocketIOServer;
	private constructor(httpServer: HttpServer) {
		this.io = new SocketIOServer(httpServer);
	}

	public connect() {
		this.io.on("connection", (socket: Socket) => {
			this.joinRoom(socket);
			this.handleWinner(socket);
			this.leaveRoom(socket);
			this.disconnect(socket);
		});
	}

	private disconnect(socket: Socket) {
		socket.on("disconnect", () => {
			console.log(`User ${socket.id} disconnected`);
		});
	}

	private joinRoom(socket: Socket) {
		socket.on("join_room", (roomId: string) => {
			socket.join(roomId);
			console.log(`User ${socket.id} joined room ${roomId}`);
		});
	}

	private leaveRoom(socket: Socket) {
		socket.on("leave_room", (roomId: string) => {
			socket.leave(roomId);
			console.log(`User ${socket.id} left room ${roomId}`);
		});
	}

	private handleWinner(socket: Socket) {
		socket.on("store_winner_data", async ({ winner, roomId, username }: WinnerData, callback: Function) => {
				if (roomId && socket.rooms.has(roomId)) {
					const connection = await sqlPool.getConnection();
					try {
						const insertGameDetailsQuery = "INSERT INTO player_results (username, room_id, winner) VALUES (?, ?, ?)";
						const insertedDetails = await connection.execute(insertGameDetailsQuery, [username, roomId, winner]);
						const insertId = (insertedDetails[0] as any).insertId;
						const getUserQuery = "SELECT * FROM player_results WHERE username = ? AND id = ?";
						const [gameDetails] = await connection.execute<RowDataPacket[]>(getUserQuery, [username, insertId]);
						callback({ data: gameDetails[0] });
						console.log(`User ${socket.id} is in room ${roomId}.Store winner data`);
					} catch (error) {
						console.log(`Something went wrong.${error}`);
						
						callback({ error: "Something went wrong" });
					} finally {
						connection.release();
					}
				} else {
					console.log(`User ${socket.id} is not in room ${roomId}. Don't store winner data`);
				}
			},
		);
	}

	public static getInstance(httpServer: HttpServer): WebSocket {
		if (!WebSocket.instance) {
			WebSocket.instance = new WebSocket(httpServer);
		}
		return WebSocket.instance;
	}
}
