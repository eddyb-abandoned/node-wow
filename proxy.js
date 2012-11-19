var express = require('express');
var app = express.createServer(), io = require('socket.io').listen(app);

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/web'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    app.use(app.router);
});
io.set('log level', 2);

require('buffer').INSPECT_MAX_BYTES = Infinity;
Buffer.prototype.toJSON = function toJSON() {
    return this.inspect()+' '+this.toString('utf8');
};

var util = require('./lib/util'), wow = Object.create(require('./lib/data'));
util.GUID.prototype.toJSON = function toJSON() {
    return this.inspect();
};
wow.AuthServer = require('./lib/AuthServer');
wow.AuthClientSocket = require('./lib/AuthClientSocket');
wow.RealmServer = require('./lib/RealmServer');
wow.RealmClientSocket = require('./lib/RealmClientSocket');

var bnet2 = require('bnet2');

/*
function realm(server, username, K, charName) {
    var socket = new wow.RealmClientSocket;
    socket.on('error', function(e) {
        console.log('[ERROR] '+e);
        process.exit();
    });
    socket.on('close', function(message) {
        console.log('[REALM D/C] '+message);
        process.exit();
    });
    socket.on('packetRecvUnknown', function(op, data) {
        io.sockets.emit('log', wow.realmOpNames[op], data);
        op = '   \033[32m'+wow.realmOpNames[op].replace(/_(.*)$/, '_\033[1;32m$1\033[0;32m');
        data = util.inspect(data).replace(/<Buffer((?: [0-9a-f]{2})+)>/g, '<Buffer\033[1;33m$1\033[0;32m>');
        console.log(op, data+'\033[0m');
    });
    socket.on('packetSend', function(op, data) {
        io.sockets.emit('log', wow.realmOpNames[op], data);
        op = '   \033[34m'+wow.realmOpNames[op].replace(/_(.*)$/, '_\033[1;34m$1\033[0;34m');
        data = util.inspect(data).replace(/<Buffer((?: [0-9a-f]{2})+)>/g, '<Buffer\033[1;33m$1\033[0;34m>');
        console.log(op, data+'\033[0m');
    });
    function pretty(x) {
        // HACK cuts everything after the first newline, for ease of reading.
        return util.inspect(x, false, 10, true).replace(/<Buffer((?: [0-9a-f]{2})+)>/g, '<Buffer\033[1;33m$1\033[0m>').replace(/\n[\s\S]*$/, '');
    }
    function printPacket(op, obj) {
        io.sockets.emit('log', op, obj);
        util.print('\033[32m>\033[1m'+op+'\033[0m');
        if(obj && obj.__proto__ === Object.prototype)
            for(var i in obj)
                util.print(' \033[1m'+i+'\033[0m='+pretty(obj[i]));
        else if(arguments.length)
            util.print(' '+pretty(obj));
        //for(var i = 0; i < arguments.length; i++)
        //    util.print(' '+util.inspect(arguments[i], false, 10, true));
        util.print('\n');
    }
    for(var op in wow.realmOpCodes) {
        if(op[0] === 'C' || op === 'SMSG_UPDATE_OBJECT')
            continue;
        var op = op.replace(/^[^_]*_/, '').toLowerCase().replace(/_\w/g, function(x) {return x[1].toUpperCase();});
        socket.on(op, printPacket.bind(null, op));
    }
    socket.on('authChallenge', function() {
        socket.sendAuthSession(username);
        socket.setEncryption(true, K);
    });
    socket.on('authResponse', function() {
        socket.sendCharEnum();
    });
    socket.on('charEnum', function(chars) {
        var char;
        if(charName)
            for(var i = 0; i < chars.length; i++)
                if(chars[i].name == charName)
                    char = chars[i];
        //console.log(util.inspect(char, false, 10, true));
        if(char)
            socket.sendPlayerLogin(char.guid);
    });
    var knownObjects = [];
    socket.on('destroyObject', function(object) {
        for(var i = 0; i < knownObjects.length; i++)
            if(knownObjects[i].guid.type === object.guid.type && knownObjects[i].guid.id === object.guid.id)
                return knownObjects.splice(i, 1);
    });
    var fieldReaders = {
        float: function(b, i) {return b.readFloatLE(i*4);},
        u32: function(b, i) {return b.readUInt32LE(i*4);},
        u64: function(b, i) {return b.readUInt64LE(i*4);},
        GUID: function(b, i) {return util.GUID.fromBuffer(b.slice(i*4, i*4+8));}
    };
    socket.on('updateObject', function(update) {
        if(update.TODO)
            return printPacket('updateObject\033[31m###TODO='+update.TODO, update.update);

        var op, updateType = update.type; delete update.type;
        if(updateType == wow.updateType.VALUES)
            op = 'updateValues';
        else if(updateType == wow.updateType.CREATE_OBJECT)
            op = 'createObject';
        else if(updateType == wow.updateType.CREATE_OBJECT2)
            op = 'createObject2';
        else if(updateType == wow.updateType.OUT_OF_RANGE_OBJECTS)
            op = 'outOfRangeObjects';
        else
            return printPacket('updateOp/'+updateType, update);
        var map = update.map; delete update.map;
        op += '['+map+']'; // TODO map name.

        delete update.flags; // TODO should flags be there in the first place?

        if(updateType == wow.updateType.CREATE_OBJECT || updateType == wow.updateType.CREATE_OBJECT2) {
            var objectType = update.objectType;
            update.objectType = util.find(wow.objectType, objectType);
            knownObjects.push({guid: update.guid, type: objectType, movement: update.movement, map: map, fields: update.fields});
            delete update.guid; // NOTE the GUID is sent in the fields as well.
        } else if(updateType == wow.updateType.VALUES) {
            var objectType, oldFields;
            for(var i = 0; i < knownObjects.length; i++)
                if(knownObjects[i].guid.type === update.guid.type && knownObjects[i].guid.id === update.guid.id) {
                    objectType = knownObjects[i].type;
                    oldFields = knownObjects[i].fields;
                    break;
                }
            if(i >= knownObjects.length)
                return printPacket(op+'\033[31m###FAIL=unknownGUID', update);
        }
        if(update.fields) {
            var field = wow.objectTypeToField[objectType], fieldsInfo = field.fieldInfo, fields = {};
            var changes = update.changes; delete update.changes;
            for(var i = 0; i < changes.length; i++) {
                var fieldPos = changes[i], fieldName = util.findNumBase(field, fieldPos), fieldInfo = fieldsInfo[field[fieldName]] || {type: 'u32', size: 1};
                fieldPos = Math.floor(fieldPos/fieldInfo.size)*fieldInfo.size;
                if(field[fieldName] < fieldPos)
                    fieldName += '+'+(fieldPos - field[fieldName])/fieldInfo.size;
                if(fieldName in fields)
                    continue;

                var reader = fieldReaders[fieldInfo.type];
                // Ensure we always have enough space to read from.
                if(update.fields.length < (fieldPos+fieldInfo.size)*4) {
                    var data = new Buffer(fieldInfo.size*4);
                    data.fill(0);
                    update.fields.copy(data, 0, fieldPos*4);
                    fields[fieldName] = reader(data, 0);
                } else
                    fields[fieldName] = reader(update.fields, fieldPos);

                if(oldFields) {
                    fields[fieldName] = [reader(oldFields, fieldPos), fields[fieldName]];
                    for(var j = fieldPos*4; j < (fieldPos+fieldInfo.size)*4 && j < update.fields.length; j++)
                        oldFields[j] = update.fields[j];
                }
            }
            update.fields = fields;
        }
        printPacket(op, update);
    });
    process.on('SIGINT', function() {
        console.log('http://localhost:8080/map/marks/'+knownObjects.filter(function(o) {
            return !!o.movement;
        }).map(function(o) {
            return o.map+','+o.movement.x+','+o.movement.y+','+o.guid.inspect();
        }).join(';'));
        process.exit(0);
    });

    socket.connect(server);
    return socket;
}
*/

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/web/index.html');
});

