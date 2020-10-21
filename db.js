var mysql = require('mysql');
const config = require('./config.json');

var connection = mysql.createConnection({
    ...config.dbInfo,
    supportBigNumbers: true,
    bigNumberStrings: true
});

connection.connect(function(err){
    if(err) throw err;
    else{
        console.log('Connected to DB :)');
    }
});

module.exports = {
    createInvite(message_id, from, role, server){
        var q = `INSERT INTO invite (message_id, from_id, lobby_role, lobby_server) 
                VALUES (${message_id}, ${from}, ${role}, ${server})`;
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
                return -1;
            }
            else return 0;
        });
    },
    fetchInvite(message_id){
        var q = `SELECT * FROM invite WHERE message_id = ${message_id}`;
        connection.query(q, function(err, data){
            console.log(data);
            if(err) return null;
            else return JSON.parse(JSON.stringify(data));
        });
    },
    joinedNew(guild){
        var q = `INSERT INTO server (id, botJoined)
                VALUES (${guild}, "${new Date().toISOString().slice(0,19).replace('T', ' ')}")`;
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
                return -1;
            }
            else return 0;
        });
    },
    createLobbies(lobbies){
        console.log(lobbies);
        const vals = lobbies.map(l => `("${l.role.name}", ${l.role.id}, ${l.role.guild.id}, ${l.voiceid}, ${l.textid}, 0)`).join(', ');
        console.log(vals);
        var q = `INSERT INTO lobby (name, role, server_id, voice, \`text\`, closed)
                VALUES ${vals}
                ON DUPLICATE KEY UPDATE
                voice = VALUES(voice),
                \`text\` = VALUES(\`text\`)`;
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
                return -1;
            }
            else return 0;
        });
    },
    updateLobbyState(roleid, closed){
        var q = `UPDATE lobby SET closed = ${+ closed} WHERE role = ${roleid}`;
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
                return -1;
            }
            else return 0;
        });
    },
    getLobbies(guildid, callback){
        var q = `SELECT * FROM lobby WHERE server_id = ${guildid}`;
        connection.query(q, function(err, data){
            console.log(data);
            if(err) callback(null);
            else callback(JSON.parse(JSON.stringify(data)));
        });
    },
}