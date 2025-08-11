require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('addsweat')
    .setDescription('Add sweat for a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Minecraft username')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('milo')
        .setDescription('Beaten by milo')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('potat')
        .setDescription('Beaten by potat')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('aballs')
        .setDescription('Beaten by aballs')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('zoiv')
        .setDescription('Beaten by zoiv')
        .setRequired(false))
]
  .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // For guild commands (fast update)
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
