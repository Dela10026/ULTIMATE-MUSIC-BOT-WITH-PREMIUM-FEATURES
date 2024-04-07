const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { readdirSync } = require("fs");
const { supportUrl, inviteUrl, voteUrl } = require("../../../settings/config.js");

module.exports = {
  name: "help",
  description: "Display all commands of the bot.",
  category: "Information",
  permissions: {
    bot: [],
    channel: [],
    user: [],
  },
  settings: {
    inVc: false,
    sameVc: false,
    player: false,
    current: false,
    owner: false,
    premium: false,
  },
  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    const row2 = new ActionRowBuilder()
      .addComponents(new ButtonBuilder().setLabel("Invite Bot").setURL(inviteUrl).setStyle(ButtonStyle.Link))
      .addComponents(new ButtonBuilder().setLabel("Dashboard").setURL("https://coomingsoon.com").setStyle(ButtonStyle.Link))
      .addComponents(new ButtonBuilder().setLabel("Vote Bot").setURL(voteUrl).setStyle(ButtonStyle.Link))
      .addComponents(new ButtonBuilder().setLabel("Support Server").setURL(supportUrl).setStyle(ButtonStyle.Link));

    const categories = readdirSync("./src/commands/Slash/");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.guild.members.me.displayName} Help Panel! 💖`,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setColor(client.color)
      .setDescription(
        `👋🏻 Hey **${interaction.member}**, Me **${client.user}** \n\n➡️ **__About Bot__**\n**A best and advanced Discord-Music bots with Premium system and high quality music.** \n\n📄 **__Category Bot__**\nℹ️  **Information**\n🎶  **Music**\n✨  **Premium**\n😎  **Developer**\n🪩  **Filters**\n\n🏓 **__Status Bot__**\n🏠  Server: **${client.guilds.cache.size}**\n🏓  Ping: **${Math.round(client.ws.ping)}ms**\n`
      )
      .setFooter({
        text: `© Bot 2023`,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents([
      new StringSelectMenuBuilder()
        .setCustomId("help-category")
        .setPlaceholder(`Bot Commands`)
        .setMaxValues(1)
        .setMinValues(1)
        .setOptions(
          categories.map((category) => {
            return new StringSelectMenuOptionBuilder().setLabel(category).setValue(category);
          })
        ),
    ]);

    interaction.editReply({ embeds: [embed], components: [row, row2] }).then(async (msg) => {
      let filter = (i) => i.isStringSelectMenu() && i.user && i.message.author.id == client.user.id;

      let collector = await msg.createMessageComponentCollector({
        filter,
        time: 90000,
      });

      collector.on("collect", async (m) => {
        if (m.isStringSelectMenu()) {
          if (m.customId === "help-category") {
            await m.deferUpdate();

            let [directory] = m.values;

            const embed = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.guild.members.me.displayName} Help Command!`,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
              })
              .setDescription(
                `\ \n\n**\➡️ ${directory.slice(0, 1).toUpperCase() + directory.slice(1)
                } Commands:**\n${client.slashCommands
                  .filter((c) => c.category === directory)
                  .map((c) => `\`${c.name}\` : *${c.description}*`)
                  .join("\n")}`
              )
              .setColor(client.color)
              .setFooter({
                text: `© Bot 2023 | Total Commands: ${client.slashCommands.filter((c) => c.category === directory).size
                  }`,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp();

            msg.edit({ embeds: [embed] });
          }
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time") {
          const timed = new EmbedBuilder()
            .setAuthor({
              name: `${interaction.guild.members.me.displayName} Help Panel! 💖`,
              iconURL: interaction.guild.iconURL({ dynamic: true }),
            })
            .setDescription(
              `Help Command Menu was timed out, try using \`/help\` to show the help command menu again.`
            )
            .setColor(client.color)
            .setFooter({
              text: `© Bot 2023`,
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

          msg.edit({ embeds: [timed], components: [row2] });
        }
      });
    });
  },
};
