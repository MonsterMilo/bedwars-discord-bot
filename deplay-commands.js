require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'addsweat',
    description: 'Add a sweat player',
    options: [
      {
        name: 'username',
        type: 3, // STRING
        description: 'Minecraft username',
        required: true,
      },
      {
        name: 'milo',
        type: 5, // BOOLEAN
        description: 'Beaten by Milo',
        required: false,
      },
      {
        name: 'potat',
        type: 5,
        description: 'Beaten by Potat',
        required: false,
      },
      {
        name: 'aballs',
        type: 5,
        description: 'Beaten by Aballs',
        required: false,
      },
      {
        name: 'zoiv',
        type: 5,
        description: 'Beaten by Zoiv',
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // make sure CLIENT_ID is in your .env
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
