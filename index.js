const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const { Client, GatewayIntentBits } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const backendBaseURL = "https://bedwars-backend.onrender.com";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

function calculateStarFromXP(exp) {
  if (exp < 0) return 0;
  let stars = 0;
  let xpLeft = exp;
  while (xpLeft >= 0) {
    let mod100 = stars % 100;
    let xpNeeded;
    if (mod100 === 0) xpNeeded = 500;
    else if (mod100 === 1) xpNeeded = 1000;
    else if (mod100 === 2) xpNeeded = 2000;
    else if (mod100 === 3 || mod100 === 4) xpNeeded = 3500;
    else xpNeeded = 5000;
    if (xpLeft < xpNeeded) break;
    xpLeft -= xpNeeded;
    stars++;
  }
  return stars;
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'addsweat') {
    const username = interaction.options.getString('username');
    const beatenByFlags = {
      milo: interaction.options.getBoolean('milo') || false,
      potat: interaction.options.getBoolean('potat') || false,
      aballs: interaction.options.getBoolean('aballs') || false,
      zoiv: interaction.options.getBoolean('zoiv') || false,
    };

    await interaction.deferReply();

    try {
      const mojangRes = await fetch(`${backendBaseURL}/mojang/${username.toLowerCase()}`);
      if (!mojangRes.ok) throw new Error('User not found');
      const mojangData = await mojangRes.json();
      const uuid = mojangData.id;

      const statsRes = await fetch(`${backendBaseURL}/player/${uuid}`);
      if (!statsRes.ok) throw new Error('Player stats not found');
      const statsJson = await statsRes.json();
      const data = statsJson.player.stats?.Bedwars || {};

      const newSweat = {
        username: mojangData.name,
        star: calculateStarFromXP(data.Experience || 0),
        fkdr: (data.final_kills_bedwars || 0) / ((data.final_deaths_bedwars || 1)),
        wlr: (data.wins_bedwars || 0) / ((data.losses_bedwars || 1)),
        bblr: (data.beds_broken_bedwars || 0) / ((data.beds_lost_bedwars || 1)),
        kdr: (data.kills_bedwars || 0) / ((data.deaths_bedwars || 1)),
        finals: data.final_kills_bedwars || 0,
        finalDeaths: data.final_deaths_bedwars || 0,
        beds: data.beds_broken_bedwars || 0,
        bedsLost: data.beds_lost_bedwars || 0,
        kills: data.kills_bedwars || 0,
        deaths: data.deaths_bedwars || 0,
        milo: beatenByFlags.milo,
        potat: beatenByFlags.potat,
        aballs: beatenByFlags.aballs,
        zoiv: beatenByFlags.zoiv,
        uuid,
        dateAdded: new Date().toISOString(),
      };

      const postRes = await fetch(`${backendBaseURL}/sweats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSweat),
      });

      if (!postRes.ok) throw new Error('Failed to add sweat');

      await interaction.editReply(`Successfully added ${mojangData.name} to the sweatbeater!`);
    } catch (error) {
      await interaction.editReply(`Error: ${error.message}`);
    }
  }
});

client.login(process.env.BOT_TOKEN);