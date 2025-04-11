// server.js

const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

let hosts = {}; // { socketId: { id, name, players: [] } }
let players = {}; // { socketId: { name, state } }

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Host creates game
  socket.on("host-game", (name) => {
    const displayName = name || `Host ${socket.id.slice(-4)}`;
    hosts[socket.id] = { id: socket.id, name: displayName, players: [] };
    players[socket.id] = { name: displayName, state: [false, false] };
    io.emit("host-list", Object.values(hosts));
  });

  // Show list of hosts to joining players
  socket.on("find-hosts", () => {
    socket.emit("host-list", Object.values(hosts));
  });

  // Player joins a host
  socket.on("join-host", ({ hostId, name }) => {
    const displayName = name || `Player ${socket.id.slice(-4)}`;
    console.log(`${socket.id} is joining host ${hostId} as ${displayName}`);
    players[socket.id] = { name: displayName, state: [false, false] };

    if (hosts[hostId]) {
      hosts[hostId].players.push(socket.id);
      io.to(hostId).emit("players", getPlayersForHost(hostId));
    }

    // Notify player to wait (host will start the game)
    io.to(socket.id).emit("joined-lobby");
  });

  // Host starts the game
  socket.on("start-game", () => {
    const host = hosts[socket.id];
    if (host) {
      [socket.id, ...host.players].forEach((id) => {
        io.to(id).emit("start-game");
      });
    }
  });

  // Players press buttons
  socket.on("updateState", (state) => {
    if (players[socket.id]) {
      players[socket.id].state = state;
      io.emit("players", players);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // Remove host and their players
    if (hosts[socket.id]) {
      const hostPlayers = hosts[socket.id].players || [];
      hostPlayers.forEach((pid) => delete players[pid]);
      delete players[socket.id];
      delete hosts[socket.id];
      io.emit("host-list", Object.values(hosts));
    }

    // Remove standalone player
    if (players[socket.id]) {
      delete players[socket.id];
      io.emit("players", players);
    }
  });
});

function getPlayersForHost(hostId) {
  const host = hosts[hostId];
  if (!host) return {};
  const all = {};
  [hostId, ...host.players].forEach((id) => {
    all[id] = players[id];
  });
  return all;
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
