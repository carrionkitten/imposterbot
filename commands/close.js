const db = require("../db");

module.exports = {
    name: 'close',
    description: 'close a lobby',
    execute(message, args){
        let channelName = message.channel.name;
        if(!channelName.startsWith('lobby')){
            const role = message.member.roles.cache.find(role => role.name.startsWith('Lobby'));
            if(!role){
                message.reply('you must be in a lobby to close one.');
                return;
            }
            db.updateLobbyState(role.id, true);
        }
    }
}