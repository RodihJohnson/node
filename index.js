const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;
const PLACE_ID = 109983668079237; // SAB Place ID

// ✅ Discord webhook for alerts
const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1455373841336373270/ZFAUB-0hauphf_5TVegY9amzTSLaEgb_2O_EBGiA_5a-f7y0-h0WbQ7uuklspa11Z9v0";

// Allow requests from any origin
app.use(cors());
app.use(express.json());

// Keep the latest rich servers (one per Brainrot per server)
let verifiedServers = [];

// Health check
app.get("/", (req, res) => {
  res.send("Backend online ✅");
});

// Optional: scan for low-player servers (≤3 players)
app.get("/scan", async (req, res) => {
  try {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Asc&limit=100`;
    const response = await axios.get(url);
    const servers = response.data.data
      .filter(s => s.playing <= 3)
      .map(s => ({ id: s.id, players: s.playing }));
    res.json(servers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "scan failed" });
  }
});

// Return all verified rich servers
app.get("/servers", (req, res) => {
  res.json(verifiedServers);
});

// Clients report a rich Brainrot
app.post("/report", async (req, res) => {
  const { id, brainrot, value, players } = req.body;
  if (!id || !brainrot || !value) return res.status(400).json({ error: "Missing fields" });

  // Remove duplicates (same Brainrot in same server)
  verifiedServers = verifiedServers.filter(s => !(s.id === id && s.brainrot === brainrot));

  // Add new report to the front
  verifiedServers.unshift({ id, brainrot, value, players: players or 1 });

  // Keep only latest 50 entries
  verifiedServers = verifiedServers.slice(0, 50);

  // Discord alert
  try {
    await axios.post(DISCORD_WEBHOOK, {
      content:
`🔥 **RICH SERVER FOUND**
🧠 Brainrot: **${brainrot}**
💰 Value: **${Math.floor(value/1e6)}M/s**
👥 Players: ${players || "?"}
🆔 Server ID: ${id}`
    });
  } catch (err) {
    console.error("Discord alert failed:", err.message);
  }

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
});

