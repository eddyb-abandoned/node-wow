var events = require('events'), net = require('net');
var util = require('./util'), wow = require('./data');
var crypto = require('./crypto'), hmac_sha1 = crypto.hmac('sha1');

var connectData = new Buffer('\0\0WORLD OF WARCRAFT CONNECTION - SERVER TO CLIENT\0', 'utf8');
if(wow.buildNumber > 15595) /* 4.3.4 */
    connectData.writeUInt16LE(connectData.length-2, 0);
else
    connectData.writeUInt16BE(connectData.length-2, 0);

function Server() {
    net.Server.call(this);
}

util.inherits(Server, net.Server);

Server.prototype.on = function on(event, f) {
    if(event == 'connection')
        return net.Server.prototype.on.call(this, event, function(socket) {return f(new Socket(socket, this));}.bind(this));
    return net.Server.prototype.on.apply(this, arguments);
};

Server.prototype.listen = function listen(port, host, listeningListener) {
    return net.Server.prototype.listen.call(this, port || 8085, host, listeningListener);
};

exports.Server = Server;
exports.createServer = function createServer(connectionListener) {
    var server = new Server();
    if(connectionListener)
        server.on('connection', connectionListener);
    return server;
};

function Socket(socket, server) {
    events.EventEmitter.call(this);

    this._socket = socket;
    this._socket.on('error', this.emit.bind(this, 'error'));
    this._socket.on('close', this.emit.bind(this, 'close', 'Socket closed.'));
    this._socket.on('data', this.processPackets.bind(this));
    
    this._socket.write(connectData);
    this.sendAuthChallenge();
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.encryption = false;

Socket.prototype.setEncryption = function setEncryption(encryption, K) {
    this.encryption = !!encryption;
    if(K) {
        this.cipher = new crypto.RC4(hmac_sha1(wow.realmS2Ckey, K));
        this.decipher = new crypto.RC4(hmac_sha1(wow.realmC2Skey, K));
        this.cipher.discard(1024);
        this.decipher.discard(1024);
    }
};

Socket.prototype.processPackets = function processPackets(data) {
    if(this.encryption) {
        if(this._pendingDecryption)
            data = util.concatBuffers(this._pendingDecryption, data);
        if(!this.decipher)
            return this._pendingDecryption = data;
        this._pendingDecryption = null;
    }
    var self = this;
    function tryProcess(op, start, size) {
        try {
            self.processPacket(op, data.slice(start, start+size));
        } catch(e) {
            self.emit('error', e);
        }
    }
    var start = 0;
    if(this._pending) {
        data = util.concatBuffers(this._pending, data);
        if(this._pendingOp) {
            if(data.length >= this._pendingSize)
                tryProcess(this._pendingOp, 0, this._pendingSize);
            start = this._pendingSize;
            this._pendingOp = this._pendingSize = null;
        }
        this._pending = null;
    }
    while(start+6 <= data.length) {
        var sizeAndOp = data.slice(start, start+6);start += 6;
        if(this.encryption)
            sizeAndOp = this.decipher.update(sizeAndOp);
        var size, op = sizeAndOp.readUInt32LE(2);
        if(wow.buildNumber > 15595) /* 4.3.4 */
            size = sizeAndOp.readUInt16LE(0)-4;
        else
            size = sizeAndOp.readUInt16BE(0)-4;
        if(start+size > data.length)
            return this._pendingOp = op, this._pendingSize = size, this._pending = data.slice(start);
        tryProcess(op, start, size);start += size;
    }
    this._pending = start < data.length ? data.slice(start) : null;
};

Socket.prototype.write = function write(op, pkt) {
    var header;
    if(wow.buildNumber > 15595) { /* 4.3.4 */
        header = new Buffer(6);
        header.writeUInt16LE(pkt.length+4, 0);
        header.writeUInt32LE(op, 2);
    } else {
        header = new Buffer(4);
        header.writeUInt16BE(pkt.length+2, 0);
        header.writeUInt16LE(op, 2);
    }
    if(this.encryption) {
        if(!this.cipher)
            return this.emit('error', 'Unable to send op='+op+', missing cipher');
        header = this.cipher.update(header);
    }
    this._socket.write(util.concatBuffers(header, pkt));
};

Socket.prototype.send = function send(op, data) {
    var pkt = wow.realmPacketWrite(op, data);
    if(pkt === null)
        return this.emit('error', 'Missing description for '+wow.realmOpNames[op]);
    this.emit('packetSend', op, data);
    this.write(pkt._op, pkt.data);
};

Socket.prototype.processPacket = function processPacket(op, data, second) {
    if(op == connectData.readUInt32LE(2))
        return;
    try {
        var pkt = wow.realmPacketRead(op, new util.BufferReader(data));
    } catch(e) {
        this.emit('parseError', e);
        pkt = null;
    }
    this.emit('packetRecv', op, pkt, data, second);
};

Socket.prototype.sendAuthChallenge = function sendAuthChallenge() {
    // FIXME Extra data, unused in SkyFire, intended for auth verification.
    this.send(wow.realmOpCodes.SMSG_AUTH_CHALLENGE);
};
