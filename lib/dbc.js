var fs = require('fs');

exports.load = function load(file, struct) {
    var data = fs.readFileSync(file);
    var magic = data.slice(0, 4);
    if(magic.toString('ascii') !== 'WDBC')
        throw new Error('Wrong magic: '+magic.inspect()+' '+magic.toString('utf8'));

    var recordCount = data.readUInt32LE(4), fieldCount = data.readUInt32LE(8);
    var recordSize = data.readUInt32LE(12), stringSize = data.readUInt32LE(16);
    var recordData = data.slice(20, 20+recordCount*recordSize), stringData = data.slice(20+recordCount*recordSize);

    var records = [];
    for(var i = 0; i < recordCount; i++) {
        var j = i*recordSize, record = {};
        for(var k in struct) {
            var t = struct[k];
            if(t === 'u32')
                record[k] = recordData.readUInt32LE(j);
            else if(t === 'i32')
                record[k] = recordData.readInt32LE(j);
            else if(t === 'float')
                record[k] = recordData.readFloatLE(j);
            else if(t === 'string') {
                var start = recordData.readUInt32LE(j);
                for(var end = start; end < stringData.length && stringData[end]; end++);
                record[k] = stringData.slice(start, end).toString('ascii');
            }
            j += 4;
        }
        records.push(record);
    }
    return records;
};
