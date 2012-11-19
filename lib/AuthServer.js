var events = require('events'), net = require('net');
var util = require('./util'), wow = require('./data'), BigNum = util.BigNum;
var opCodes = wow.authOpCodes;
var crypto = require('./crypto'), H = crypto.hash('sha1');
var k = BigNum(3); // SRP6 constant.
// SRP6 constants from Trinity/SkyFire.
var g = BigNum(7), N = BigNum('894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7', 16);
// Cached data.
var _g = g.toLE(), _N = util.ensureSize(N.toLE(), 32);
var HNxorHg = H(_N), Hg = H(_g);
for(var i = 0; i < 20; i++)
    HNxorHg[i] ^= Hg[i];

function makeRealmData(realms) {
    if(!Array.isArray(realms))
        realms = [realms];
    var data = new util.BufferWriter;
    data.u16LE(realms.length);
    for(var i = 0; i < realms.length; i++) {
        var r = realms[i];
        data.u8(r.type).u8(r.status).u8(r.color).cString(r.name).cString(r.server)
            .u32LE(r.population).u8(r.chars).u8(r.timezone).u8(/*unknown*/0x2c);
    }
    return data.end();
}

function Server() {
    net.Server.call(this);
    this._realmData = makeRealmData([]);
}

util.inherits(Server, net.Server);

Server.prototype.on = function on(event, f) {
    if(event == 'connection')
        return net.Server.prototype.on.call(this, event, function(socket) {return f(new Socket(socket, this));}.bind(this));
    return net.Server.prototype.on.apply(this, arguments);
};

Server.prototype.listen = function listen(port, host, listeningListener) {
    return net.Server.prototype.listen.call(this, port || 3724, host, listeningListener);
};

Server.prototype.setRealms = function setRealms(realms) {
    this._realmData = makeRealmData(realms);
};

exports.Server = Server;
exports.createServer = function createServer(connectionListener) {
    var server = new Server();
    if(connectionListener)
        server.on('connection', connectionListener);
    return server;
};

exports.hashUserPass = function hashUserPass(username, password) {
    return H(username.toUpperCase()+':'+password);
};

