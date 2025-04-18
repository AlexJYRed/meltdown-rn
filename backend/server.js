const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

let hosts = {}; // { socketId: { id, name, gameStarted: false } }
let players = {}; // { socketId: { name, state, levers, hostId } }
let usedColors = new Set();
let activeRules = {}; // { hostId: rule }

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

function generateRuleFromUsedColors() {
  const colorsInPlay = Array.from(usedColors);
  if (colorsInPlay.length < 2) return null;
  const shuffled = [...colorsInPlay].sort(() => Math.random() - 0.5);
  return { requires: shuffled[0], dependent: shuffled[1] };
}

function assignLevers(numLevers = 4) {
  const remaining = availableColors.filter((c) => !usedColors.has(c));
  const shuffled = [...remaining].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numLevers);
  selected.forEach((color) => usedColors.add(color));
  return selected;
}

function removePlayer(socketId) {
  if (players[socketId]) {
    const levers = players[socketId].levers || [];
    levers.forEach((c) => usedColors.delete(c));
    delete players[socketId];
  }

  if (hosts[socketId]) {
    delete hosts[socketId];
  }

  io.emit("host-list", Object.values(hosts));
  io.emit("players", { players, rules: activeRules });
}

function runGameRules() {
  for (const hostId of Object.keys(hosts)) {
    const rule = activeRules[hostId];
    if (!rule) continue;

    const { requires, dependent } = rule;

    let requiresState = null;
    let dependentPlayerId = null;
    let dependentIndex = -1;

    for (const [playerId, player] of Object.entries(players)) {
      if (player.hostId !== hostId) continue;

      const { levers, state } = player;

      const reqIdx = levers.indexOf(requires);
      if (reqIdx !== -1) {
        requiresState = state[reqIdx];
      }

      const depIdx = levers.indexOf(dependent);
      if (depIdx !== -1) {
        dependentIndex = depIdx;
        dependentPlayerId = playerId;
      }
    }

    if (
      requiresState === false &&
      dependentPlayerId &&
      dependentIndex !== -1 &&
      players[dependentPlayerId].state[dependentIndex] === true
    ) {
      console.log("🔒 Rule broken: dependent ON but requires OFF");

      // Reset the dependent lever
      players[dependentPlayerId].state[dependentIndex] = false;

      io.to(dependentPlayerId).emit("violation", {
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

      const rule = generateRuleFromUsedColors();
      activeRules[socket.id] = rule;
      console.log("Generated Rule:", rule);

      for (const [id, player] of Object.entries(players)) {
        if (player.hostId === socket.id || id === socket.id) {
          io.to(id).emit("start-game", { rule });
        }
      }

      io.emit("host-list", Object.values(hosts));
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
