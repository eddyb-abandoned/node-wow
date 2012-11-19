var wow = require('./index'), buffers = require('../../buffers'), extend = require('util')._extend;

function _(read, write) {
    if(!(this instanceof _))
        return new _(read, write);
    this.read = read;
    this.write = write || function(){throw new Error('Missing write function for some packet whatever');};
}

function Packet(op, stream) {
    this._op = op;
    this._stream = stream;
}

Packet.prototype.read = function read(r, def, parent) {
    if(!def)
        def = r, r = null;
    if(typeof def === 'number')
        return this._stream.bytes(def);
    if(typeof def === 'string') //HACK get parent[def] - might need to revise this.
        return parent[def];
    if(def instanceof _)
        return def.read.call(this, parent);
    if(!r)
        r = Array.isArray(def) ? [] : {};
    for(var i in def) {
        var v = this.read(def[i], null, r);
        if(v !== null)
            r[i] = v;
    }
    //HACK hidden properties - might need to revise this.
    if(!Array.isArray(def))
        for(var i in def)
            if(i[0] === '$' && i in r)
                delete r[i];
    return r;
};
//FIXME HACK Logic, my dear Watson. LOGIC
Packet.prototype.write = function write(def, v, parent) {
    if(typeof def === 'number')
        return this._stream.bytes(def, v);
    //FIXME HACK Logic, my dear Watson. LOGIC
    //if(typeof def === 'string') //HACK get parent[def] - might need to revise this.
    //    return parent[def];
    if(def instanceof _)
        return def.write.call(this, v, parent);
    for(var i in def)
        this.write(def[i], v && v[i], v);
};

function array(_n, def) {
    return _(function array(parent) {
        //NOTE This makes a copy of n to avoid touching the original one,
        // which would cause trouble when it's called multiple times.
        var a = [], n = _n;
        if(typeof n !== 'number')
            n = this.read(n, null, parent);
        for(var i = 0; i < n; i++) {
            var v = this.read(def, null, a);
            if(v !== null)
                a[i] = v;
        }
        return a;
    }, function array(a, parent) {
        var n = _n;
        if(typeof n !== 'number')
            this.write(_n, n = a.length, parent);
        for(var i = 0; i < n; i++)
            this.write(def, a[i], a);
    });
}

function eq(x, v, a, b) {
    return _(function(parent) {
        var w = this.read(x, null, parent) === v ? a : b;
        return w ? this.read(w, null, parent) : null;
    }, function(_v, parent) {
        //FIXME HACK Logic, my dear Watson. LOGIC
        var w = parent[x] === v ? a : b;
        w && this.write(w, _v, parent);
    });
}

function and(x, v, a, b) {
    return _(function(parent) {
        var w = this.read(x, null, parent) & v ? a : b;
        return w ? this.read(w, null, parent) : null;
    }, function(_v, parent) {
        //FIXME HACK Logic, my dear Watson. LOGIC
        var w = parent[x] & v ? a : b;
        w && this.write(w, _v, parent);
    });
}

function join(def) {
    return _(function(parent) {
        return this.read(parent, def, parent), null;
    }, function(v, parent) {
        this.write(def, parent, parent);
    });
}

function filter(def, read, write) {
    return _(function(parent) {
        return read.call(this, this.read(def, null, parent), parent);
    }, function(v, parent) {
        this.write(def, write ? write.call(this, v, parent) : v, parent);
    });
}

// Setup the sugary read/write functions.
var funcs = {};
eval((function(LE, same) {
    function forward(f) {
        funcs[f] = _(function() {return this._stream[f]();}, function(v) {this._stream[f](v);});
        return 'funcs.'+f
    }
    var s = '';
    for(var i = 0; i < same.length; i++)
        s += (s?',':'')+same[i]+'='+forward(same[i]);
    for(var i = 0; i < LE.length; i++)
        s += (s?',':'')+LE[i]+'='+forward(LE[i]+'LE')+','+LE[i]+'BE='+forward(LE[i]+'BE');
    return 'var '+s+';';
})('u16,i16,u32,i32,u64,i64,float,double'.split(','), 'cString,u8,i8,GUID,packGUID'.split(',')));

