const db = require("./db");

module.exports = {

    getVoiceChannels(message){
        const category = message.guild.channels.cache.find(c => c.type === 'category' && c.name === 'Lobby')
        return category.children.filter(channel => channel.type === 'voice');
    },

    replaceAt(s, index, replacement) {
        return String(s.substr(0, index)) + String(replacement) + String(s.substr(index + replacement.length));
    },

    mapVoiceToLobby(message, channelList){
        return channelList.map(channel => {
            return {
                vChannel: channel, 
                tChannel: message.guild.channels.cache.find(c => c.name === channel.name.toLowerCase()), 
                role: message.guild.roles.cache.find(role => role.name === channel.name)};
        });
    },
    
    mapRoleToLobby(message, roleList){
        return roleList.map(role => {
            return {
                vChannel: message.guild.channels.cache.find(c => c.name === role.name), 
                tChannel: message.guild.channels.cache.find(c => c.name === role.name.toLowerCase()), 
                role: role
            }
        });
     },

    resolveLobby(message, lobbyData){
        let resp = {
            name: lobbyData.name, 
            server_id: lobbyData.server_id, 
            closed: lobbyData.closed
        };
        resp.role = message.guild.roles.resolve(lobbyData.role);
        resp.text = message.guild.channels.resolve(lobbyData.text);
        resp.voice = message.guild.channels.resolve(lobbyData.voice);
        return resp;
    },

    addUserToLobby(lobby, member, moveToVoice){
        const existing = member.roles.cache.find(r => r.name.startsWith('Lobby'));
        if(existing){
            member.roles.remove(existing);
        }
        member.roles.add(lobby.role.id).catch(err => {console.log(err); throw err});
        lobby.text.send(`${member} has joined the lobby!`);
        if(moveToVoice){
            member.voice.setChannel(lobby.voice.id).catch(err => console.log('Could not move user to voice channel'));
        }
    },

    removeUserFromLobby(lobby, member){
        member.roles.remove(lobby.role);
        if(member.voice.channel){
            member.voice.setChannel(null).catch(err => console.log('Could not move user to voice channel'));
        }
    },

    getInviteCode(){
        var dt = new Date()
        return ((dt % (60000 * 30)) + (60000 * 30)).toString(32).toUpperCase();
    },
    
    strike(message, args, perma){
        var desc = null;

        if(!message.member.hasPermission(['KICK_MEMBERS','BAN_MEMBERS'])){
            message.reply(`you don't have permission to do that my dude`);
            return;
        }else if(message.mentions.members.size < 1){
            message.reply('you must tag a member to log a strike on them');
            return;
        }else if(args.length > 0 ){
            args = args.slice(message.mentions.members.size);
            desc = args.join(' ');
        }

        const userList = message.mentions.members.filter(u => !u.hasPermission(['KICK_MEMBERS','BAN_MEMBERS']));
        
        db.logStrike(message.guild.id, userList, message.author.id, perma, desc,
            function(err, activeStrikes){
                if(err)
                    message.reply('sorry! There was an error saving that strike. If you wrote a long description, try shortening it.');
                else{
                    const newBans = activeStrikes.filter(row => {
                        if(row.count >= 3) return row.user_id;
                    });
                    if(newBans.length > 0){
                        message.channel.send(`The following user(s) have reached the maximum strike count and will now be banned:\n${ newBans.map( user => `<@${user.user_id}>` ).join('\n') }`)
                        newBans.forEach(uInfo => {
                            message.guild.members.ban(uInfo.user_id, {reason: 'Maximum # of strikes reached'})
                            .catch(err => console.log(err));
                        });
                    }
                }
            })
    }

}