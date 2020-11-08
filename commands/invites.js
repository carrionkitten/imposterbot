const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'invites',
    description: `invites the mentioned user to the caller's current lobby`,
    execute(message, args){
        message.guild.fetchInvites().then(invites => {
            for(i in invites){
                console.log(i);
            }
            console.log(invites);
        })
    }
}
