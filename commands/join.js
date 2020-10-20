const common = require('../common.js');

function getJoinableLobbies(message, states){
    let lobbies = common.getAllLobbies(message);

    var open = lobbies.filter(lobby => {
        let channel = lobby.vChannel;
        let index = parseInt(channel.name.slice('Lobby'.length).split(/ +/)[0]) - 1;
        return (!channel.full && channel.members.size !== 0 && states[index] != '1');
    });
    var empty = lobbies.filter(lobby => lobby.vChannel.members.size === 0);
    
    return {open: open, empty: empty};
}

module.exports = {
    name: 'join',
    description: 'finds an open/available lobby and adds the user to its associated role',
    execute(message, args){
        var targetLobby = null;
        const member = message.member;
        
        common.getLobbyStates(message, states => {
            const lobbies = getJoinableLobbies(message, states);
            console.log(lobbies);

            if(lobbies.open.length < 1){
                targetLobby = lobbies.empty[0]; // if none available to join, join empty
            }
            else{
                targetLobby = lobbies.open[Math.floor(Math.random() * lobbies.open.length)]; // if lobbies available to join, join random
            }
            common.addUserToLobby(targetLobby, member, true);
        });
    }
}