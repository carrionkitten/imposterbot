const common = require('../common.js');
const db = require('../db.js');

function getJoinableLobbies(message, lobbies){
    var open = lobbies.filter(lobby => {
        let channel = message.guild.channels.resolve(lobby.voice);
        return (!channel.full && channel.members.size !== 0 && !lobby.closed);
    });
    var empty = lobbies.filter(lobby => {
        let channel = message.guild.channels.resolve(lobby.voice);
        channel.members.size === 0
    });
    
    return {open: open, empty: empty};
}

module.exports = {
    name: 'join',
    description: 'finds an open/available lobby and adds the user to its associated role',
    execute(message, args){
        var targetLobby = null;
        const member = message.member;
        
        db.getLobbies(message.guild.id, (lobbies) => {
            lobbies = lobbies.map(l => common.resolveLobby(message, l));
            console.log(lobbies);
            /*const sortedLobbies = getJoinableLobbies(message, lobbies);
            console.log(sortedLobbies);
            if(lobbies.open.length < 1){
                targetLobby = lobbies.empty[0]; // if none available to join, join empty
            }
            else{
                targetLobby = lobbies.open[Math.floor(Math.random() * lobbies.open.length)]; // if lobbies available to join, join random
            }
            console.log(targetLobby);*/
            //common.addUserToLobby(targetLobby, member, true);
        })


        /*common.getLobbyStates(message, states => {
            const lobbies = getJoinableLobbies(message, states);
            console.log(lobbies);

            if(lobbies.open.length < 1){
                targetLobby = lobbies.empty[0]; // if none available to join, join empty
            }
            else{
                targetLobby = lobbies.open[Math.floor(Math.random() * lobbies.open.length)]; // if lobbies available to join, join random
            }
            common.addUserToLobby(targetLobby, member, true);
        });*/
    }
}