var botEngine = require('./bot');

var proxies = {}, localIP = /*util.findLocalIPv4()||*/'127.0.0.1', nextPort = 8081;
function makeProxy(realmServerAddress) {
    var cleaners = [];
    var server = wow.RealmServer.createServer(function(cSocket) {
        var sSocket = new wow.RealmClientSocket;

        function destroy() {
            cSocket._socket.destroy();
            sSocket._socket.destroy();
        };

        cleaners.push(destroy);
        
        cSocket.on('error', function(e) {
            console.log('[RP/C ERROR]', e);
            destroy();
        });
        sSocket.on('error', function(e) {
            console.log('[RP/S ERROR]', e);
            destroy();
        });
        
        cSocket.on('parseError', function(e) {
            console.log('[RP/C PARSE ERROR]', e);
        });
        sSocket.on('parseError', function(e) {
            console.log('[RP/S PARSE ERROR]', e);
        });
        
        /*cSocket.on('packetRecvUnknown', function(op, data) {
            op = wow.realmOpNames[op] || op.toString(16);
            op = '   \033[34m'+op.replace(/_(.*)$/, '_\033[1;34m$1\033[0;34m');
            data = util.inspect(data).replace(/<Buffer((?: [0-9a-f]{2})+)>/g, '<Buffer\033[1;33m$1\033[0;34m>');
            console.log(op, data+'\033[0m');
        });
        sSocket.on('packetRecvUnknown', function(op, data) {
            op = wow.realmOpNames[op] || op.toString(16);
            op = '   \033[32m'+op.replace(/_(.*)$/, '_\033[1;32m$1\033[0;32m');
            data = util.inspect(data).replace(/<Buffer((?: [0-9a-f]{2})+)>/g, '<Buffer\033[1;33m$1\033[0;32m>');
            console.log(op, data+'\033[0m');
        });*/

        cSocket.on('packetSend', function(op, pkt) {
            var opName = wow.realmOpNames[op].replace(/^[^_]*_/, '').toLowerCase().replace(/_./g, function(x) {return x[1].toUpperCase();});
            io.sockets.emit('log', 'P->C.'+opName, pkt);
        });
        sSocket.on('packetSend', function(op, pkt) {
            var opName = wow.realmOpNames[op].replace(/^[^_]*_/, '').toLowerCase().replace(/_./g, function(x) {return x[1].toUpperCase();});
            io.sockets.emit('log', 'P->S.'+opName, pkt);
        });
        function handlePacket(op, pkt, data, server, dontPassToBot) {
            if(pkt === null) {
                io.sockets.emit('log', (server?'S.':'C.')+(wow.realmOpNames[op]||'0x'+op.toString(16)), data);
                return true;
            }
            if(!bot && !dontPassToBot)
                return true;
            var opName = wow.realmOpNames[op].replace(/^[^_]*_/, '').toLowerCase().replace(/_./g, function(x) {return x[1].toUpperCase();});
            io.sockets.emit('log', (server?'S.':'C.')+opName, pkt);
            if(dontPassToBot)
                return true;
            var original = {op: op, data: data, forward: true};
            bot.emit((server?'server.':'client.')+opName, pkt, original);
            return original.forward;
        }
        var username, addonTable, bot;
        cSocket.on('packetRecv', function(op, pkt, data, second) {
            if(op == wow.realmOpCodes.CMSG_AUTH_SESSION) {
                handlePacket(op, pkt, data, false, true);
                username = pkt.account.toLowerCase().replace(/%/g, '@').split(':')[0];
                addonTable = pkt.addonTable;
                cSocket.setEncryption(true, server.sessions[username].p2cK);
                
                sSocket.connect(realmServerAddress);
            } else if(handlePacket(op, pkt, data, false) && !second)
                sSocket.write(op, data);
        });
        sSocket.on('packetRecv', function(op, pkt, data, second) {
            if(op == wow.realmOpCodes.SMSG_AUTH_CHALLENGE) {
                handlePacket(op, pkt, data, true, true);
                sSocket.sendAuthSession(server.sessions[username].account, addonTable);
                sSocket.setEncryption(true, server.sessions[username].p2sK);
                
                bot = botEngine(cSocket, sSocket);
                bot.web = io.sockets;
            } else if(handlePacket(op, pkt, data, true) && !second)
                cSocket.write(op, data);
        });
    });
    server.sessions = {};
    server.clean = function() {
        for(var i = 0; i < cleaners.length; i++)
            cleaners[i]();
        cleaners = [];
    };
    server.listen(nextPort++);
    return server;
}