var bool = filter(u8, function(x) {return !!x;}, function(x) {return x ? 1 : 0;});

var flag = and.bind(null, 'flags');

var packets = {
    // Unused in SkyFire, intended for auth verification.
    CMSG_AUTH_SESSION: {
        digest: 7+4+1+8+4+1+1+2, seed: u32, digest2: 4+6,
        build: u16, digest3: 1+1+4+2,
        addonTable: array(u32, u8), account: cString
    },
    CMSG_CHAR_ENUM: {},
    CMSG_PLAYER_LOGIN: GUID,
    CMSG_MESSAGECHAT_SAY: {lang: u32, msg: cString},
    CMSG_MESSAGECHAT_WHISPER: {lang: u32, message: cString, name: cString},
    CMSG_GOSSIP_HELLO: {guid: GUID},
    CMSG_QUESTGIVER_HELLO: {guid: GUID},
    CMSG_QUESTGIVER_ACCEPT_QUEST: {guid: GUID, quest: u32, unk: u32},
    CMSG_QUESTGIVER_QUERY_QUEST: {guid: GUID, quest: u32, unk: u8},
    CMSG_QUESTGIVER_CHOOSE_REWARD: {guid: GUID, quest: u32, reward: u32},
    CMSG_QUESTGIVER_REQUEST_REWARD: {guid: GUID, quest: u32},
    CMSG_QUESTGIVER_CANCEL: {},
    CMSG_QUESTGIVER_COMPLETE_QUEST: {guid: GUID, quest: u32, unk: u8},
    CMSG_QUESTGIVER_STATUS_MULTIPLE_QUERY: {},
    CMSG_QUEST_QUERY: u32,
    CMSG_QUEST_COMFIRM_ACCEPT: {quest: u32},
    CMSG_START_QUEST: {unk: u32, quest: u32},

    MSG_LIST_STABLED_PETS: {guid: GUID, $num: u8, unk: u8, pets: array('$num', {
        slot: u8, number: u32, entry: u32,
        level: u16, name: cString, stable: u8
    })},

    // Unused in SkyFire, intended for auth verification.
    SMSG_AUTH_CHALLENGE: {seed1: 16, unk: u8, seed: u8, seed2: 16},
    SMSG_AUTH_RESPONSE: {
        code: u8,
        billingTimeRemaining: u32, billingPlanFlags: u8, billingTimeRested: u32,
        clientExpansion: u8, serverExpansion: u8
    },
    SMSG_CHAR_ENUM: array(u8, {
        guid: GUID,
        name: cString,
        race: u8, class: u8, gender: u8,
        skin: u8, face: u8, hairStyle: u8, hairColor: u8, facialHair: u8,
        level: u8,
        zone: u32, map: u32,
        x: float, y: float, z: float,
        guild: GUID,
        flags: u32,
        customize: u32,
        firstLogin: u8,
        petDisplayID: u32, petLevel: u32, petFamily: u32,
        equipment: array(19, filter({displayInfoID: u32, inventoryType: u8, enchant: u32}, function(x) {
            return x.displayInfoID ? x : null;
        })),
        //HACK Not filled in SkyFire.
        $bags: array(4, {displayInfoID: u32, inventoryType: u8, enchant: u32})
    }),
    SMSG_INITIALIZE_FACTIONS: array(u32, filter({flags: u8, standing: u32}, function(x) {
        return x.flags ? x : null;
    })),
    SMSG_ACTION_BUTTONS: {type: u8,
        butons: eq('type', 2, null, array(wow.MAX_ACTION_BUTTONS, filter(u32, function(x) {
            return x || null;
        })))
    },
    SMSG_EQUIPMENT_SET_LIST: array(u32, {
        guid: packGUID, idx: u32, name: cString, iconName: cString,
        slots: array(19, packGUID)
    }),
    SMSG_INIT_WORLD_STATES: {map: u32, zone: u32, area: u32, fields: array(filter(u16, function(x) {
        // HACK SkyFire sends num=8 for 5 fields.
        return Math.min(x, Math.floor((this._stream._buffer.length-this._stream._pos)/8));
    }), [u32, u32])},
    SMSG_UPDATE_WORLD_STATE: [u32, u32],
    SMSG_LEARNED_DANCE_MOVES: u64,
    SMSG_PLAY_SOUND: u32,
    SMSG_EMOTE: {anim: u32, guid: GUID},
    SMSG_WEATHER: {state: u32, grade: float, unk: u8},
    SMSG_MOTD: /*lines*/array(u32, cString),
    SMSG_GOSSIP_MESSAGE: {
        guid: GUID, menuID: u32, titleTextID: u32,
        menus: array(u32, {id: u32, icon: u8, isCoded: bool, boxMoney: u32, message: cString, boxMessage: cString}),
        quests: array(u32, {id: u32, icon: u32, level: i32, flags: u32, unk: u8, title: cString})
    },
    SMSG_GOSSIP_COMPLETE: {},
    SMSG_QUESTGIVER_QUEST_DETAILS: {
        guid: GUID, unk1: u64, id: u32,
        title: cString, details: cString, objectives: cString,
        targetText: cString, targetName: cString, unk2: u16, targetDisplayID: u32,
        unk3: u32, autoFinish: bool, flags: u32, suggestedPlayers: u32,
        unk4: u8, questStartType: u8, requiredSpell: u32,
        rewardChoicesCount: u32, rewardChoices: array(wow.QUEST_REWARD_CHOICES_COUNT, {itemID: u32, count: u32, displayID: u32}),
        rewardsCount: u32, rewards: array(wow.QUEST_REWARDS_COUNT, {itemID: u32, count: u32, displayID: u32}),
        rewardMoney: u32, xp: u32, charTitleID: u32, unk5: [u32, u32],
        bonusTalents: u32, unk6: [u32, u32],
        reputations: array(wow.QUEST_REPUTATIONS_COUNT, {faction: u32, valueID: i32, value: i32}),
        rewardSpellCast: i32, unk7: u32,
        currencies: array(wow.QUEST_CURRENCY_COUNT, {id: u32, count: u32}),
        unk8: [u32, u32],
        emotes: array(u32, {emote: u32, delay: u32})
    },
    SMSG_QUESTGIVER_OFFER_REWARD: {
        guid: GUID, id: u32,
        title: cString, offerReward: cString,
        questGiverTextWindow: cString, questGiverName: cString,
        questCompleteTextWindow: cString, questCompleteName: cString,
        questGiverPortrait: u32, questTurnInPortrait: u32,
        autoFinish: bool, flags: u32, suggestedPlayers: u32,
        emotes: array(u32, {delay: u32, emote: u32}),
        rewardChoicesCount: u32, rewardChoices: array(wow.QUEST_REWARD_CHOICES_COUNT, {itemID: u32, count: u32, displayID: u32}),
        rewardsCount: u32, rewards: array(wow.QUEST_REWARDS_COUNT, {itemID: u32, count: u32, displayID: u32}),
        rewardMoney: u32, xp: u32, charTitleID: u32, unk1: [u32, u32],
        bonusTalents: u32, unk2: [u32, u32],
        reputations: array(wow.QUEST_REPUTATIONS_COUNT, {faction: u32, valueID: i32, value: i32}),
        rewardSpellCast: i32, unk3: u32,
        currencies: array(wow.QUEST_CURRENCY_COUNT, {id: u32, count: u32}),
        unk4: [u32, u32]
    },
    SMSG_QUESTGIVER_STATUS: {guid: GUID, status: u32},
    SMSG_QUESTGIVER_STATUS_MULTIPLE: array(u32, {guid: GUID, status: u32}),
    SMSG_TALENTS_INFO: {
        pet: bool,
        unspent: u32,
        talents: eq('pet', true, array(u8, {id: u32, rank: u8})),
        $numSpecs: eq('pet', false, u8),
        active: eq('pet', false, u8),
        specs: eq('pet', false, array('$numSpecs', {
            tree: u32,
            talents: array(u8, {id: u32, rank: u8}),
            glyphs: array(u8, u16)
        }))
    },
    SMSG_POWER_UPDATE: {guid: packGUID, powers: array(u32, {power: u8, val: u32})},
    SMSG_AURA_UPDATE: {target: packGUID,
        slot: u8, id: u32,
        $: eq('id', 0, null, join({
            flags: u8, level: u8, stack: u8,
            //NOTE this looks rather anti-logical, maybe SkyFire is wrong.
            caster: flag(wow.auraFlag.CASTER, null, packGUID),
            maxDuration: flag(wow.auraFlag.DURATION, u32),
            duration: flag(wow.auraFlag.DURATION, u32),
            effectAmounts: flag(wow.auraFlag.ANY_EFFECT_AMOUNT_SENT, _(function(update) {
                var amounts = [];
                for(var i = 0; i < wow.MAX_SPELL_EFFECTS; i++)
                    if(update.flags & (i << i))
                        amounts[i] = this.read(u32);
                return amounts;
            }))
        }))
    },
    SMSG_THREAT_UPDATE: {guid: packGUID, threats: array(u32, {guid: packGUID, threat: filter(u32, function(x) {return x/100;}, function(x) {return Math.floor(x*100);})})},
    SMSG_HIGHEST_THREAT_UPDATE: {guid: packGUID, target: packGUID, threats: array(u32, {guid: packGUID, threat: u32})},
    SMSG_AI_REACTION: {guid: GUID, type: u32},
    SMSG_ATTACKSTART: {guid: GUID, victim: GUID},
    SMSG_SPELL_START: {
        source: packGUID, caster: packGUID, castCount: u8,
        id: u32, flags: u32, timer: i32,
        power: flag(wow.castFlag.POWER_LEFT_SELF, u32),
        runes: flag(wow.castFlag.RUNE_LIST, {
            before: u8, after: u8,
            cooldowns: array(wow.MAX_RUNES, filter(u8, function(x) {return x/255;}, function(x) {return Math.floor(x*255);}))
        }),
        unk_23: flag(wow.castFlag.UNKNOWN_23, [u32, u32])
    },
    SMSG_DESTROY_OBJECT: {guid: GUID, animated: bool}
};

