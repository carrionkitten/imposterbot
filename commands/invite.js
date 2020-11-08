const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'invite',
    description: `invites the mentioned user to the caller's current lobby`,
    execute(message, args){
        // TO DO: Check if user is already in the lobby before adding
        let role = null;

        if(message.member.roles.cache.filter(role => role.name.startsWith('Lobby')).size === 1){
            role = message.member.roles.cache.find(role => role.name.startsWith('Lobby'));

        }else{
            message.reply('you need to be in a lobby first!');
            return;
        }
        if(message.mentions.members.size < 1){
            message.reply(`you must @ a user in this server to invite them to the lobby.`);
            return;
        }

        else{
            message.mentions.members.forEach(member => {
                if(!member.roles.cache.find(r=> r.id === role.id)){
                    var code = common.getInviteCode();
                    member.send(`${message.author.username} is inviting you to join ${role.name} in ${message.guild}! Respond with "!accept ${code}" to accept.`)
                    .then(m => {
                        console.log(code, m);
                        db.createInvite(code, message.author.id, member.id, role.id, message.guild.id)
                    });
                }else if (message.mentions.members.size == 1){
                    message.reply(`they're already in the lobby!`);
                }
            });
        }
    }
}