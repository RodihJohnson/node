const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 10000;
const PLACE_ID = 109983668079237;

// ✅ Discord webhook
const DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1455373841336373270/ZFAUB-0hauphf_5TVegY9amzTSLaEgb_2O_EBGiA_5a-f7y0-h0WbQ7uuklspa11Z9v0";

let verifiedServers = [];

app.use(express.json());

app.get("/", (req, res) => res.send("Backend online"));

// Get low-player servers
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
  } catch (err) {
    res.status(500).json({ error: "scan failed" });
  }
});

// Return verified rich servers
app.get("/servers", (req, res) => res.json(verifiedServers));

// Client reports Brainrot found
app.post("/report", async (req, res) => {
  const data = req.body;

  // Deduplicate only if same Brainrot in same server
  verifiedServers = verifiedServers.filter(
    s => !(s.id === data.id && s.brainrot === data.brainrot)
  );

  verifiedServers.unshift(data);
  verifiedServers = verifiedServers.slice(0, 50); // keep latest 50

  // Discord alert
  await axios.post(DISCORD_WEBHOOK, {
    content:
      `🔥 **RICH BRAINROT FOUND**\n` +
      `🧠 Brainrot: **${data.brainrot}**\n` +
      `💰 Value: **${Math.floor(data.value / 1e6)}M/s**\n` +
      `👥 Players: ${data.players}\n` +
      `🆔 Server ID: ${data.id}`
  });

  res.json({ ok: true });
});

app.listen(PORT, "0.0.0.0", () => console.log("Server listening on port " + PORT));
