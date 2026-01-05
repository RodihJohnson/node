const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 10000;
const PLACE_ID = 109983668079237;

// ✅ YOUR REAL DISCORD WEBHOOK
const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1455373841336373270/ZFAUB-0hauphf_5TVegY9amzTSLaEgb_2O_EBGiA_5a-f7y0-h0WbQ7uuklspa11Z9v0";

// Store only verified servers with rich Brainrots
let verifiedServers = [];

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend online");
});

/* 🔍 Scan low-player servers (not mandatory, can be automatic client reports) */
app.get("/scan", async (req, res) => {
  try {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Asc&limit=100`;
    const r = await axios.get(url);

    const servers = r.data.data
      .filter(s => s.playing <= 3) // low-player filter
      .map(s => ({
        id: s.id,
        players: s.playing
      }));

    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: "scan failed" });
  }
});

/* 🔥 Verified rich servers for clients */
app.get("/servers", (req, res) => {
  res.json(verifiedServers);
});

/* 🤖 Client reports a rich server */
app.post("/report", async (req, res) => {
  const data = req.body;
  if (!data.id || !data.brainrot || !data.value) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Deduplicate
  verifiedServers = verifiedServers.filter(s => s.id !== data.id);

  // Add new report at the front
  verifiedServers.unshift(data);

  // Keep only latest 25 servers
  verifiedServers = verifiedServers.slice(0, 25);

  // Send Discord alert
  await axios.post(DISCORD_WEBHOOK, {
    content:
`🔥 **RICH SERVER FOUND**
🧠 Brainrot: **${data.brainrot}**
💰 Value: **${Math.floor(data.value / 1e6)}M/s**
👥 Players: ${data.players}
🆔 Server ID: ${data.id}`
  });

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port " + PORT);
});
