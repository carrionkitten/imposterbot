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

function emptyChannel(channel){
    channel.messages.fetch(1, force=true).then(m => {
        if(m.size > 0){
            channel.bulkDelete(100);
            emptyChannel(channel);
        }
    })
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
    console.log(member);
    db.getInvites(member.guild.id, (dbinvites) => {
        member.guild.fetchInvites().then(invites => {
            const invitePairs = dbinvites.map(dbinv => {
                const dc = invites.get(dbinv.code);
                return {db: dbinv, discord: dc};
            })
            var newUse = null;
            var target = invitePairs.find(inv => 
                inv.discord && inv.discord.uses > inv.db.uses
                );
            if(target){
                newUse = {
                    user: member.id, 
                    inviter: target.discord.inviter.id,
                    server: member.guild.id
                };
            }
            db.inviteUse(invites, newUse);
        });
    });
})

client.on('rateLimit', (rateLimitInfo) =>{
    console.log(rateLimitInfo);
})

client.on('voiceStateUpdate', (oldState, newState) => {
    // if lobby becomes empty, update to open + clear text
    if(!oldState.channel || (oldState.channel && newState.channel && oldState.channel.id === newState.channel.id)) // if joining a channel or channel has not changed
        return;
    db.getLobbies(oldState.guild.id, lobbies => {
        const lobby = lobbies.find(l => l.voice === String(oldState.channel.id))
        if( lobby && (!newState.channel || newState.channel.id !== oldState.channel.id)){ // Left lobby voice channel
            oldState.member.roles.remove(lobby.role);            
            if(oldState.channel.members.size === 0){ // Lobby now empty (clear text channel + open lobby again)
                const text = oldState.guild.channels.resolve(lobby.text);
                emptyChannel(text);
                
                if(lobby.closed) 
                    db.updateLobbyState(lobby.role, false);
            }
        }
    })
})

client.on('guildCreate', guild => { //-> event triggered when the bot joins a new server; useful for future applications w/managing multiple servers for more robust experience
    db.joinedNew(guild.id);
}) 

/*
    ***COMPLETED COMMANDS***:
    - **!join** -> add user to random open lobby (applies role for lobby, @'s the user in its text, and attempts to move user to its voice) - will not place a user in an empty lobby unless there is no other choice (all lobbies either full or empty)
    - **!leave** -> remove role for lobby (will make the user unable to see the lobby's channels anymore)
    - **!join-empty** -> add user to empty lobby & set it to private
    - **!invite @user** -> send pm inviting the mentioned user to the caller's current lobby
    - **!weirdban @user** -> Ban the user from the server and posts a message saying "@user has been banned for being <:WEIRDCHAMP:767276490844143636>" - only works for users with ban permissions
    - **!set-code <code>** -> (Only works for bot-managed lobbies/lobbies joined via !join) update the lobby name for the caller's current lobby to include code (ex: !set-code RIPQWQ updates your current lobby to "Lobby# | RIPQWQ") *Channel names can only be updated 2 times every 10 minutes, so if you call this too frequently, it won't work every time*
    - **!open** -> set lobby the caller is currently in to open/public (joinable by randos via !join)
    - **!close** -> set lobby the caller is currently in to closed/private (not joinable by randos via !join)   
    - **!setup-lobbies <numLobbies>** -> set up bot with numLobbies lobbies (voice channels, text channels, and roles); also creates Lobby category if it doesn't exist already
    
    ***ADDITIONAL FUNCTIONALITY***:
    - The bot will now track who's invited who to the server via invite tracking
    - Once a bot-managed lobby becomes empty, its text channel will be cleared so that it's good as new for the next set of players to pass through
    - Just as using the !join command allows you to see a previously hidden bot-managed lobby, leaving the voice channel or calling !leave will remove the lobby role and prevent you from seeing the lobby anymore

    ***PLANNED COMMANDS/FUNCTIONALITY***:
    - **!help** -> list ImposterBot commands :))
    - **!q** -> Jump onto a waiting queue to receive a pm when a spot is available in the active lobby (need advice on details for this one)
    - Moderation commands for reporting/filing complaints about users, finding out who invited a user, and tracking a user's reputation status (ex: has been warned by a mod)

    FIXES NEEDED:
    - Correct !setup-lobbies so that it can recover if lobbies previously established are messed up
    - Check for privileges before !setup-lobbies command executes
*/

