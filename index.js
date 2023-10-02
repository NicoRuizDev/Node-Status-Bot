const { Client, Intents } = require('discord.js');
const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES
  ],
});
const os = require('os');

const TOKEN = ''; // Replace with your bot token
const CHANNEL_ID = '1158066405200117770'; // Replace with your Discord channel ID

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({
    status: 'online',
    activity: {
      type: 'WATCHING',
      name: `Node: ${os.hostname()}`,
    },
  });
});

client.on('message', (message) => {
  if (message.content === '!status') {
    const ram = os.totalmem() - os.freemem();
    const cpu = os.cpus()[0].model;
    const threads = os.cpus().length;
    const speed = os.cpus()[0].speed;

    message.channel.send(
      `**System Information:**
      - RAM: ${(ram / 1024 / 1024 / 1024).toFixed(2)} GB used / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB total
      - CPU: ${cpu}
      - Threads: ${threads}
      - Speed: ${speed} GHz`
    );
  }
});

client.login(TOKEN);