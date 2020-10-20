const { Message } = require("discord.js")
const Discord = require('discord.js');

module.exports = {
    name: 'test',
    description: '',
    execute(message, args){
        embed = new Discord.MessageEmbed({
            fields: [
                {guild: message.guild},
                {invitee: message.mentions}
            ]
        })
        message.author.send(null, embed).then(m => console.log(m));
    }
}