io.sockets.on('connection', function(socket) {
    socket.on('reload', function() {
        for(var i in proxies)
            proxies[i].clean();
        botEngine = require('./bot');
    });
});

function getRealms(authServerAddress, username, password, session, cb) {
    var socket = new wow.AuthClientSocket;
    socket.on('error', function(e) {
        console.log('[AUTH ERROR]', username+'@'+authServerAddress, e);
    });
    socket.on('close', function(message) {
        console.log('[AUTH D/C]', username+'@'+authServerAddress, message);
    });
    socket.on('authenticated', function() {
        socket.requestRealmList();
        session.password = password;
        session.p2sK = socket.K;
        session.account = username;
    });
    socket.on('realms', function(realms) {
        for(var i = 0; i < realms.length; i++) {
            var r = realms[i], proxy = proxies[r.server];
            if(!proxy)
                proxy = proxies[r.server] = makeProxy(r.server, session);
            proxy.sessions[username] = session;
            r.server = localIP+':'+proxy.address().port;
        }
        cb(realms);
    });
    socket.connect(authServerAddress, username, password);
    return socket;
}
function getRealmsBnet2(bnetServer, username, password, session, cb) {
    var socket = new bnet2.ClientSocket;
    socket.on('error', function(e) {
        console.log('[AUTH ERROR]', username, e);
    });
    socket.on('close', function(message) {
        console.log('[AUTH D/C]', username, message);
    });
    socket.on('parseError', console.error.bind(console));
    socket.on('authenticated', function() {
        session.password = password;
        session.p2sK = socket.K;
        session.account = socket.account;
        var realms = [{
            type: 0, status: 0, color: 0,
            name: 'Battle.net server',
            server: '195.12.234.151:3724',
            population: 1141211136, chars: 1, timezone: 1, unknown: 0
        }];
        for(var i = 0; i < realms.length; i++) {
            var r = realms[i], proxy = proxies[r.server];
            if(!proxy)
                proxy = proxies[r.server] = makeProxy(r.server, session);
            proxy.sessions[username] = session;
            r.server = localIP+':'+proxy.address().port;
        }
        cb(realms);
    });
    socket.connect(bnetServer, username, password, 'WoW', wow.buildNumber);
    return socket;
}
var sessions = {};
var authServer = wow.AuthServer.createServer(function(socket) {
    socket.on('error', function(e) {
        console.log('[AUTH ERROR]', socket.info&&socket.info.username, e);
    });
    socket.on('challenge', function(username, reconnect) {
        var userData = username.replace(/%/g, '@').split(':');
        // HACK FIXME use a real error code instead of 1.
        if(userData.length < 2)
            return socket.sendChallengeError(1);
        
        username = userData[0].toLowerCase();
        var serverAddress = userData.slice(1).join(':').toLowerCase(), session;
        
        if(!(session = sessions[serverAddress]))
            session = (sessions[serverAddress] = {})[username] = {};
        else if(!session[username])
            session = session[username] = {};
        else
            session = session[username];

        function sendRealms(realms) {
            if(!realms)
                realms = session.realms;
            else
                session.realms = realms;
            socket.setRealms(realms);
            if(reconnect)
                socket.sendReChallenge(session.p2cK);
            else {
                socket.on('authenticated', function() {
                    session.p2cK = socket.K;
                });
                socket.sendChallenge(wow.AuthServer.hashUserPass(socket.info.username, ' '));
            }
        }

        if(reconnect) {
            // HACK FIXME use a real error code instead of 1.
            if(!session.realms || !session.p2cK)
                return socket.sendReChallengeError(1);
            return sendRealms();
        }
        
        function login(password) {
            // HACK FIXME use a real error code instead of 1.
            if(!password)
                return socket.sendChallengeError(1);
            if(username.indexOf('@') === -1)
                getRealms(serverAddress, username, password, session, sendRealms);
            else
                getRealmsBnet2(serverAddress, username, password, session, sendRealms);
        }
        if(session.password)
            login(session.password);
        else {
            console.log('Please enter the password for', username+'@'+serverAddress, '(or press enter to ignore):');
            util.readPassword(login);
        }
    });
});

for(var i = 2; i < process.argv.length; i++) {
    var userData = process.argv[i].split('='), password = userData[1];
    userData = userData[0].toLowerCase().split(':');
    (sessions[userData[1]]||(sessions[userData[1]] = {}))[userData[0]] = {password: password};
}

authServer.listen();

app.listen(8080);