// Movement packets.
var movementPacket = {
    guid: packGUID,
    //TODO FIXME have this only in one place.
    //BEGIN MovementData
    flags: u32, flags2: u16, time: u32,
    x: float, y: float, z: float,
    orientation: float,
    transport: flag(wow.movementFlag.ONTRANSPORT, {
        guid: packGUID,
        offsetX: float, offsetY: float, offsetZ: float,
        time: u32, transportSeat: u8
    }),
    //TODO move this into transport (how? flags2 isn't in transport, it's in movement).
    t_time2: flag(wow.movementFlag.ONTRANSPORT,
        and('flags2', wow.movementFlag2.INTERPOLATED_MOVEMENT, u32)
    ),
    pitch: flag(wow.movementFlag.SWIMMING | wow.movementFlag.FLYING, float,
        and('flags2', wow.movementFlag2.ALWAYS_ALLOW_PITCHING, float)
    ),
    $1: and('flags2', wow.movementFlag2.INTERPOLATED_TURNING, join({
        fallTime: u32, j_zSpeed: float,
        $jump: flag(wow.movementFlag.JUMPING, join({
            j_sinAngle: float, j_cosAngle: float, j_xySpeed: float
        }))
    })),
    splineElevation: flag(wow.movementFlag.SPLINE_ELEVATION, float),
    //END MovementData
};
extend(packets, {
    MSG_MOVE_START_FORWARD: movementPacket,
    MSG_MOVE_START_BACKWARD: movementPacket,
    MSG_MOVE_STOP: movementPacket,
    MSG_MOVE_START_STRAFE_LEFT: movementPacket,
    MSG_MOVE_START_STRAFE_RIGHT: movementPacket,
    MSG_MOVE_STOP_STRAFE: movementPacket,
    MSG_MOVE_JUMP: movementPacket,
    MSG_MOVE_START_TURN_LEFT: movementPacket,
    MSG_MOVE_START_TURN_RIGHT: movementPacket,
    MSG_MOVE_STOP_TURN: movementPacket,
    MSG_MOVE_START_PITCH_UP: movementPacket,
    MSG_MOVE_START_PITCH_DOWN: movementPacket,
    MSG_MOVE_STOP_PITCH: movementPacket,
    MSG_MOVE_SET_RUN_MODE: movementPacket,
    MSG_MOVE_SET_WALK_MODE: movementPacket,
    MSG_MOVE_FALL_LAND: movementPacket,
    MSG_MOVE_START_SWIM: movementPacket,
    MSG_MOVE_STOP_SWIM: movementPacket,
    MSG_MOVE_SET_FACING: movementPacket,
    MSG_MOVE_SET_PITCH: movementPacket,
    MSG_MOVE_HEARTBEAT: movementPacket,
    CMSG_MOVE_FALL_RESET: movementPacket,
    CMSG_MOVE_SET_FLY: movementPacket,
    MSG_MOVE_START_ASCEND: movementPacket,
    MSG_MOVE_STOP_ASCEND: movementPacket,
    CMSG_MOVE_CHNG_TRANSPORT: movementPacket,
    MSG_MOVE_START_DESCEND: movementPacket
});

