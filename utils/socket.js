import { io } from 'socket.io-client';

// Replace with your computer’s local IP address
const socket = io('http://10.128.140.66:3000');

export default socket;
