const common = require('../common.js')

module.exports = {
    name: 'join-empty',
    description: 'finds an empty lobby, adds the user to its associated role, and set the lobby to closed',
    execute(message, args){
        let lobbies = common.getAllLobbies(message);
        lobbies = lobbies.filter(lobby => lobby.vChannel.members.size === 0);

        if(lobbies.length > 0){
            let lobbyNum = parseInt(lobbies[0].vChannel.name.slice('Lobby'.length));

            console.log(lobbies[0], lobbyNum);

            common.updateLobbyState(message, lobbyNum-1, '1');
            common.addUserToLobby(lobbies[0], message.member, true);
        }
        else{
            message.reply('there are no empty lobbies available currently.');
        }
    }
}