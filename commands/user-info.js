const Discord = require('discord.js');
const db = require('../db.js');

module.exports = {
    name: 'user-info',
    description: 'provides info about a guild member',
    execute(message, args){
        if(!message.mentions.users.size == 1){
            message.reply('please mention a single user and try again.')
        }else{
            const member = message.mentions.members.first();
            db.fetchInviter(message.guild.id, member.id, function(err, data){
                if(err){
                    console.log(err);
                }else{
                    var embed = {
                        title: 'User Info Card',
                        description: `User: ${member}`,
                        fields: [
                            {
                                name: 'Invited By', 
                                value: data.length > 0 ? `<@${data[0].inviter_id}>` : 'Unknown', 
                                inline: true
                            },
                            {name: 'Joined Server', value: `${member.joinedAt.toUTCString()}`, inline: true},
                            {name: 'Account Created', value: `${member.user.createdAt.toUTCString()}`, inline: true}
                        ]
                    }
                    message.channel.send({embed: embed});
                }
            })
        }
    }
}