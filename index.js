// At the very top of index.js
const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("Bot is running!"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server running");
});

const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const backendBaseURL = "https://bedwars-backend.onrender.com";

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Helper function to calculate star from XP (same as your frontend)
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

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!addsweat')) {
    const args = message.content.split(' ');
    const username = args[1];
    const beatenByFlags = {
      milo: args.includes('--milo'),
      potat: args.includes('--potat'),
      aballs: args.includes('--aballs'),
      zoiv: args.includes('--zoiv'),
    };

    if (!username) {
      message.reply('Please provide a username. Usage: !addsweat <username> [--milo] [--potat] [--aballs] [--zoiv]');
      return;
    }

    try {
      // Fetch UUID from backend
      const mojangRes = await fetch(`${backendBaseURL}/mojang/${username}`);
      if (!mojangRes.ok) throw new Error('User not found');
      const mojangData = await mojangRes.json();

      const uuid = mojangData.id;

      // Fetch player stats
      const statsRes = await fetch(`${backendBaseURL}/player/${uuid}`);
      if (!statsRes.ok) throw new Error('Player stats not found');
      const statsJson = await statsRes.json();
      const data = statsJson.player.stats?.Bedwars || {};

      // Compose new sweat entry
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

      // Send POST request to add sweat
      const postRes = await fetch(`${backendBaseURL}/sweats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSweat),
      });

      if (!postRes.ok) {
        const errText = await postRes.text();
        throw new Error('Failed to add sweat: ' + errText);
      }

      message.reply(`Sweat added for user ${mojangData.name}!`);
    } catch (error) {
      message.reply(`Error: ${error.message}`);
    }
  }
});

client.login(process.env.BOT_TOKEN);
