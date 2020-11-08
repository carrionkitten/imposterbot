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
    createInvite(code, from, to, role, server){
        const now = new Date().toISOString().slice(0,19).replace('T', ' ');
        var q = `INSERT INTO invite (code, from_id, to_id, lobby_role, lobby_server, timestamp) 
                VALUES ("${code}", ${from}, ${to}, ${role}, ${server}, "${now}")
                ON DUPLICATE KEY UPDATE
                from_id = ${from}, to_id = ${to}, lobby_role = ${role}, 
                lobby_server = ${server}, timestamp = "${now}"`;
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
                return -1;
            }
            else return 0;
        });
    },
    fetchInvite(code, callback){
        var q = `SELECT * FROM invite, lobby WHERE code = "${code}" AND role = lobby_role`;
        connection.query(q, function(err, data){
            if(err || data.length < 1) callback(null);
            else callback(JSON.parse(JSON.stringify(data[0])));
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
            if(err) callback(null);
            else callback(JSON.parse(JSON.stringify(data)));
        });
    },
    newInvite(invite){
        const inviter = invite.inviter ? invite.inviter.id : 'NULL';
        const expires = invite.expiresAt ? new Date(invite.expiresAt).toISOString().slice(0,19).replace('T', ' ') : 'NULL';
        var q = `INSERT INTO server_invite (code, server_id, created_by, uses, expires) 
                VALUES ('${invite.code}', ${invite.channel.guild.id}, ${inviter}, 0, '${expires}')`;
        console.log(invite);
        
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
            }
        });
    },
    getInvites(guildid, callback){
        var q = `SELECT * FROM server_invite WHERE server_id = ${guildid}`;
        connection.query(q, function(err, data){
            if(err) callback(null);
            else callback(JSON.parse(JSON.stringify(data)));
        });
    },
    inviteUse(invites, newUse){
        var q = 0;
        const invs = invites.map( invite => {
            const inviter = invite.inviter ? invite.inviter.id : 'NULL';
            const expires = invite.expiresAt ? new Date(invite.expiresAt).toISOString().slice(0,19).replace('T', ' ') : 'NULL';
            return `('${invite.code}', ${invite.channel.guild.id}, ${inviter}, ${invite.uses}, '${expires}')`;
        });
        var q = `INSERT INTO server_invite (code, server_id, created_by, uses, expires) 
                VALUES ${invs}
                ON DUPLICATE KEY UPDATE
                uses = VALUES(uses)`
        connection.query(q, function(err, data){
            if(err){
                console.log(err);
            }
            if(newUse){
                var q1 = `INSERT INTO invited_by 
                (user_id, inviter_id, server_id)
                VALUES
                (${newUse.user}, ${newUse.inviter}, ${newUse.server})
                ON DUPLICATE KEY UPDATE
                inviter_id = VALUES(inviter_id)`;
                connection.query(q1, function(err, data){
                    if(err){
                        console.log(err);
                    }
                });
            }
        });
    }
}