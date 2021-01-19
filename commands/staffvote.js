const common = require('../common.js');
const db = require('../db.js');

module.exports = {
    name: 'staff-vote',
    description: 'creates a vote for staff members - if ',
    execute(message, args){
        var action = null;
        if(message.channel.id == '766936336308895775' || message.channel.id == '712474669139230755'){ // hard-coding staff channel for now, possibly make this configurable in the future
            // validating request
            if(args.length < 1){
                message.reply('invalid vote command. Please provide a description of the vote');
                return;
            }
            if(args[0].toLowerCase() === 'mod' || args[0].toLowerCase() === 'kick' || args[0].toLowerCase() === 'ban'){ 
                if(message.mentions.users.size < 1){
                    message.reply('please mention at least one user and try again.');
                    return;
                }
                action = args.shift().toLowerCase();
            }

            const members = message.channel.members.filter(m => !m.user.bot);
            console.log(members);
            const min = Math.floor(members.size / 2) + 1;
            
            var embed = {
                title: 'Staff Vote',
                description: '' 
            }
            var topic = 'Topic: ';
            if(action === 'kick'){
                topic += action + 'ing ' + common.formatList(message.mentions.users.map(m => `${m}`));
            }else if (action){
                topic += action + action.charAt(action.length-1) + 'ing ' + common.formatList(message.mentions.users.map(m => `${m}`));
            }else{
                topic += args.join(' ');
            }

            embed.description = topic + "\nReact with :thumbsup: or :thumbsdown: to cast your vote"

            message.channel.send("<@&766933870750203946>",{embed: embed}).then(m => {
                const fltr = (reaction, user) => reaction.emoji.name === "👍" || reaction.emoji.name === "👎";
                const collector = m.createReactionCollector(fltr);
                collector.on('collect', r => {
                    console.log(collector.collected)
                    var up = collector.collected.get("👍");
                    var down = collector.collected.get("👎");

                    up = up ? up.count : 0;
                    down = down ? down.count : 0; 

                    if(up == min && action){
                        message.mentions.members.forEach(member => {
                            if(action == 'kick') member.kick();
                            else if (action == 'ban') member.ban();
                            else if (action == 'mod') member.roles.add('766933870750203946');
                        })
                    } if (up == min || down == min){
                        embed.title += " Result";
                        embed.description = topic + "\nVerdict: ";
                        (up > down) ? embed.description += 'APPROVED' : embed.description += 'REJECTED';
                        embed.description += "\nIf this vote had an associated action, I have taken care of it.";
                        message.channel.send("<@&766933870750203946>",{embed: embed});
                        collector.stop();
                    }
                })
            })

        }
            
    }
}