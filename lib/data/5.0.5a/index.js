exports.buildNumber = 16057;
exports.versionMajor = 5;
exports.versionMinor = 0;
exports.versionPatch = 5;

var extend = require('util')._extend;
function _export(f) {
    extend(exports, require('./'+f));
}
_export('dbc');
_export('auth');
_export('realm');
_export('flags');
_export('fields');
_export('packets');
