const dotenv = require('dotenv').config()
const {Client, MessageEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./users.sqlite');
const prefix = `${process.env.PREFIX}`

const client = new Client();

client.on("ready", () => {
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'users';").get();
    if (!table['count(*)']) {
      // If the table isn't there, create it and setup the database correctly.
      sql.prepare("CREATE TABLE users (id TEXT PRIMARY KEY, user TEXT, guild TEXT, cash INTEGER);").run();
      // Ensure that the "id" row is always unique and indexed.
      sql.prepare("CREATE UNIQUE INDEX idx_cash_id ON users (id);").run();
      sql.pragma("synchronous = 1");
      sql.pragma("journal_mode = wal");
    }

    client.getCash = sql.prepare("SELECT cash FROM users WHERE user = ? AND guild = ?");
    client.setCash = sql.prepare("INSERT OR REPLACE INTO users (id, user, guild, cash) VALUES (@id, @user, @guild, @cash);");
});

console.log("Live!")

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;
    
    let user;
    
    if (message.guild) {
        money = client.getCash.get(message.author.id, message.guild.id)
        if (!user) {
            user = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, cash: 500}
        }
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "bankrupt") {
        let user = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, cash: 500}
        client.setCash.run(user)
        return message.reply(`We replenished you with 500 dosh`)
    }

    if (command === "roll") {
        return message.reply(`WIP`)
    }

    if (command === "dosh") {
        return message.reply(`you have ${user.cash} dosh!`)
    }

    //wip
    if(command === "leaderboard" && 0) {
        const top10 = sql.prepare("SELECT * FROM users WHERE guild = ? ORDER BY cash DESC LIMIT 10;").all(message.guild.id);
        let nicknameArr

        const embed = new MessageEmbed()
          .setTitle("Merchants Guild")
          .setAuthor(client.user.username, client.user.avatarURL)
          .setDescription("Top 10 addicts")
          .setColor(0x00AE86);
      
        for(const data of top10) {
            let username = await client.users.resolve(`${data.id}`)
            embed.addField(username.nickname, `${data.cash}`);
        }
        return message.channel.send(embed);
    }

});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`ruining ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`ruining ${client.guilds.size} servers`);
});


client.login(`${process.env.DJS_TOKEN}`);