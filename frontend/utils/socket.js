import { io } from "socket.io-client";

const socket = io("wss://meltdown-rn.onrender.com");

// console.log(socket);
export default socket;
