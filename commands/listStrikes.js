const db = require('../db.js');

module.exports = {
    name: 'list-strikes',
    description: 'shows active strikes for a member',
    execute(message, args){
        if(!message.member.hasPermission(['KICK_MEMBERS','BAN_MEMBERS'])){
            message.reply(`you don't have permission to do that my dude`);
            return;
        }
        if(!message.mentions.users.size == 1){
            message.reply('please mention a single user and try again.')
        }else{
            const member = message.mentions.users.first();
            args.shift();
            const activeOnly = !(args.shift() === 'all');
            db.fetchStrikes(message.guild.id, member.id, true, function(err, data){
                if(err){
                    console.log(err);
                }else{
                    var embed = {
                        title: activeOnly ? `Active Strikes (${data.length})` : `Strike History (${data.length})`,
                        description: `User: <@${member.id}>`,
                        fields: data.map(strike => {
                            return {
                                name: strike.perma ? `[PERMA] ${new Date(strike.timestamp).toUTCString()}` : new Date(strike.timestamp).toUTCString(),
                                value: strike.desc ? 
                                `logged by <@${strike.mod_id}> with description "${strike.desc}"` :
                                `logged by <@${strike.mod_id}>`
                            }
                        })
                    }
                    if (data.length < 1){
                        embed.description = `User <@${member.id}> has no active strikes`;
                    }
                    message.channel.send({embed: embed});
                }
            })
        }
    }
}