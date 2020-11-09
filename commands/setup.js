const db = require("../db");

async function createChannel(name, roleId, message, categoryId, channelType){
    if(!message.guild.channels.cache.some(channel => (channel.name === name || channel.name === name.toLowerCase()) && channel.type === channelType)){
        return message.guild.channels.create(name, {
            type: channelType,
            parent: categoryId,
            userLimit: 10,
            permissionOverwrites: [
            {
                id: message.guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: roleId,
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
            },
            {
                id: message.guild.member(message.client.user.id),
                allow: ['SEND_MESSAGES', 'VIEW_CHANNEL']
            }
            ],
        }).then();
    }
    else{
        c = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === name.toLowerCase() && channel.type === channelType)
        return c;
    }
}

async function createLobby(role, message, categoryId){
    let typeList = ['voice', 'text'];
    let promises = typeList.map( t => {return createChannel(role.name, role.id, message, categoryId, t)});
    return Promise.all(promises).then(vals => {
        return {
            role: role, 
            [typeList[0]+'id']: vals[0].id, 
            [typeList[1]+'id']: vals[1].id
        };
    })
}

function getLobbyCategory(message, callback){
    if(!message.guild.channels.cache.some(channel => channel.name === 'Lobby' && channel.type === 'category')){
        message.guild.channels.create('Lobby', {type: 'category', position: 1})
        .then(channel => callback(channel.id));
    }
    else{
        callback(message.guild.channels.cache.find(channel => channel.name === 'Lobby' && channel.type === 'category').id);
    }
}

module.exports = {
    name: 'setup-lobbies',
    description: 'given a number of lobbies x, sets up roles + voice and text chats for x lobbies',
    execute(message, args){
        if(args.length !== 1 || parseInt(args[0]) === NaN){
            return message.reply(`Please provide a number of lobbies to set up! \nNote: If you have already run this command, please provide the new total number of lobbies desired (ex: if you have 40 lobbies and you want to have 80, type "!setupLobbies 80")`);
        }

        const x = parseInt(args[0]);
        
        let createdLobbies = [];

        getLobbyCategory(message, categoryId => {
            message.guild.roles.fetch() // get all roles for server
            .then(roles => {
                for(i = 0; i < x; i++){
                    const name = `Lobby${i+1}`;
                    if(!roles.cache.some(role => role.name === name)){ // if lobby doesn't exist already, create it
                        roles.create({
                            data: {name: name},
                            reason: "Setting up lobby"
                        }).then(createdRole => {
                            console.log(`Role created: ${createdRole.id}`);
                            createdLobbies.push(createLobby(createdRole, message, categoryId));
                        })
                    }
                    else{
                        const targetRole = roles.cache.find(role => role.name === name);
                        console.log(`Role existed: ${targetRole.id}`);
                        createdLobbies.push(createLobby(targetRole, message, categoryId));
                    }
                }
                if(createdLobbies.length > 0){
                    Promise.all(createdLobbies).then(lobbies => {
                        db.createLobbies(lobbies);
                    })
                }
                message.reply(`setup for ${x} lobbies complete`);
            })
        })
    }
}