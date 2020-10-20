
module.exports = {

    getVoiceChannels(message){
        const category = message.guild.channels.cache.find(c => c.type === 'category' && c.name === 'Lobby')
        return category.children.filter(channel => channel.type === 'voice');
    },

    replaceAt(s, index, replacement) {
        return String(s.substr(0, index)) + String(replacement) + String(s.substr(index + replacement.length));
    },
    
    getLobbyStates(message, callback){
        const log = message.guild.channels.cache.find(c => c.name === 'imposterbot-lobby-logs');
    
        log.messages.fetch({ limit: 1 }).then(messages => {
            let lastMessage = messages.first();
            if(lastMessage != null){
                callback(lastMessage.content)
            }
            else{ // get list of voice channels
                let vChannels = this.getVoiceChannels(message);
                log.send('0'.repeat(vChannels.size));
                callback('0'.repeat(vChannels.size));
            }
        }).catch(err => console.log(err));
    
        return 0;
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

    addUserToLobby(lobby, member, moveToVoice){
        member.roles.add(lobby.role);
        lobby.tChannel.send(`${member} has joined the lobby!`);
        if(moveToVoice){
            member.voice.setChannel(lobby.vChannel.id).catch(err => console.log('Could not move user to voice channel'));
        }
    },

    removeUserFromLobby(lobby, member){
        member.roles.remove(lobby.role);
        if(member.voice.channel){
            member.voice.setChannel(null).catch(err => console.log('Could not move user to voice channel'));
        }
    },

    getAllLobbies(message){
        let vChannels = this.getVoiceChannels(message);
        return this.mapVoiceToLobby(message, vChannels);
    }

}