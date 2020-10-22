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
            let guild = client.guilds.resolve(invite.lobby_server);
            console.log(invite, guild);
            //common.addUserToLobby()
        })
    }
}