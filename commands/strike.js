const db = require('../db.js');

module.exports = {
    name: 'strike',
    description: `function to log a strike for a user`,
    execute(message, args){
        var desc = null;

        if(!message.member.hasPermission(['KICK_MEMBERS','BAN_MEMBERS'])){
            message.reply(`you don't have permission to do that my dude`);
            return;
        }else if(message.mentions.members.size < 1){
            message.reply('you must tag a member to log a strike on them');
            return;
        }else if(args.length > 0 ){
            var i;
            for(i = 0; i < message.mentions.users.size; i++){
                args.shift();
            }
            desc = args.join(' ');
        }
        
        db.logStrike(message.guild.id, message.mentions.users, message.author.id, false, desc,
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