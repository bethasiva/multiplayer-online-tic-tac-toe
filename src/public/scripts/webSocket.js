import { UUID } from "https://unpkg.com/uuidjs@^5";
export default function WebSocket() {
    this.socket = io({ autoConnect: false });
    this.roomId = '';
    this.activate();
}

WebSocket.prototype.activate = function () {
    this.connect();
}

WebSocket.prototype.joinRoom = function () {
    this.roomId = UUID.generate();
    this.socket.emit('join_room', this.roomId);
}

WebSocket.prototype.leaveRoom = function () {
    // Leave the specified room on the server
    if (this.roomId) {
        this.socket.emit('leave_room', this.roomId);
        this.roomId = '';
    }
}

WebSocket.prototype.handleWinner = function (winner, username,callback) {
    this.socket.emit('store_winner_data', { winner, roomId: this.roomId, username}, callback);
}

WebSocket.prototype.connect = function () {
    // Manually connect to the server
    this.socket.connect();
}

WebSocket.prototype.disconnect = function () {
    // Disconnect from the server
    this.socket.disconnect();
}
