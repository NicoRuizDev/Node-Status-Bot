require("dotenv").config();
const { ActivityType, Events, EmbedBuilder  } = require("discord.js");
const chalk = require("chalk");
const si = require("systeminformation");
let statusMessage = null;
let messageId = null
const os = require('os');
const CHANNEL_ID = process.env.channelId;

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(
      chalk.white(
        `[${chalk.blueBright("CLIENT")}]${chalk.white(" - ")}Connected to ${
          client.user.username
        }, started in ${client.guilds.cache.size} guild(s)`
      )
    );
    console.log(" ");
    const channel = client.channels.cache.get(CHANNEL_ID);
    channel.messages
      .fetch({ limit: 100 })
      .then((messages) => {
        messages.forEach((message) => {
          if (message.author.id === client.user.id) {
            message.delete().catch(console.error);
          }
        });
      })
      .then(() => {
        if (channel) {
          sendOrUpdateStatusMessage(channel);
        } else {
          console.error(`Channel with ID ${CHANNEL_ID} not found.`);
        }
        setInterval(() => {
          if (channel) {
            sendOrUpdateStatusMessage(channel);
          } else {
            console.error(`Channel with ID ${CHANNEL_ID} not found.`);
          }
        }, 10000);
      });
    },
};
async function sendOrUpdateStatusMessage(channel) {
  try {
    const [ramData, cpuData] = await Promise.all([
      si.mem(),
      si.currentLoad(),
    ]);
    const guild = channel.guild;
    const guildIconURL = guild.iconURL({ format: "png" });

    if (!ramData || !cpuData) {
      console.error("Failed to retrieve system information.");
      return;
    }

    const usedRamGB = ramData.used ? (ramData.used / 1024 / 1024 / 1024).toFixed(2) : "N/A";
    const totalRamGB = ramData.total ? (ramData.total / 1024 / 1024 / 1024).toFixed(2) : "N/A";
    const cpuLoad = cpuData.currentLoad ? cpuData.currentLoad.toFixed(2) : "N/A";

    const graphBarLength = 35;
    const ramGraph = generateProgressBar(usedRamGB === "N/A" ? 0 : usedRamGB / totalRamGB, graphBarLength);
    const cpuGraph = generateProgressBar(cpuLoad === "N/A" ? 0 : cpuLoad / 100, graphBarLength);

    const timestamp = new Date().toLocaleTimeString();

    const embed = {
      title: 'System Information',
      description: `**RAM:** ${usedRamGB} GB / ${totalRamGB} GB\n${ramGraph}\n**CPU Load:** ${cpuLoad}%\n${cpuGraph}`,
      fields: [
        {
          name: 'CPU Model',
          value: os.cpus()[0].model,
          inline: true,
        },
        {
          name: 'CPU Cores',
          value: os.cpus().length,
          inline: true,
        },
        {
          name: 'CPU Speed',
          value: `${os.cpus()[0].speed} GHz`,
          inline: true,
        },
      ],
      footer: {
        text: `Last Updated: ${timestamp}`,
      },
      thumbnail: {
        url: guildIconURL,
      },
    };

    if (statusMessage) {
      statusMessage.edit({ embeds: [embed] });
    } else {
      const message = await channel.send({ embeds: [embed] });
      statusMessage = message;
    }
  } catch (error) {
    console.error("Error getting system information:", error);
  }
}

function generateProgressBar(percentage, length) {
  const progressChars = "█";
  const emptyChars = "░";
  const progressBar = [];
  const filledLength = Math.floor(length * percentage);
  const emptyLength = length - filledLength;

  for (let i = 0; i < filledLength; i++) {
    progressBar.push(progressChars);
  }

  for (let i = 0; i < emptyLength; i++) {
    progressBar.push(emptyChars);
  }

  return progressBar.join("");
}
