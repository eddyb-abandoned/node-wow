var events = require('events'), net = require('net');
var util = require('./util'), wow = require('./data'), BigNum = util.BigNum;
var opCodes = wow.authOpCodes;
var crypto = require('./crypto'), H = crypto.hash('sha1');
var k = BigNum(3); // SRP6 constant.

function Socket() {
    events.EventEmitter.call(this);

    this._socket = new net.Socket({type: 'tcp4'});
    this._socket.on('error', this.emit.bind(this, 'error'));
    this._socket.on('close', this.emit.bind(this, 'close', 'Socket closed.'));
    this._socket.on('data', this.processPackets.bind(this));
    this._socket.on('connect', this.sendChallenge.bind(this));
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.connect = function connect(server, username, password) {
    username = username.toUpperCase(), password = password.toUpperCase();
    this.username = username;
    this.HUserPass = H(username+':'+password);

    // Attempt to find local IP.
    if(this.ip = util.findLocalIPv4())
        this.ip = this.ip.split('.').map(function(x){return +x;});
    else {
        console.warn('Can\'t find local IPv4!');
        this.ip = [10, 0, 0, 1];
    }

    server = server.split(':');
    this._socket.connect(server[1] || 3724, server[0]);
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
    if(op == opCodes.LOGON_CHALLENGE) {
        var error = pkt.u8();
        if(error)
            return this.emit('error', 'Challenge error '+error), pkt.len();
        /*unknown*/pkt.skip(1);
        var B = pkt.bytes(32);
        var glen = pkt.u8(), g = pkt.bytes(glen);
        var Nlen = pkt.u8(), N = pkt.bytes(Nlen);
        var s = pkt.bytes(32);
        /*unknown*/pkt.skip(16);
        /*some security stuff*/pkt.skip(1);

        this.sendProof(g, N, B, s);
    } else if(op == opCodes.LOGON_PROOF) {
        var error = pkt.u8();
        if(error)
            return this.emit('error', 'Proof error '+error), pkt.len();
        var Ms = pkt.bytes(20);
        /*unk1*/pkt.u32LE(); // Accountflags. 0x01 = GM, 0x08 = Trial, 0x00800000 = Pro pass (arena tournament)
        /*unk2*/pkt.u32LE(); // SurveyId
        /*unk3*/pkt.u16LE();

        for(var i = 0; i < 20; i++)
            if(Ms[i] != this.Ms[i])
                return this.emit('error', 'Invalid M_s'), pkt.len();
        process.nextTick(this.emit.bind(this, 'authenticated'));
    } else if(op == opCodes.REALM_LIST) {
        var len = pkt.u16LE();
        /*unknown*/pkt.skip(4);
        var n = pkt.u16LE(), realms = [];
        for(var i = 0; i < n; i++)
            realms.push({
                type: pkt.u8(),
                status: pkt.u8(),
                color: pkt.u8(),
                name: pkt.cString(),
                server: pkt.cString(),
                population: pkt.u32LE(),
                chars: pkt.u8(),
                timezone: pkt.u8(),
                unknown: pkt.u8()
            });
        /*unknown*/pkt.skip(2);
        process.nextTick(this.emit.bind(this, 'realms', realms));
    } else
        this.emit('error', 'Unrecognized packet: op='+op);
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
    console.log('Deprecated in AuthClientSocket', op);
    var args = [].slice.call(arguments, 1);
    args.unshift(Buffer([op]));
    this._socket.write(util.concatBuffers.apply(null, args));
};

Socket.prototype.sendChallenge = function sendChallenge() {
    var username = new Buffer(this.username, 'ascii');
    this.packet(opCodes.LOGON_CHALLENGE)
        .u8(/*error*/8)
        .u16LE(/*packetSize*/30+this.username.length)
        .cString(/*gameName*/'WoW')
        /*version*/.u8(wow.versionMajor).u8(wow.versionMinor).u8(wow.versionPatch)
        .u16LE(/*build*/wow.buildNumber)
        .cString(/*platform*/'68x')
        .cString(/*os*/'niW')
        .bytes(/*country*/Buffer('BGne'))
        .u32LE(/*timezoneBias*/2*60)
        .bytes(/*ip*/Buffer(this.ip))
        .u8(/*SRP_I_len*/username.length)
        .bytes(/*SRP_I*/username)
        .send();
};

Socket.prototype.sendProof = function sendProof(_g, _N, _B, _s) {
    var g = BigNum.fromLE(_g);
    var N = BigNum.fromLE(_N);

    var a = BigNum.fromLE(crypto.randomBytes(19));
    var A = g.powm(a, N), _A = util.ensureSize(A.toLE(), 32);
    var B = BigNum.fromLE(_B);

    var u = BigNum.fromLE(H(_A, _B));
    var x = BigNum.fromLE(H(_s, this.HUserPass));
    var v = g.powm(x, N);
    var S = B.sub(v.mul(k)).powm(a.add(u.mul(x)), N);

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

    var HNxorHg = H(_N), Hg = H(_g);
    for(var i = 0; i < 20; i++)
        HNxorHg[i] ^= Hg[i];
    
    var M = H(HNxorHg, H(this.username), _s, _A, _B, K);
    this.Ms = H(_A, M, K);
    this.K = K;

    this.packet(opCodes.LOGON_PROOF).bytes(_A).bytes(M).bytes(wow.authCrcHash).u16LE(/*unknown*/0).send();
};

Socket.prototype.requestRealmList = function requestRealmList() {
    this.packet(opCodes.REALM_LIST).bytes(/*unknown*/5).send();
};

module.exports = Socket;