var updateFields = _(function(update) {
    var bitmapLen = this.read(u8)*4, bitmap = this.read(bitmapLen);
    // Find the last non-zero byte in the bitmap.
    for(var i = bitmapLen-1; i >= 0 && !bitmap[i]; i--);
    if(i < 0)
        return new Buffer(0);
    // Find the last set bit in the bitmap.
    for(var bits = bitmap[i], j = 7; j > 0 && !(bits & (1 << j)); j--);
    // TODO should the size be always as small as possible?
    var size = update.objectType ? wow.objectTypeToField[update.objectType].END : 0;
    // HACK FIXME There's a weird case, when the bitmap is 780 bytes long,
    // which would mean 780*8 entries, too much for any kind of object.
    size = Math.max(size, i*8 + j + 1);
    var changes = [], fields = update.fields = new Buffer(size*4);
    fields.fill(0);
    for(var i2 = 0; i2 <= i; i2++)
        for(var bits = bitmap[i2], base = i2*8*4, j = 0; j < 8; j++)
            if(bits & (1 << j))
                try {
                    fields.writeUInt32LE(this.read(u32), base + j*4), changes.push(i2*8+j);
                } catch(e) {
                    console.log(update);
                    console.log(bitmapLen, size, i, i2, j, base);
                    throw e;
                }
    return changes;
});

