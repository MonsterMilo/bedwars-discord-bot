// deploy-commands.js
require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('addsweat')
    .setDescription('Add a sweat to the database')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Minecraft username')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option.setName('milo')
        .setDescription('Beaten by Milo?')
    )
    .addBooleanOption(option =>
      option.setName('potat')
        .setDescription('Beaten by Potat?')
    )
    .addBooleanOption(option =>
      option.setName('aballs')
        .setDescription('Beaten by Aballs?')
    )
    .addBooleanOption(option =>
      option.setName('zoiv')
        .setDescription('Beaten by Zoiv?')
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // global commands
      { body: commands }
    );
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
})();
