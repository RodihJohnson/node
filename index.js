const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 10000;
const PLACE_ID = 109983668079237;

// ✅ YOUR REAL DISCORD WEBHOOK
const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1455373841336373270/ZFAUB-0hauphf_5TVegY9amzTSLaEgb_2O_EBGiA_5a-f7y0-h0WbQ7uuklspa11Z9v0";

// Store high-value verified servers
let verifiedServers = [];

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend online");
});

/* 🔍 Get LOW PLAYER servers */
app.get("/scan", async (req, res) => {
  try {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Asc&limit=100`;
    const r = await axios.get(url);

    // Filter for low-player servers (<=3)
    const servers = r.data.data
      .filter(s => s.playing <= 3)
      .map(s => ({
        id: s.id,
        players: s.playing
      }));

    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: "scan failed" });
  }
});

/* 🔥 Verified rich servers (shown in client GUI) */
app.get("/servers", (req, res) => {
  const TARGET_BRAINROTS = [
    "Strawberry Elephant",
    "Meowl",
    "Skibidi Toilet",
    "Dragon Cannelloni",
    "Headless Horseman",
    "Capitano Moby",
    "Burguro And Fryuro",
    "La Secret Combinasion",
    "Garama and Madundung",
    "Ketupat Kepat",
    "Los Primos",
    "Esok Sekolah",
    "Tralaledon"
  ];

  // Only send servers with valid Brainrots
  const filtered = verifiedServers.filter(s =>
    TARGET_BRAINROTS.includes(s.brainrot)
  );

  res.json(filtered);
});

/* 🤖 Client reports a rich/high-value server */
app.post("/report", async (req, res) => {
  const data = req.body;

  // Deduplicate by server ID
  verifiedServers = verifiedServers.filter(s => s.id !== data.id);

  // Add to top
  verifiedServers.unshift(data);
  verifiedServers = verifiedServers.slice(0, 25); // Keep last 25 rich servers

  // Discord alert
  try {
    await axios.post(DISCORD_WEBHOOK, {
      content:
`🔥 **RICH SERVER FOUND**
🧠 Brainrot: **${data.brainrot}**
💰 Value: **${Math.floor(data.value / 1e6)}M/s**
👥 Players: ${data.players}
🆔 Server ID: ${data.id}`
    });
  } catch (err) {
    console.error("Failed to send Discord webhook", err.message);
  }

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port " + PORT);
});