packets.SMSG_UPDATE_OBJECT = {
    map: u16,
    updates: array(u32, _(function() {
        var update = this.read({type: u8});
        if(update.type == wow.updateType.OUT_OF_RANGE_OBJECTS)
            this.read(update, {guids: array(u32, packGUID)});
        else if(update.type == wow.updateType.VALUES)
            this.read(update, {guid: packGUID, changes: updateFields});
        else if(update.type == wow.updateType.CREATE_OBJECT || update.type == wow.updateType.CREATE_OBJECT2)
            this.read(update, {guid: packGUID, objectType: u8, flags: u16,
                $: flag(wow.updateFlag.LIVING, join({movement: {
                    //TODO FIXME have this only in one place.
                    //BEGIN MovementData
                    flags: u32, flags2: u16, time: u32,
                    x: float, y: float, z: float,
                    orientation: float,
                    transport: flag(wow.movementFlag.ONTRANSPORT, {
                        guid: packGUID,
                        offsetX: float, offsetY: float, offsetZ: float,
                        time: u32, transportSeat: u8
                    }),
                    //TODO move this into transport (how? flags2 isn't in transport, it's in movement).
                    t_time2: flag(wow.movementFlag.ONTRANSPORT,
                        and('flags2', wow.movementFlag2.INTERPOLATED_MOVEMENT, u32)
                    ),
                    pitch: flag(wow.movementFlag.SWIMMING | wow.movementFlag.FLYING, float,
                        and('flags2', wow.movementFlag2.ALWAYS_ALLOW_PITCHING, float)
                    ),
                    $1: and('flags2', wow.movementFlag2.INTERPOLATED_TURNING, join({
                        fallTime: u32, j_zSpeed: float,
                        $jump: flag(wow.movementFlag.JUMPING, join({
                            j_sinAngle: float, j_cosAngle: float, j_xySpeed: float
                        }))
                    })),
                    splineElevation: flag(wow.movementFlag.SPLINE_ELEVATION, float),
                    //END MovementData
                    walkSpeed: float,
                    runSpeed: float, runBackSpeed: float,
                    swimSpeed: float, swimBackSpeed: float,
                    flightSpeed: float, flightBackSpeed: float,
                    turnRate: float, pitchRate: float,
                    spline: flag(wow.movementFlag.SPLINE_ENABLED, {
                        flags: u32,
                        facingAngle: flag(wow.splineFlag.FinalAngle, float),
                        facingTarget: flag(wow.splineFlag.FinalTarget, GUID),
                        facingPoint: flag(wow.splineFlag.FinalPoint, {x: float, y: float, z: float}),
                        timePassed: i32,
                        duration: i32,
                        id: u32,
                        durationMod: float, durationModNext: float,
                        verticalAcceleration: float,
                        effectStartTime: i32,
                        nodes: array(u32, {x: float, y: float, z: float}),
                        mode: u8,
                        finalDestination: {x: float, y: float, z: float}
                    })
                }}), flag(wow.updateFlag.POSITION, join({position: {
                    unk_guid: packGUID,
                    x: float, y: float, z: float,
                    x2: float, y2: float, z2: float,
                    orientation: float, orientation2: float
                }}), flag(wow.updateFlag.HAS_POSITION, join({position: {
                    x: float, y: float, z: float,
                    orientation: float
                }})))),
                victim: flag(wow.updateFlag.HAS_TARGET, packGUID),
                time: flag(wow.updateFlag.TRANSPORT, u32),
                vehicle: flag(wow.updateFlag.VEHICLE, {id: u32, orientation: float}),
                unk_animkit: flag(wow.updateFlag.ANIMKITS, [u16, u16, u16]),
                rotation: flag(wow.updateFlag.ROTATION, i64),
                unk3: flag(wow.updateFlag.UNK3, array(u8, u32)),
                changes: updateFields,
            });
        else
            throw new Error('UPDATE_OBJECT: unknown type='+update.type);
        return update;
    }))
};

var _packets = [];
for(var i in packets) {
    var op = wow.realmOpCodes[i];
    _packets[op] = packets[i];
}

exports.realmPacketRead = function realmPacketRead(op, reader) {
    if(!_packets[op])
        return null;
    var packet = new Packet(op, reader);
    return packet.read(_packets[op]);
};
exports.realmPacketWrite = function realmPacketWrite(op, data) {
    if(!_packets[op])
        throw new Error('Missing packet definition for 0x'+op.toString(16));
    var packet = new Packet(op, new buffers.BufferWriter());
    packet.write(_packets[op], data);
    packet.data = packet._stream.end();
    return packet;
};
