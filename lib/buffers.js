var zlib = require('zlib');

function BufferReader(buffer, start) {
    if(!(this instanceof BufferReader))
        return new BufferReader(buffer, start);
    this._buffer = buffer;
    start = start || 0;
    this._start = start;
    this._pos = start;
}
BufferReader.prototype.len = function len() {
    return this._pos - this._start;
};
BufferReader.prototype.need = function need(n) {
    if(this._buffer.length < this._pos+n)
        throw new RangeError('BufferReader: Out of bounds');
};
BufferReader.prototype.skip = function skip(n) {
    this.need(n);
    this._pos += n;
};
BufferReader.prototype.bytes = function bytes(n) {
    var slice = this._buffer.slice(this._pos, this._pos+n);
    this._pos += n;
    return slice;
};
BufferReader.prototype.cString = function cString() {
    for(var i = this._pos; i < this._buffer.length && this._buffer[i]; i++);
    var str = this._buffer.slice(this._pos, i).toString('ascii');
    // Skip the \0.
    if(i < this._buffer.length)
        i++;
    this._pos = i;
    return str;
};
BufferReader.prototype.inflate = function inflate(n, cb) {
    if(typeof n === 'function')
        cb = n, n = this._buffer.length-this._pos;
    zlib.inflate(this.bytes(n), cb);
};
BufferReader.prototype.i8 = function i8() {
    return this._buffer.readInt8(this._pos++);
};
BufferReader.prototype.u8 = function u8() {
    return this._buffer.readUInt8(this._pos++);
};

function BufferWriter() {
    if(!(this instanceof BufferWriter))
        return new BufferWriter;
    this._data = [];
    this.length = 0;
}
BufferWriter.prototype.end = function end() {
    return Buffer.concat(this._data, this.length);
};
BufferWriter.prototype.bytes = function bytes(n, slice) {
    if(Buffer.isBuffer(n))
        slice = n, n = slice.length;
    else if(typeof n !== 'number')
        throw new TypeError('First argument should be a Buffer or a number.');
    if(!Buffer.isBuffer(slice)) {
        slice = new Buffer(n);
        slice.fill(0);
    }
    if(slice.length !== n)
        throw new RangeError('Length mismatch, something went wrong.');
    this._data.push(slice);
    this.length += n;
    return this;
};
BufferWriter.prototype.cString = function cString(str) {
    str = new Buffer(str, 'ascii');
    this._data.push(str, /*\0*/new Buffer([0]));
    this.length += str.length+1;
    return this;
};
BufferWriter.prototype.i8 = function i8(value) {
    var b = new Buffer(1);
    b.writeInt8(value || 0, 0);
    this._data.push(b);
    this.length++;
    return this;
};
BufferWriter.prototype.u8 = function u8(value) {
    var b = new Buffer(1);
    b.writeUInt8(value || 0, 0);
    this._data.push(b);
    this.length++;
    return this;
};
['LE', 'BE'].forEach(function(en) {
    [2, 4, 8].forEach(function(bytes) {
        ['i', 'u'].forEach(function(signed) {
            var bits = bytes*8, read = 'read'+(signed == 'u' ? 'U' : '')+'Int'+bits+en;
            BufferReader.prototype[signed+bits+en] = function() {
                var value = this._buffer[read](this._pos);
                this._pos += bytes;
                return value;
            };
            var write = 'write'+(signed == 'u' ? 'U' : '')+'Int'+bits+en;
            BufferWriter.prototype[signed+bits+en] = function(value) {
                var b = new Buffer(bytes);
                b[write](value || 0, 0);
                this._data.push(b);
                this.length += bytes;
                return this;
            };
        });
    });
    [4, 8].forEach(function(bytes) {
        var name = (bytes==8?'Double':'Float'), read = 'read'+name+en;
        BufferReader.prototype[name.toLowerCase()+en] = function() {
            var value = this._buffer[read](this._pos);
            this._pos += bytes;
            return value;
        };
        var write = 'write'+name+en;
        BufferWriter.prototype[name.toLowerCase()+en] = function(value) {
            var b = new Buffer(bytes);
            b[write](value || 0, 0);
            this._data.push(b);
            this.length += bytes;
            return this;
        };
    });
});

function GUID(type, entry, id) {
    if(!(this instanceof GUID))
        return new GUID(type, entry, id);

    this.type = type || 0;
    this.entry = entry || 0;
    this.id = id || 0;
}
GUID.type = require('./data').GUIDType;
GUID.prototype.hasEntry = function hasEntry() {
    switch(this.type) {
        case GUID.type.ITEM:
        case GUID.type.PLAYER:
        case GUID.type.DYNAMICOBJECT:
        case GUID.type.CORPSE:
        case GUID.type.GROUP:
            return false;
    }
    return true;
};
GUID.prototype.eq = function eq(guid) {
    return this.type == guid.type && this.id == guid.id;
};
GUID.prototype.typeName = function typeName() {
    switch(this.type) {
        case GUID.type.ITEM:         return 'item';
        case GUID.type.PLAYER:       return 'player';
        case GUID.type.GAMEOBJECT:   return 'gameObject';
        case GUID.type.TRANSPORT:    return 'transport';
        case GUID.type.UNIT:         return 'creature';
        case GUID.type.PET:          return 'pet';
        case GUID.type.VEHICLE:      return 'vehicle';
        case GUID.type.DYNAMICOBJECT:return 'dynObject';
        case GUID.type.CORPSE:       return 'corpse';
        case GUID.type.MO_TRANSPORT: return 'mo_transport';
        case GUID.type.GROUP:        return 'group';
    }
    return 'unknown';
};
GUID.prototype.inspect = function inspect() {
    if(!this.type && !this.id)
        return '<None>';
    var typeName = this.typeName().replace(/(?:^|_)\W*\w/g, function(x) {return x.toUpperCase();});
    if(this.hasEntry())
        typeName += ':'+this.entry;
    return '<'+typeName+' '+this.id+'>';
};
GUID.prototype.toBuffer = function toBuffer() {
    var b = new Buffer(8);
    b.fill(0);
    b.writeUInt32LE(this.id, 0);
    if(this.hasEntry())
        b.writeUInt32LE(this.entry, 3);
    b.writeUInt16LE(this.type, 6);
    return b;
};
GUID.fromBuffer = function fromBuffer(b) {
    var guid = new GUID(b.readUInt16LE(6), 0, b.readUInt32LE(0));
    if(guid.hasEntry()) {
        guid.id &= 0xffffff;
        guid.entry = b.readUInt32LE(3) & 0xffffff;
    }
    return guid;
};
exports.GUID = GUID;

BufferReader.prototype.GUID = function GUID() {
    return exports.GUID.fromBuffer(this.bytes(8));
};
BufferReader.prototype.packGUID = function packGUID() {
    var bits = this.u8(), bytes = new Buffer(8);
    bytes.fill(0);
    for(var i = 0; i < 8; i++)
        if(bits & (1 << i))
            bytes[i] = this.u8();
    return GUID.fromBuffer(bytes);
};

BufferWriter.prototype.GUID = function GUID(value) {
    this.bytes(8, value.toBuffer());
    return this;
};
BufferWriter.prototype.packGUID = function packGUID() {
    var bits = new Buffer([0]), bytes = value.toBuffer();
    this.bytes(1, bits);
    for(var i = 0; i < 8; i++)
        if(bytes[i]) {
            this.u8(bytes[i]);
            bits[0] |= 1 << i;
        }
    return this;
};

exports.BufferReader = BufferReader;
exports.BufferWriter = BufferWriter;
