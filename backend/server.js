const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

let hosts = {}; // { socketId: { id, name, gameStarted: false } }
let players = {}; // { socketId: { name, state, levers, hostId } }
let usedColors = new Set();
let activeRules = {}; // { playerId: rule }

const availableColors = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Orange",
  "Pink",
  "Brown",
  "Cyan",
  "Magenta",
  "Teal",
  "Lime",
];

function assignLevers(numLevers = 4) {
  const remaining = availableColors.filter((c) => !usedColors.has(c));
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numLevers);
  selected.forEach((color) => usedColors.add(color));
  return selected;
}

function generateRuleForPlayer(playerId) {
  const player = players[playerId];
  if (!player) return null;

  const allColors = Array.from(usedColors);
  const shuffled = allColors.sort(() => Math.random() - 0.5);

  const dependent =
    player.levers[Math.floor(Math.random() * player.levers.length)];
  const requires = shuffled.find((c) => c !== dependent);
  if (!requires) return null;

  return { requires, dependent };
}

function removePlayer(socketId) {
  if (players[socketId]) {
    const levers = players[socketId].levers || [];
    levers.forEach((c) => usedColors.delete(c));
    delete players[socketId];
    delete activeRules[socketId];
  }

  if (hosts[socketId]) {
    delete hosts[socketId];
  }

  io.emit("host-list", Object.values(hosts));
  io.emit("players", { players, rules: activeRules });
}

function runGameRules() {
  for (const [playerId, rule] of Object.entries(activeRules)) {
    const { requires, dependent } = rule;

    let requiresState = null;
    let dependentIndex = -1;

    for (const player of Object.values(players)) {
      const reqIdx = player.levers.indexOf(requires);
      if (reqIdx !== -1) {
        requiresState = player.state[reqIdx];
      }
    }

    const depPlayer = players[playerId];
    if (!depPlayer) continue;
    dependentIndex = depPlayer.levers.indexOf(dependent);

    if (
      requiresState === false &&
      dependentIndex !== -1 &&
      depPlayer.state[dependentIndex] === true
    ) {
      console.log("🔒 Rule broken for", playerId);

      // Reset the dependent lever
      depPlayer.state[dependentIndex] = false;

      io.to(playerId).emit("violation", {
        message: `${dependent} lever cannot be ON unless ${requires} is also ON.`,
      });

      io.emit("players", { players, rules: activeRules });
    }
  }
}

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("host-game", (name) => {
    const displayName = name || `Host ${socket.id.slice(-4)}`;
    const levers = assignLevers();
    hosts[socket.id] = {
      id: socket.id,
      name: displayName,
      gameStarted: false,
    };
    players[socket.id] = {
      name: displayName,
      state: [false, false, false, false],
      levers,
      hostId: socket.id,
    };
    io.emit("host-list", Object.values(hosts));
    io.emit("players", { players, rules: activeRules });
  });

  socket.on("find-hosts", () => {
    socket.emit("host-list", Object.values(hosts));
  });

  socket.on("join-host", ({ hostId, name }) => {
    const displayName = name || `Player ${socket.id.slice(-4)}`;
    const levers = assignLevers();
    players[socket.id] = {
      name: displayName,
      state: [false, false, false, false],
      levers,
      hostId,
    };
    io.emit("players", { players, rules: activeRules });
  });

  socket.on("start-game", () => {
    if (hosts[socket.id]) {
      hosts[socket.id].gameStarted = true;

      for (const [id, player] of Object.entries(players)) {
        if (player.hostId === socket.id || id === socket.id) {
          const rule = generateRuleForPlayer(id);
          if (rule) {
            activeRules[id] = rule;
            io.to(id).emit("start-game", { rule });
          }
        }
      }

      io.emit("host-list", Object.values(hosts));
      io.emit("players", { players, rules: activeRules });
    }
  });

  socket.on("reset-all", () => {
    console.log("Received RESET request from", socket.id);

    hosts = {};
    players = {};
    usedColors = new Set();
    activeRules = {};

    io.emit("host-list", []);
    io.emit("players", {});
  });

  socket.on("updateState", (state) => {
    if (players[socket.id]) {
      players[socket.id].state = state;
      runGameRules();
      io.emit("players", { players, rules: activeRules });
    }
  });

  socket.on("leave-game", () => {
    console.log("Leave game:", socket.id);
    removePlayer(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    removePlayer(socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
