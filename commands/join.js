const common = require('../common.js');
const db = require('../db.js');

function getJoinableLobbies(lobbies){
    console.log(lobbies);
    var open = lobbies.filter(lobby => !lobby.voice.full && lobby.voice.members.size !== 0 && !lobby.closed);
    var empty = lobbies.filter(lobby => lobby.voice.members.size === 0);
    
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
            const sortedLobbies = getJoinableLobbies(lobbies);
            console.log(sortedLobbies);
            if(sortedLobbies.open.length < 1){
                targetLobby = sortedLobbies.empty[0]; // if none available to join, join empty
            }
            else{
                targetLobby = sortedLobbies.open[Math.floor(Math.random() * sortedLobbies.open.length)]; // if lobbies available to join, join random
            }
            console.log(targetLobby);
            common.addUserToLobby(targetLobby, member, true);
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