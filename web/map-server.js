var fs = require('fs'), express = require('express'), execFile = require('child_process').execFile, util = require('util');
var app = express.createServer(), upnp = require('nat-upnp').createClient();

app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/static'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    app.use(app.router);
});

var dataDir = process.env.HOME+'/Games/World of Warcraft/Data';
var mapDir = __dirname + '/map';
var dbcDir = __dirname + '/../dbc', dbc = require('../lib/dbc'), wow = require('../lib/data');
var dbcAreas = dbc.load(dbcDir+'/WorldMapArea.dbc', wow.dbcDefs.WorldMapArea);
var dbcOverlays = dbc.load(dbcDir+'/WorldMapOverlay.dbc', wow.dbcDefs.WorldMapOverlay);
var areaByName = {}, areaIDToOverlays = {};
for(var i = 0; i < dbcAreas.length; i++) {
    var area = dbcAreas[i];
    // Invert the coordinates as WoW uses a weird system.
    area.x1 = -area.x1;
    area.x2 = -area.x2;
    area.y1 = -area.y1;
    area.y2 = -area.y2;
    areaByName[area.name] = area;
    areaIDToOverlays[area.id] = [];
}
for(var i = 0; i < dbcOverlays.length; i++)
    areaIDToOverlays[dbcOverlays[i].base].push(dbcOverlays[i]);

app.get('/', function(req, res) {
    res.send('<a href="/maps">Maps</a>');
});

app.get('/maps', function(req, res) {
    res.send(dbcAreas.map(function(x) {
        var overlays = areaIDToOverlays[x.id];
        return '<a href="/map/'+x.name+'">'+x.name+'</a>'+/*' <code>'+util.inspect(x)+' '+util.inspect(overlays)+'</code>'*/'<br>';
    }).join('<br>'));
});

function putMap(res, names, marks) {
    var r = '<!doctype html><style>';
    // Uses 675px instead of 3*256px because that's closer to the right height.
    r += '.map {position: relative; width: '+(4*256)+'px; height: '+675/*(3*256)*/+'px}';
    r += '.map>* {position: absolute;}';
    r += '.mark {width: 20px; height: 20px; margin-left: -10px; margin-right: -10px; border-radius: 50%}';
    r += '</style>';

    if(typeof names === 'string')
        names = [names];

    for(var i = 0; i < names.length; i++) {
        var name = names[i], area = areaByName[name], overlays = areaIDToOverlays[area.id];
        r += '<div class=map>';
        function putImage(n, i, x, y) {
            r += '<img src="/map/'+name+'/'+n+i+'" style="left:'+x+'px;top:'+y+'px">';
        }
        // Base map.
        for(var y = 0; y < 3; y++)
            for(var x = 0; x < 4; x++)
                putImage(name, y*4+x+1, x*256, y*256);
        // Overlays.
        for(var j = 0; j < overlays.length; j++) {
            var o = overlays[j], horiz = Math.ceil(o.width/256), vert = Math.ceil(o.height/256);
            for(var y = 0; y < vert; y++)
                for(var x = 0; x < horiz; x++)
                    putImage(o.name, y*horiz+x+1, o.x+x*256, o.y+y*256);
        }
        // Marks.
        if(marks) {
            var areaW = area.x2 - area.x1, areaH = area.y2 - area.y1;
            for(var j = 0; j < marks.length; j++) {
                var x = (marks[j].x - area.x1)/areaW, y = (marks[j].y - area.y1)/areaH;
                if(x < 0 || x > 1 || y < 0 || y > 1)
                    continue;
                r += '<div class=mark style="left:'+(x*100)+'%;top:'+(y*100)+'%;background:'+(marks[j].color||'red')+'"'+(marks[j].title?' title="'+marks[j].title+'"':'')+'></div>'
            }
        }
        r += '</div>';
    }
    res.send(r);
}

app.get('/map/marks/:data', function(req, res) {
    var names = [];
    var marks = req.param('data').split(';').map(function(coords) {
        coords = coords.split(',');
        // Invert the coordinates (and swap them) as WoW uses a weird system.
        var map = +coords[0], x = -coords[2], y = -coords[1];
        for(var i = 0; i < dbcAreas.length; i++) {
            var area = dbcAreas[i];
            if(names.indexOf(area.name) !== -1)
                continue;
            if(area.map == map && area.x1 <= x && x <= area.x2 && area.y1 <= y && y <= area.y2)
                names.push(area.name);
        }
        return {x: x, y: y, title: coords[3]};
    });
    if(!names.length)
        res.send(404);
    putMap(res, names, marks);
});

app.get('/map/:name', function(req, res) {
    var names = req.param('name').split(',').filter(function(x) {return x in areaByName;});
    if(!names.length)
        res.send(404);
    putMap(res, names);
});

app.get('/map/:name/:file', function(req, res) {
    var name = req.param('name'), file = req.param('file').toLowerCase();
    if(!(name in areaByName))
        return res.send(404);

    var mapBase = mapDir+'/'+name, mapFile = mapBase+'/'+file;
    if(!fs.existsSync(mapBase))
        fs.mkdirSync(mapBase);
    if(fs.existsSync(mapFile+'.png'))
        return res.sendfile(mapFile+'.png');

    // Extract the BLP file.
    execFile('MPQExtractor', ['-c', '-e', 'Interface\\WorldMap\\'+name+'\\'+file+'.blp', '-o', mapBase, dataDir+'/enGB/locale-enGB.MPQ'], function(err, stdout) {
        if(/No file found!\s*$/.test(stdout) || /Failed to extract the file/.test(stdout) || !fs.existsSync(mapFile+'.blp'))
            return res.send(404);
        // Convert the BLP file to a PNG file.
        execFile('BLPConverter', ['-o', mapBase, mapFile+'.blp'], function(err, stdout) {
            // Remove the original BLP file.
            fs.unlinkSync(mapFile+'.blp');
            res.sendfile(mapFile+'.png');
        });
    });
});

var port = 8080;
app.listen(port);
upnp.portMapping({
    public: port,
    private: port,
    ttl: 100
}, function(err) {
    if(err)
        return console.error(err);
    upnp.externalIp(function(err, ip) {
        if(err)
            return console.error(err);
        console.log('Listening on http://'+ip+':'+port+'/');
    });
});