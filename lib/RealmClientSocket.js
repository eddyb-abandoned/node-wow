var events = require('events'), net = require('net');
var util = require('./util'), wow = require('./data');
var crypto = require('./crypto'), hmac_sha1 = crypto.hmac('sha1');

var connectData = new Buffer('\0\0WORLD OF WARCRAFT CONNECTION - CLIENT TO SERVER\0', 'utf8');
if(wow.buildNumber > 15595) /* 4.3.4 */
    connectData.writeUInt16LE(connectData.length-2, 0);
else
    connectData.writeUInt16BE(connectData.length-2, 0);

function Socket() {
    events.EventEmitter.call(this);

    this._socket = new net.Socket({type: 'tcp4'});
    this._socket.on('error', this.emit.bind(this, 'error'));
    this._socket.on('close', this.emit.bind(this, 'close', 'Socket closed.'));
    this._socket.on('data', this.processPackets.bind(this));
    this._socket.on('connect', this._socket.write.bind(this._socket, connectData));
}

util.inherits(Socket, events.EventEmitter);

Socket.prototype.connect = function connect(server) {
    server = server.split(':');
    this._socket.connect(server[1], server[0]);
};

Socket.prototype.encryption = false;

Socket.prototype.setEncryption = function setEncryption(encryption, K) {
    this.encryption = !!encryption;
    if(K) {
        this.cipher = new crypto.RC4(hmac_sha1(wow.realmC2Skey, K));
        this.decipher = new crypto.RC4(hmac_sha1(wow.realmS2Ckey, K));
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
    var start = 0;
    if(this._pending) {
        data = util.concatBuffers(this._pending, data);
        if(this._pendingOp) {
            if(data.length >= this._pendingSize)
                this.processPacket(this._pendingOp, data.slice(0, this._pendingSize));
            start = this._pendingSize;
            this._pendingOp = this._pendingSize = null;
        }
        this._pending = null;
    }
    var headerSize = 4;
    if(wow.buildNumber > 15595) /* 4.3.4 */
        headerSize = 6;
    while(start+headerSize <= data.length) {
        var sizeAndOp = data.slice(start, start+headerSize);start += headerSize;
        if(this.encryption)
            sizeAndOp = this.decipher.update(sizeAndOp);
        var size, op;
        if(wow.buildNumber > 15595) { /* 4.3.4 */
            size = sizeAndOp.readUInt16LE(0)-4;
            op = sizeAndOp.readUInt32LE(2);
        } else {
            size = sizeAndOp.readUInt16BE(0)-2;
            op = sizeAndOp.readUInt16LE(2);
        }
        if(start+size > data.length)
            return this._pendingOp = op, this._pendingSize = size, this._pending = data.slice(start);
        this.processPacket(op, data.slice(start, start += size));
    }
    this._pending = start < data.length ? data.slice(start) : null;
};

Socket.prototype.write = function write(op, pkt) {
    var header = new Buffer(6);
    if(wow.buildNumber > 15595) /* 4.3.4 */
        header.writeUInt16LE(pkt.length+4, 0);
    else
        header.writeUInt16BE(pkt.length+4, 0);
    header.writeUInt32LE(op, 2);
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
    if(wow.buildNumber > 15595) { /* 4.3.4 */
        if(op == connectData.readUInt32LE(2))
            return;
    } else {
        if(op == connectData.readUInt16LE(2))
            return;
    }
    var pkt = new util.BufferReader(data);

    if(op == wow.realmOpCodes.SMSG_MULTIPLE_PACKETS) {
        this.emit('packetRecv', op, null, data);
        while(pkt._pos < pkt._buffer.length) {
            var parsed = null, start;
            try {
                op = pkt.u16LE();
                start = pkt._pos;
                parsed = wow.realmPacketRead(op, pkt);
            } catch(e) {
                this.emit('parseError', e);
                return;
            }
            this.emit('packetRecv', op, parsed, data.slice(start, pkt._pos), true);
        }
        return;
    }
    
    if(op == wow.realmOpCodes.SMSG_COMPRESSED_UPDATE_OBJECT) {
        this.emit('packetRecv', op, null, data);
        /*originalSize*/pkt.skip(4);
        pkt.inflate(function(err, data) {
            if(err)
                return this.emit('error', err);
            this.processPacket(wow.realmOpCodes.SMSG_UPDATE_OBJECT, data, true);
        }.bind(this));
        return;
    }
    
    try {
        pkt = wow.realmPacketRead(op, pkt);
    } catch(e) {
        this.emit('parseError', e);
        pkt = null;
    }
    this.emit('packetRecv', op, pkt, data, second);
};

Socket.prototype.sendAuthSession = function sendAuthSession(username, addonTable) {
    // FIXME Extra data, unused in SkyFire, intended for auth verification.
    this.send(wow.realmOpCodes.CMSG_AUTH_SESSION, {
        build: wow.buildNumber,
        addonTable: addonTable || [],
        account: username.toUpperCase()
    });
};
Socket.prototype.sendCharEnum = function sendCharEnum() {
    this.send(wow.realmOpCodes.CMSG_CHAR_ENUM);
};
Socket.prototype.sendPlayerLogin = function sendPlayerLogin(guid) {
    this.send(wow.realmOpCodes.CMSG_PLAYER_LOGIN, guid);
};

module.exports = Socket;
