const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'set-code',
    description: 'appends code to the current lobby name',
    execute(message, args){
        let role = null;
        if(args.length < 1){
            message.reply('please provide a code! Ex: "!set-code RIPQWQ"');
        }
        if(message.member.roles.cache.filter(role => role.name.startsWith('Lobby')).size === 1){
            role = message.member.roles.cache.find(role => role.name.startsWith('Lobby'));
        }else{
            message.reply('you need to be in a lobby first!');
            return;
        }
        db.getLobbies(message.guild.id, (lobbies) => {
            var target = lobbies.find(l => l.role === role.id);
            target = common.resolveLobby(message, target);
            target.voice.edit({name: role.name + ` | ${args[0]}`}).catch(err => console.log(err));
        })
    }
}