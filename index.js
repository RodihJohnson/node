const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 10000;
const PLACE_ID = 109983668079237;

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1455373841336373270/ZFAUB-0hauphf_5TVegY9amzTSLaEgb_2O_EBGiA_5a-f7y0-h0WbQ7uuklspa11Z9v0";

let hotServers = [];

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend online");
});

/* 🔍 REAL ROBLOX SERVER SCAN */
app.get("/scan", async (req, res) => {
  try {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Asc&limit=100`;
    const r = await axios.get(url);

    const servers = r.data.data
      .filter(s => s.playing <= 3)
      .map(s => ({
        id: s.id,
        players: s.playing
      }));

    res.json(servers);
  } catch (e) {
    res.status(500).json({ error: "scan failed" });
  }
});

/* 🔥 HOT SERVER LIST */
app.get("/servers", (req, res) => {
  res.json(hotServers);
});

/* 🤖 CLIENT REPORT */
app.post("/report", async (req, res) => {
  const data = req.body;

  hotServers = hotServers.filter(s => s.id !== data.id);
  hotServers.unshift(data);
  hotServers = hotServers.slice(0, 20);

  await axios.post(DISCORD_WEBHOOK, {
    content:
`🔥 **RICH SERVER FOUND**
Brainrot: ${data.brainrot}
Value: ${Math.floor(data.value/1e6)}M/s
Players: ${data.players}
Server ID: ${data.id}`
  });

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () =>
  console.log("Server listening on port " + PORT)
);
