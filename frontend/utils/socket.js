import { io } from "socket.io-client";

const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000");

// console.log(socket);
export default socket;