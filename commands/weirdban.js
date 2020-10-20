const Discord = require('discord.js');

module.exports = {
    name: 'weirdban',
    description: '',
    execute(message, args){
        let member = message.mentions.users.first();
        if(!member){
            message.reply('you must @ a user to ban them');
            return;
        }
        if(message.member.hasPermission(['KICK_MEMBERS','BAN_MEMBERS'])){
            message.guild.members.ban(member,{reason: `weirdchamp ${message.author.username}`}).then(() => {
                message.channel.send(`${member} has been banned for being <:WEIRDCHAMP:767276490844143636>`);    
            }).catch(err => {
                console.log(err);
                message.reply(`could not complete that request for reason: [${err.message}]`)
            })
        }
        else{
            message.reply(`you don't have permission to do that my dude`);
        }
    }
}