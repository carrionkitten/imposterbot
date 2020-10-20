const common = require('../common.js');

module.exports = {
    name: 'leave',
    description: 'command to remove leave your current lobby',
    execute(message, args){
        const lobbyRoles = message.member.roles.cache.filter(role => role.name.startsWith('Lobby'));
        const lobbies = common.mapRoleToLobby(message, lobbyRoles);

        lobbies.forEach(lobby => {
            common.removeUserFromLobby(lobby, message.member);
        });
    }
}