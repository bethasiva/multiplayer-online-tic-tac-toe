// Define CREATE TABLE queries for each table
export default [
	`
    CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL
    );    
    `,
	`
    CREATE TABLE IF NOT EXISTS player_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        room_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        winner VARCHAR(50) NOT NULL
    );    
    `,
];
