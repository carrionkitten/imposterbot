const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'accept',
    description: 'accepts lobby invite',
    execute(message, args){
        if(args.length < 2){
            message.channel.send('Please provide an invite code. Ex: "!accept  X35F0"');
            return;
        }
        if(message.guild){
            return;
        }
        var code = args[0];
        var client = args[1];

        db.fetchInvite(code, invite => {
            if(!invite || invite.to_id != message.author.id){ // invite doesn't exist or was sent to someone else
                message.channel.send("That invite code is invalid or has expired.");
                return;
            }
            const guild = client.guilds.resolve(invite.lobby_server);
            const lobby = common.resolveLobby({guild: guild}, invite);
            const member = guild.members.resolve(invite.to_id);

            common.addUserToLobby(lobby, member, true)
            lobby.voice.createInvite({maxAge: 60*30, maxUses: 1}).then(invite => {                
                message.channel.send(`You've been added to the lobby! Use this link to join the voice channel: ${invite.url}`)
            })
        })
    }
}