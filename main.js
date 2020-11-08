const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const common = require('./common.js');
const db = require('./db.js');

const client = new Discord.Client();

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('bot ready');
})

client.login(config.token);

client.on('message', message => {
    if(!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if(!client.commands.has(commandName)) return; // command doesn't exist
    const command = client.commands.get(commandName);
    
    try{
        if(commandName === 'accept') args.push(client);
        command.execute(message, args);
    } catch(error){
        console.error(error);
        message.reply('there was an error trying to execute that command');
    }
})

client.on('inviteCreate', (invite) => {
    db.newInvite(invite);
})

client.on('guildMemberAdd', member => {
    db.getInvites(member.guild.id, (dbinvites) => {
        member.guild.fetchInvites().then(invites => {
            var increased = dbinvites.filter(i => {
                
            })
        });
    });
})

client.on('rateLimit', (rateLimitInfo) =>{
    console.log(rateLimitInfo);
})

/*client.on('voiceStateUpdate', (oldState, newState) => {
    // if lobby becomes empty, update to open
    db.getLobbies(oldState.guild.id, lobbies => {
        if(!oldState.channel)
            return;
        const lobby = lobbies.filter(l => l.voice === String(oldState.channel.id))
        if( oldState.channel && newState.channel.id !== oldState.channel.id){
            if(oldState.channel.members.size === 0){
                
                if(lobby.closed) db.updateLobbyState(lobby.role, false);
            }
            
        }
    })
})*/

client.on('guildCreate', guild => { //-> event triggered when the bot joins a new server; useful for future applications w/managing multiple servers for more robust experience
    db.joinedNew(guild.id);
}) 

/*
    DONE:
    - !join -> add user to random open lobby (applies role for lobby, @'s the user in its text, and attempts to move user to its voice) - will not place a user in an empty lobby 
      unless there is no other choice (all lobbies either full or empty)
    - !leave -> remove role for lobby (will make the user unable to see the lobby's channels anymore)
    - !join-empty -> add user to empty lobby & set it to private
    - !invite @user -> send pm inviting the mentioned user to the caller's current lobby
    - !setup-lobbies <numLobbies> -> set up bot with numLobbies lobbies (voice channels, text channels, and roles); also creates Lobby category if it doesn't exist already
    - !open -> sets lobby the caller is currently in to open/public (joinable by randos via !join)
    - !close -> sets lobby the caller is currently in to closed/private (not joinable by randos via !join)
    PLANNED COMMANDS:
    - !help -> list ImposterBot commands :)) (need to add 'usage' property for every command)
    - event listeners for automatically opening lobbies when they become empty, removing roles when a user goes inactive, etc.
    PLANNED FIXES:
    - !setup-lobbies -> alter to update lobby state (initialize new lobbies to open) and check permissions before executing command
*/