function Socket(socket, server) {
    events.EventEmitter.call(this);
    
    this._socket = socket;
    this._socket.on('error', this.emit.bind(this, 'error'));
    this._socket.on('close', this.emit.bind(this, 'close', 'Socket closed.'));
    this._socket.on('data', this.processPackets.bind(this));

    this._realmData = server._realmData;
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.setRealms = function setRealms(realms) {
    this._realmData = makeRealmData(realms);
};

Socket.prototype.processPackets = function processPackets(data) {
    if(this._pending)
        data = util.concatBuffers(this._pending, data);
    for(var start = 0; start < data.length;) {
        try {
            start += this.processPacket(data, start);
        } catch(e) {
            this._pending = data.slice(start);
            console.log(e, this._pending);
            return;
        }
    }
    this._pending = null;
};

Socket.prototype.processPacket = function processPacket(data, start) {
    var pkt = new util.BufferReader(data, start), op = pkt.u8();
    if(op == opCodes.LOGON_CHALLENGE || op == opCodes.RECONNECT_CHALLENGE) {
        var error = pkt.u8();
        //if(error != 8)
        //    return this.emit('error', 'Challenge error '+error), pkt.len();
        var size = pkt.u16LE();
        this.info = {
            gameName: pkt.cString(),
            version: [pkt.u8(), pkt.u8(), pkt.u8()],
            build: pkt.u16LE(),
            platform: pkt.cString(),
            os: pkt.cString(),
            country: pkt.bytes(4).toString('ascii'),
            timezoneBias: pkt.u32LE(),
            ip: [pkt.u8(), pkt.u8(), pkt.u8(), pkt.u8()],
            username: pkt.bytes(pkt.u8()).toString('ascii').toUpperCase()
        };
        process.nextTick(this.emit.bind(this, 'challenge', this.info.username, op == opCodes.RECONNECT_CHALLENGE));
    } else if(op == opCodes.LOGON_PROOF) {
        var _A = pkt.bytes(32);
        var Mc = pkt.bytes(20);
        /*crc_hash*/pkt.skip(20);
        /*number_of_keys*/pkt.u8();
        /*security flags*/pkt.u8();
        if(this.sendProof(_A, Mc))
            this.emit('error', 'User '+this.info.username+' failed to authenticate!');
        else
            process.nextTick(this.emit.bind(this, 'authenticated'));
    } else if(op == opCodes.RECONNECT_PROOF) {
        var R1 = pkt.bytes(16);
        var R2 = pkt.bytes(20);
        /*crc_hash or R3?*/pkt.skip(20);
        /*number_of_keys*/pkt.u8();
        if(this.sendReProof(R1, R2))
            this.emit('error', 'User '+this.info.username+' failed to (re)authenticate!');
        else
            process.nextTick(this.emit.bind(this, 'authenticated'));
    } else if(op == opCodes.REALM_LIST) {
        /*unknown*/pkt.skip(4);
        this.sendRealmList();
    } else {
        this.emit('error', 'Unrecognized packet: op='+op);
        this._socket.destroy();
        throw new Error;
    }
    return pkt.len();
};

Socket.prototype.packet = function packet(op) {
    var pkt = new util.BufferWriter;
    pkt.u8(op);
    var socket = this._socket;
    pkt.send = function write() {
        socket.write(this.end());
    };
    return pkt;
};

Socket.prototype.write = function write(op) {
    console.log('Deprecated in AuthServer', op);
    var args = [].slice.call(arguments, 1);
    args.unshift(Buffer([op]));
    this._socket.write(util.concatBuffers.apply(null, args));
};

Socket.prototype.sendChallengeError = function sendChallengeError(error) {
    this.packet(opCodes.LOGON_CHALLENGE).u8(/*unknown*/0).u8(error).send();
};

Socket.prototype.sendReChallengeError = function sendReChallengeError(error) {
    this.packet(opCodes.RECONNECT_CHALLENGE).u8(/*unknown*/0).u8(error).send();
};

Socket.prototype.sendChallenge = function sendChallenge(HUserPass) {
    this.HUserPass = HUserPass;

    var _s = this._s = crypto.randomBytes(32);
    var x = BigNum.fromLE(H(_s, HUserPass));
    var v = this.v = g.powm(x, N);
    
    var b = this.b = BigNum.fromLE(crypto.randomBytes(19));
    var B = v.mul(k).add(g.powm(b, N)).mod(N), _B = this._B = util.ensureSize(B.toLE(), 32);
    
    this.packet(opCodes.LOGON_CHALLENGE)
        .u8(/*unknown*/0)
        .u8(/*error*/0)
        .bytes(_B)
        .u8(_g.length).bytes(_g)
        .u8(_N.length).bytes(_N)
        .bytes(_s)
        .bytes(/*unknown*/crypto.randomBytes(16))
        .u8(/*security stuff*/0)
        .send();
};

Socket.prototype.sendReChallenge = function sendReChallenge(K) {
    if(K)
        this.K = K;
    this.packet(opCodes.RECONNECT_CHALLENGE)
        .u8(/*error*/0)
        .bytes(this._reconnectProof = crypto.randomBytes(16))
        .bytes(/*unknown*/16)
        .send();
};

Socket.prototype.sendProof = function sendProof(_A, Mc) {
    var A = BigNum.fromLE(_A);

    var u = BigNum.fromLE(H(_A, this._B));
    var S = A.mul(this.v.powm(u, N)).powm(this.b, N);

    var t = util.ensureSize(S.toLE(), 32), t1 = Buffer(16), t2, K = Buffer(40);

    for(var i = 0; i < 16; i++)
        t1[i] = t[i * 2];
    t2 = H(t1);
    for(var i = 0; i < 20; i++)
        K[i * 2] = t2[i];

    for(var i = 0; i < 16; i++)
        t1[i] = t[i * 2 + 1];
    t2 = H(t1);
    for(var i = 0; i < 20; i++)
        K[i * 2 + 1] = t2[i];

    var M = H(HNxorHg, H(this.info.username), this._s, _A, this._B, K);
    for(var i = 0; i < 20; i++)
        if(M[i] != Mc[i]) {
            // HACK FIXME use a real error code instead of 1.
            this.packet(opCodes.LOGON_PROOF).u8(1).send();
            return true;
        }

    var Ms = H(_A, M, K);
    this.K = K;

    this.packet(opCodes.LOGON_PROOF)
        .u8(/*error*/0)
        .bytes(Ms)
        .u32LE(/*unk1*/0x00800000) // Accountflags. 0x01 = GM, 0x08 = Trial, 0x00800000 = Pro pass (arena tournament)
        .u32LE(/*unk2*/0)          // SurveyId
        .u16LE(/*unk2*/0)
        .send();
};

Socket.prototype.sendReProof = function sendReProof(R1, R2) {
    var R = H(R1, this._reconnectProof, this.K);

    for(var i = 0; i < 20; i++)
        if(R[i] != R2[i]) {
            console.error('reconnection kinda failed', R, R2);
            //return true;
            break;
        }

    this.packet(opCodes.RECONNECT_PROOF).u8(/*error*/0).u8(/*unkown*/0).u16LE(/*unkown*/0).send();
};

Socket.prototype.sendRealmList = function sendRealmList() {
    var data = this._realmData;
    this.packet(opCodes.REALM_LIST)
        .u16LE(4+data.length+2)
        .u32LE(/*unknown*/0)
        .bytes(data)
        /*unknown*/.u8(0x10).u8(0x00)
        .send();
};
