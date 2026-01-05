const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

const SERVERS = [
  { id: "1111111111", players: 1, brainrot: "Strawberry Elephant", value: 250000000 },
  { id: "2222222222", players: 2, brainrot: "Dragon Cannelloni", value: 100000000 }
];

app.get("/", (req, res) => {
  res.send("Backend online");
});

app.get("/servers", (req, res) => {
  res.json(SERVERS);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
