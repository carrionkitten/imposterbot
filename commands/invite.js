const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'invite',
    description: 'finds an open/available lobby and adds the user to its associated role',
    execute(message, args){
        // TO DO: Check if user is already in the lobby before adding
        let member = message.mentions.members.first();
        let role = null;

        if(message.member.roles.cache.filter(role => role.name.startsWith('Lobby')).size === 1){
            role = message.member.roles.cache.find(role => role.name.startsWith('Lobby'));

        }else{
            message.reply('you need to be in a lobby first!');
            return;
        }
        if(!member){
            message.reply(`you must @ a user in this server to invite them to the lobby.`);
            return;
        }

        if(!member.roles.cache.find(r=> r.id === role.id)){
            member.send(`${message.author.username} is inviting you to join ${role.name} in ${message.guild}! React to this message to accept.`)
            .then(m => db.createInvite(m.id, message.author.id, role.id, message.guild.id));
        }else{
            message.reply(`they're already in the lobby!`);
        }
    }
}