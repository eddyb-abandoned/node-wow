var wow = require('./index');

exports.objectTypeToField = {};
function copy(x) {
    var r = {};
    for(var i in x)
        r[i] = x[i];
    return r;
}
function makeFields(t, a, b) {
    a = a ? exports[a+'Field'] : {END: 0};
    // FIXME HACK maybe we can just Object.create(null, a.fieldInfo) instead of copying it?
    var f = copy(a.fieldInfo), r = Object.create(null, {fieldInfo: {value: f}});
    for(var i in a)
        if(!(i in b))
            r[i] = a[i];
    for(var i in b) {
        var v = b[i];
        if(Array.isArray(v)) {
            f[v[0] += a.END] = {type: v[1], size: v[2] || {GUID: 2, u64: 2}[v[1]] || 1};
            r[i] = v[0];
        } else
            r[i] = a.END+v;
    }
    exports.objectTypeToField[wow.objectType[t.toUpperCase()]] = r;
    exports[t+'Field'] = r;
}

makeFields('object', null, {
    GUID:                           [0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    TYPE:                           0x0002, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENTRY:                          0x0003, // Size: 1, Type: INT, Flags: PUBLIC
    SCALE_X:                        [0x0004, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    DATA:                           [0x0005, 'u64'], // Size: 2, Type: LONG, Flags: PUBLIC
    PADDING:                        0x0007, // Size: 1, Type: INT, Flags: NONE
    END:                            0x0008,
});
makeFields('item', 'object', {
    OWNER:                          /*objectEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CONTAINED:                      /*objectEND+*/[0x0002, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CREATOR:                        /*objectEND+*/[0x0004, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    GIFTCREATOR:                    /*objectEND+*/[0x0006, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    STACK_COUNT:                    /*objectEND+*/0x0008, // Size: 1, Type: INT, Flags: OWNER, UNUSED1
    DURATION:                       /*objectEND+*/0x0009, // Size: 1, Type: INT, Flags: OWNER, UNUSED1
    SPELL_CHARGES:                  /*objectEND+*/0x000A, // Size: 5, Type: INT, Flags: OWNER, UNUSED1
    FLAGS:                          /*objectEND+*/0x000F, // Size: 1, Type: INT, Flags: PUBLIC
    ENCHANTMENT_1_1:                /*objectEND+*/0x0010, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_1_3:                /*objectEND+*/0x0012, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_2_1:                /*objectEND+*/0x0013, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_2_3:                /*objectEND+*/0x0015, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_3_1:                /*objectEND+*/0x0016, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_3_3:                /*objectEND+*/0x0018, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_4_1:                /*objectEND+*/0x0019, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_4_3:                /*objectEND+*/0x001B, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_5_1:                /*objectEND+*/0x001C, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_5_3:                /*objectEND+*/0x001E, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_6_1:                /*objectEND+*/0x001F, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_6_3:                /*objectEND+*/0x0021, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_7_1:                /*objectEND+*/0x0022, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_7_3:                /*objectEND+*/0x0024, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_8_1:                /*objectEND+*/0x0025, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_8_3:                /*objectEND+*/0x0027, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_9_1:                /*objectEND+*/0x0028, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_9_3:                /*objectEND+*/0x002A, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_10_1:               /*objectEND+*/0x002B, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_10_3:               /*objectEND+*/0x002D, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_11_1:               /*objectEND+*/0x002E, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_11_3:               /*objectEND+*/0x0030, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_12_1:               /*objectEND+*/0x0031, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_12_3:               /*objectEND+*/0x0033, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_13_1:               /*objectEND+*/0x0034, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_13_3:               /*objectEND+*/0x0036, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    ENCHANTMENT_14_1:               /*objectEND+*/0x0037, // Size: 2, Type: INT, Flags: PUBLIC
    ENCHANTMENT_14_3:               /*objectEND+*/0x0039, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    PROPERTY_SEED:                  /*objectEND+*/0x003A, // Size: 1, Type: INT, Flags: PUBLIC
    RANDOM_PROPERTIES_ID:           /*objectEND+*/0x003B, // Size: 1, Type: INT, Flags: PUBLIC
    DURABILITY:                     /*objectEND+*/0x003C, // Size: 1, Type: INT, Flags: OWNER, UNUSED1
    MAXDURABILITY:                  /*objectEND+*/0x003D, // Size: 1, Type: INT, Flags: OWNER, UNUSED1
    CREATE_PLAYED_TIME:             /*objectEND+*/0x003E, // Size: 1, Type: INT, Flags: PUBLIC
    PAD:                            /*objectEND+*/0x003F, // Size: 1, Type: INT, Flags: NONE
    END:                            /*objectEND+*/0x0040,
});
makeFields('container', 'item', {
    NUM_SLOTS:                      /*itemEND+*/0x0000, // Size: 1, Type: INT, Flags: PUBLIC
    ALIGN_PAD:                      /*itemEND+*/0x0001, // Size: 1, Type: BYTES, Flags: NONE
    SLOT_1:                         /*itemEND+*/[0x0002, 'GUID'], // Size: 72, Type: LONG, Flags: PUBLIC
    END:                            /*itemEND+*/0x004A,
});
makeFields('unit', 'object', {
    CHARM:                          /*objectEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    SUMMON:                         /*objectEND+*/[0x0002, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CRITTER:                        /*objectEND+*/[0x0004, 'GUID'], // Size: 2, Type: LONG, Flags: PRIVATE
    CHARMEDBY:                      /*objectEND+*/[0x0006, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    SUMMONEDBY:                     /*objectEND+*/[0x0008, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CREATEDBY:                      /*objectEND+*/[0x000A, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    TARGET:                         /*objectEND+*/[0x000C, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CHANNEL_OBJECT:                 /*objectEND+*/[0x000E, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    CHANNEL_SPELL:                  /*objectEND+*/0x0010, // Size: 1, Type: INT, Flags: PUBLIC
    BYTES_0:                        /*objectEND+*/0x0011, // Size: 1, Type: BYTES, Flags: PUBLIC
    HEALTH:                         /*objectEND+*/0x0012, // Size: 1, Type: INT, Flags: PUBLIC
    POWER1:                         /*objectEND+*/0x0013, // Size: 1, Type: INT, Flags: PUBLIC
    POWER2:                         /*objectEND+*/0x0014, // Size: 1, Type: INT, Flags: PUBLIC
    POWER3:                         /*objectEND+*/0x0015, // Size: 1, Type: INT, Flags: PUBLIC
    POWER4:                         /*objectEND+*/0x0016, // Size: 1, Type: INT, Flags: PUBLIC
    POWER5:                         /*objectEND+*/0x0017, // Size: 1, Type: INT, Flags: PUBLIC
    POWER6:                         /*objectEND+*/0x0018, // Size: 1, Type: INT, Flags: PUBLIC
    POWER7:                         /*objectEND+*/0x0019, // Size: 1, Type: INT, Flags: PUBLIC
    POWER8:                         /*objectEND+*/0x001A, // Size: 1, Type: INT, Flags: PUBLIC
    POWER9:                         /*objectEND+*/0x001B, // Size: 1, Type: INT, Flags: PUBLIC
    POWER10:                        /*objectEND+*/0x001C, // Size: 1, Type: INT, Flags: PUBLIC
    POWER11:                        /*objectEND+*/0x001D, // Size: 1, Type: INT, Flags: PUBLIC
    MAXHEALTH:                      /*objectEND+*/0x001E, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER1:                      /*objectEND+*/0x001F, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER2:                      /*objectEND+*/0x0020, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER3:                      /*objectEND+*/0x0021, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER4:                      /*objectEND+*/0x0022, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER5:                      /*objectEND+*/0x0023, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER6:                      /*objectEND+*/0x0024, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER7:                      /*objectEND+*/0x0025, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER8:                      /*objectEND+*/0x0026, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER9:                      /*objectEND+*/0x0027, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER10:                     /*objectEND+*/0x0028, // Size: 1, Type: INT, Flags: PUBLIC
    MAXPOWER11:                     /*objectEND+*/0x0029, // Size: 1, Type: INT, Flags: PUBLIC
    POWER_REGEN_FLAT_MODIFIER:      /*objectEND+*/[0x002A, 'float'], // Size: 11, Type: FLOAT, Flags: PRIVATE, OWNER
    POWER_REGEN_INTERRUPTED_FLAT_MODIFIER: /*objectEND+*/[0x0035, 'float'], // Size: 11, Type: FLOAT, Flags: PRIVATE, OWNER
    LEVEL:                          /*objectEND+*/0x0040, // Size: 1, Type: INT, Flags: PUBLIC
    FACTIONTEMPLATE:                /*objectEND+*/0x0041, // Size: 1, Type: INT, Flags: PUBLIC
    VIRTUAL_ITEM_SLOT_ID:           /*objectEND+*/0x0042, // Size: 3, Type: INT, Flags: PUBLIC
    FLAGS:                          /*objectEND+*/0x0045, // Size: 1, Type: INT, Flags: PUBLIC
    FLAGS_2:                        /*objectEND+*/0x0046, // Size: 1, Type: INT, Flags: PUBLIC
    AURASTATE:                      /*objectEND+*/0x0047, // Size: 1, Type: INT, Flags: PUBLIC
    BASEATTACKTIME:                 /*objectEND+*/0x0048, // Size: 2, Type: INT, Flags: PUBLIC
    RANGEDATTACKTIME:               /*objectEND+*/0x004A, // Size: 1, Type: INT, Flags: PRIVATE
    BOUNDINGRADIUS:                 /*objectEND+*/[0x004B, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    COMBATREACH:                    /*objectEND+*/[0x004C, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    DISPLAYID:                      /*objectEND+*/0x004D, // Size: 1, Type: INT, Flags: PUBLIC
    NATIVEDISPLAYID:                /*objectEND+*/0x004E, // Size: 1, Type: INT, Flags: PUBLIC
    MOUNTDISPLAYID:                 /*objectEND+*/0x004F, // Size: 1, Type: INT, Flags: PUBLIC
    MINDAMAGE:                      /*objectEND+*/[0x0050, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER, ITEM_OWNER
    MAXDAMAGE:                      /*objectEND+*/[0x0051, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER, ITEM_OWNER
    MINOFFHANDDAMAGE:               /*objectEND+*/[0x0052, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER, ITEM_OWNER
    MAXOFFHANDDAMAGE:               /*objectEND+*/[0x0053, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER, ITEM_OWNER
    BYTES_1:                        /*objectEND+*/0x0054, // Size: 1, Type: BYTES, Flags: PUBLIC
    PETNUMBER:                      /*objectEND+*/0x0055, // Size: 1, Type: INT, Flags: PUBLIC
    PET_NAME_TIMESTAMP:             /*objectEND+*/0x0056, // Size: 1, Type: INT, Flags: PUBLIC
    PETEXPERIENCE:                  /*objectEND+*/0x0057, // Size: 1, Type: INT, Flags: OWNER
    PETNEXTLEVELEXP:                /*objectEND+*/0x0058, // Size: 1, Type: INT, Flags: OWNER
    DYNAMIC_FLAGS:                  /*objectEND+*/0x0059, // Size: 1, Type: INT, Flags: UNUSED2
    MOD_CAST_SPEED:                 /*objectEND+*/[0x005A, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    CREATED_BY_SPELL:               /*objectEND+*/0x005B, // Size: 1, Type: INT, Flags: PUBLIC
    NPC_FLAGS:                      /*objectEND+*/0x005C, // Size: 1, Type: INT, Flags: UNUSED2
    NPC_EMOTESTATE:                 /*objectEND+*/0x005D, // Size: 1, Type: INT, Flags: PUBLIC
    STAT0:                          /*objectEND+*/0x005E, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    STAT1:                          /*objectEND+*/0x005F, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    STAT2:                          /*objectEND+*/0x0060, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    STAT3:                          /*objectEND+*/0x0061, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    STAT4:                          /*objectEND+*/0x0062, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    POSSTAT0:                       /*objectEND+*/0x0063, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    POSSTAT1:                       /*objectEND+*/0x0064, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    POSSTAT2:                       /*objectEND+*/0x0065, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    POSSTAT3:                       /*objectEND+*/0x0066, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    POSSTAT4:                       /*objectEND+*/0x0067, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    NEGSTAT0:                       /*objectEND+*/0x0068, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    NEGSTAT1:                       /*objectEND+*/0x0069, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    NEGSTAT2:                       /*objectEND+*/0x006A, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    NEGSTAT3:                       /*objectEND+*/0x006B, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    NEGSTAT4:                       /*objectEND+*/0x006C, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    RESISTANCES:                    /*objectEND+*/0x006D, // Size: 7, Type: INT, Flags: PRIVATE, OWNER, ITEM_OWNER
    RESISTANCEBUFFMODSPOSITIVE:     /*objectEND+*/0x0074, // Size: 7, Type: INT, Flags: PRIVATE, OWNER
    RESISTANCEBUFFMODSNEGATIVE:     /*objectEND+*/0x007B, // Size: 7, Type: INT, Flags: PRIVATE, OWNER
    BASE_MANA:                      /*objectEND+*/0x0082, // Size: 1, Type: INT, Flags: PUBLIC
    BASE_HEALTH:                    /*objectEND+*/0x0083, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    BYTES_2:                        /*objectEND+*/0x0084, // Size: 1, Type: BYTES, Flags: PUBLIC
    ATTACK_POWER:                   /*objectEND+*/0x0085, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    ATTACK_POWER_MOD_POS:           /*objectEND+*/0x0086, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    ATTACK_POWER_MOD_NEG:           /*objectEND+*/0x0087, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    ATTACK_POWER_MULTIPLIER:        /*objectEND+*/[0x0088, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER
    RANGED_ATTACK_POWER:            /*objectEND+*/0x0089, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    RANGED_ATTACK_POWER_MOD_POS:    /*objectEND+*/0x008A, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    RANGED_ATTACK_POWER_MOD_NEG:    /*objectEND+*/0x008B, // Size: 1, Type: INT, Flags: PRIVATE, OWNER
    RANGED_ATTACK_POWER_MULTIPLIER: /*objectEND+*/[0x008C, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER
    MINRANGEDDAMAGE:                /*objectEND+*/[0x008D, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER
    MAXRANGEDDAMAGE:                /*objectEND+*/[0x008E, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER
    POWER_COST_MODIFIER:            /*objectEND+*/0x008F, // Size: 7, Type: INT, Flags: PRIVATE, OWNER
    POWER_COST_MULTIPLIER:          /*objectEND+*/[0x0096, 'float'], // Size: 7, Type: FLOAT, Flags: PRIVATE, OWNER
    MAXHEALTHMODIFIER:              /*objectEND+*/[0x009D, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE, OWNER
    HOVERHEIGHT:                    /*objectEND+*/[0x009E, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    MAXITEMLEVEL:                   /*objectEND+*/0x009F, // Size: 1, Type: INT, Flags: PUBLIC
    END:                            /*objectEND+*/0x00A0,
});
makeFields('player', 'unit', {
    DUEL_ARBITER:                   /*unitEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    FLAGS:                          /*unitEND+*/0x0002, // Size: 1, Type: INT, Flags: PUBLIC
    GUILDRANK:                      /*unitEND+*/0x0003, // Size: 1, Type: INT, Flags: PUBLIC
    GUILDDELETE_DATE:               /*unitEND+*/0x0004, // Size: 1, Type: INT, Flags: PUBLIC
    GUILDLEVEL:                     /*unitEND+*/0x0005, // Size: 1, Type: INT, Flags: PUBLIC
    _PLAYER_BYTES:                  /*unitEND+*/0x0006, // Size: 1, Type: BYTES, Flags: PUBLIC
    _PLAYER_BYTES_2:                /*unitEND+*/0x0007, // Size: 1, Type: BYTES, Flags: PUBLIC
    _PLAYER_BYTES_3:                /*unitEND+*/0x0008, // Size: 1, Type: BYTES, Flags: PUBLIC
    DUEL_TEAM:                      /*unitEND+*/0x0009, // Size: 1, Type: INT, Flags: PUBLIC
    GUILD_TIMESTAMP:                /*unitEND+*/0x000A, // Size: 1, Type: INT, Flags: PUBLIC
    QUEST_LOG_1_1:                  /*unitEND+*/0x000B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_1_2:                  /*unitEND+*/0x000C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_1_3:                  /*unitEND+*/0x000D, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_1_4:                  /*unitEND+*/0x000F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_2_1:                  /*unitEND+*/0x0010, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_2_2:                  /*unitEND+*/0x0011, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_2_3:                  /*unitEND+*/0x0012, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_2_5:                  /*unitEND+*/0x0014, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_3_1:                  /*unitEND+*/0x0015, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_3_2:                  /*unitEND+*/0x0016, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_3_3:                  /*unitEND+*/0x0017, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_3_5:                  /*unitEND+*/0x0019, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_4_1:                  /*unitEND+*/0x001A, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_4_2:                  /*unitEND+*/0x001B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_4_3:                  /*unitEND+*/0x001C, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_4_5:                  /*unitEND+*/0x001E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_5_1:                  /*unitEND+*/0x001F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_5_2:                  /*unitEND+*/0x0020, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_5_3:                  /*unitEND+*/0x0021, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_5_5:                  /*unitEND+*/0x0023, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_6_1:                  /*unitEND+*/0x0024, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_6_2:                  /*unitEND+*/0x0025, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_6_3:                  /*unitEND+*/0x0026, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_6_5:                  /*unitEND+*/0x0028, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_7_1:                  /*unitEND+*/0x0029, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_7_2:                  /*unitEND+*/0x002A, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_7_3:                  /*unitEND+*/0x002B, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_7_5:                  /*unitEND+*/0x002D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_8_1:                  /*unitEND+*/0x002E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_8_2:                  /*unitEND+*/0x002F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_8_3:                  /*unitEND+*/0x0030, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_8_5:                  /*unitEND+*/0x0032, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_9_1:                  /*unitEND+*/0x0033, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_9_2:                  /*unitEND+*/0x0034, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_9_3:                  /*unitEND+*/0x0035, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_9_5:                  /*unitEND+*/0x0037, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_10_1:                 /*unitEND+*/0x0038, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_10_2:                 /*unitEND+*/0x0039, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_10_3:                 /*unitEND+*/0x003A, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_10_5:                 /*unitEND+*/0x003C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_11_1:                 /*unitEND+*/0x003D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_11_2:                 /*unitEND+*/0x003E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_11_3:                 /*unitEND+*/0x003F, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_11_5:                 /*unitEND+*/0x0041, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_12_1:                 /*unitEND+*/0x0042, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_12_2:                 /*unitEND+*/0x0043, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_12_3:                 /*unitEND+*/0x0044, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_12_5:                 /*unitEND+*/0x0046, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_13_1:                 /*unitEND+*/0x0047, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_13_2:                 /*unitEND+*/0x0048, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_13_3:                 /*unitEND+*/0x0049, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_13_5:                 /*unitEND+*/0x004B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_14_1:                 /*unitEND+*/0x004C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_14_2:                 /*unitEND+*/0x004D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_14_3:                 /*unitEND+*/0x004E, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_14_5:                 /*unitEND+*/0x0050, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_15_1:                 /*unitEND+*/0x0051, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_15_2:                 /*unitEND+*/0x0052, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_15_3:                 /*unitEND+*/0x0053, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_15_5:                 /*unitEND+*/0x0055, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_16_1:                 /*unitEND+*/0x0056, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_16_2:                 /*unitEND+*/0x0057, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_16_3:                 /*unitEND+*/0x0058, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_16_5:                 /*unitEND+*/0x005A, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_17_1:                 /*unitEND+*/0x005B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_17_2:                 /*unitEND+*/0x005C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_17_3:                 /*unitEND+*/0x005D, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_17_5:                 /*unitEND+*/0x005F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_18_1:                 /*unitEND+*/0x0060, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_18_2:                 /*unitEND+*/0x0061, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_18_3:                 /*unitEND+*/0x0062, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_18_5:                 /*unitEND+*/0x0064, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_19_1:                 /*unitEND+*/0x0065, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_19_2:                 /*unitEND+*/0x0066, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_19_3:                 /*unitEND+*/0x0067, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_19_5:                 /*unitEND+*/0x0069, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_20_1:                 /*unitEND+*/0x006A, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_20_2:                 /*unitEND+*/0x006B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_20_3:                 /*unitEND+*/0x006C, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_20_5:                 /*unitEND+*/0x006E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_21_1:                 /*unitEND+*/0x006F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_21_2:                 /*unitEND+*/0x0070, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_21_3:                 /*unitEND+*/0x0071, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_21_5:                 /*unitEND+*/0x0073, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_22_1:                 /*unitEND+*/0x0074, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_22_2:                 /*unitEND+*/0x0075, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_22_3:                 /*unitEND+*/0x0076, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_22_5:                 /*unitEND+*/0x0078, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_23_1:                 /*unitEND+*/0x0079, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_23_2:                 /*unitEND+*/0x007A, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_23_3:                 /*unitEND+*/0x007B, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_23_5:                 /*unitEND+*/0x007D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_24_1:                 /*unitEND+*/0x007E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_24_2:                 /*unitEND+*/0x007F, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_24_3:                 /*unitEND+*/0x0080, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_24_5:                 /*unitEND+*/0x0082, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_25_1:                 /*unitEND+*/0x0083, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_25_2:                 /*unitEND+*/0x0084, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_25_3:                 /*unitEND+*/0x0085, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_25_5:                 /*unitEND+*/0x0087, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_26_1:                 /*unitEND+*/0x0088, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_26_2:                 /*unitEND+*/0x0089, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_26_3:                 /*unitEND+*/0x008A, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_26_5:                 /*unitEND+*/0x008C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_27_1:                 /*unitEND+*/0x008D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_27_2:                 /*unitEND+*/0x008E, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_27_3:                 /*unitEND+*/0x008F, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_27_5:                 /*unitEND+*/0x0091, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_28_1:                 /*unitEND+*/0x0092, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_28_2:                 /*unitEND+*/0x0093, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_28_3:                 /*unitEND+*/0x0094, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_28_5:                 /*unitEND+*/0x0096, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_29_1:                 /*unitEND+*/0x0097, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_29_2:                 /*unitEND+*/0x0098, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_29_3:                 /*unitEND+*/0x0099, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_29_5:                 /*unitEND+*/0x009B, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_30_1:                 /*unitEND+*/0x009C, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_30_2:                 /*unitEND+*/0x009D, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_30_3:                 /*unitEND+*/0x009E, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_30_5:                 /*unitEND+*/0x00A0, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_31_1:                 /*unitEND+*/0x00A1, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_31_2:                 /*unitEND+*/0x00A2, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_31_3:                 /*unitEND+*/0x00A3, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_31_5:                 /*unitEND+*/0x00A5, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_32_1:                 /*unitEND+*/0x00A6, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_32_2:                 /*unitEND+*/0x00A7, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_32_3:                 /*unitEND+*/0x00A8, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_32_5:                 /*unitEND+*/0x00AA, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_33_1:                 /*unitEND+*/0x00AB, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_33_2:                 /*unitEND+*/0x00AC, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_33_3:                 /*unitEND+*/0x00AD, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_33_5:                 /*unitEND+*/0x00AF, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_34_1:                 /*unitEND+*/0x00B0, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_34_2:                 /*unitEND+*/0x00B1, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_34_3:                 /*unitEND+*/0x00B2, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_34_5:                 /*unitEND+*/0x00B4, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_35_1:                 /*unitEND+*/0x00B5, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_35_2:                 /*unitEND+*/0x00B6, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_35_3:                 /*unitEND+*/0x00B7, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_35_5:                 /*unitEND+*/0x00B9, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_36_1:                 /*unitEND+*/0x00BA, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_36_2:                 /*unitEND+*/0x00BB, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_36_3:                 /*unitEND+*/0x00BC, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_36_5:                 /*unitEND+*/0x00BE, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_37_1:                 /*unitEND+*/0x00BF, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_37_2:                 /*unitEND+*/0x00C0, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_37_3:                 /*unitEND+*/0x00C1, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_37_5:                 /*unitEND+*/0x00C3, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_38_1:                 /*unitEND+*/0x00C4, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_38_2:                 /*unitEND+*/0x00C5, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_38_3:                 /*unitEND+*/0x00C6, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_38_5:                 /*unitEND+*/0x00C8, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_39_1:                 /*unitEND+*/0x00C9, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_39_2:                 /*unitEND+*/0x00CA, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_39_3:                 /*unitEND+*/0x00CB, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_39_5:                 /*unitEND+*/0x00CD, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_40_1:                 /*unitEND+*/0x00CE, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_40_2:                 /*unitEND+*/0x00CF, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_40_3:                 /*unitEND+*/0x00D0, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_40_5:                 /*unitEND+*/0x00D2, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_41_1:                 /*unitEND+*/0x00D3, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_41_2:                 /*unitEND+*/0x00D4, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_41_3:                 /*unitEND+*/0x00D5, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_41_5:                 /*unitEND+*/0x00D7, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_42_1:                 /*unitEND+*/0x00D8, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_42_2:                 /*unitEND+*/0x00D9, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_42_3:                 /*unitEND+*/0x00DA, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_42_5:                 /*unitEND+*/0x00DC, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_43_1:                 /*unitEND+*/0x00DD, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_43_2:                 /*unitEND+*/0x00DE, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_43_3:                 /*unitEND+*/0x00DF, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_43_5:                 /*unitEND+*/0x00E1, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_44_1:                 /*unitEND+*/0x00E2, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_44_2:                 /*unitEND+*/0x00E3, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_44_3:                 /*unitEND+*/0x00E4, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_44_5:                 /*unitEND+*/0x00E6, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_45_1:                 /*unitEND+*/0x00E7, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_45_2:                 /*unitEND+*/0x00E8, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_45_3:                 /*unitEND+*/0x00E9, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_45_5:                 /*unitEND+*/0x00EB, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_46_1:                 /*unitEND+*/0x00EC, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_46_2:                 /*unitEND+*/0x00ED, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_46_3:                 /*unitEND+*/0x00EE, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_46_5:                 /*unitEND+*/0x00F0, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_47_1:                 /*unitEND+*/0x00F1, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_47_2:                 /*unitEND+*/0x00F2, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_47_3:                 /*unitEND+*/0x00F3, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_47_5:                 /*unitEND+*/0x00F5, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_48_1:                 /*unitEND+*/0x00F6, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_48_2:                 /*unitEND+*/0x00F7, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_48_3:                 /*unitEND+*/0x00F8, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_48_5:                 /*unitEND+*/0x00FA, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_49_1:                 /*unitEND+*/0x00FB, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_49_2:                 /*unitEND+*/0x00FC, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_49_3:                 /*unitEND+*/0x00FD, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_49_5:                 /*unitEND+*/0x00FF, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_50_1:                 /*unitEND+*/0x0100, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_50_2:                 /*unitEND+*/0x0101, // Size: 1, Type: INT, Flags: PARTY_LEADER
    QUEST_LOG_50_3:                 /*unitEND+*/0x0102, // Size: 2, Type: TWO_SHORT, Flags: PARTY_LEADER
    QUEST_LOG_50_5:                 /*unitEND+*/0x0104, // Size: 1, Type: INT, Flags: PARTY_LEADER
    VISIBLE_ITEM_1_ENTRYID:         /*unitEND+*/0x0105, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_1_ENCHANTMENT:     /*unitEND+*/0x0106, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_2_ENTRYID:         /*unitEND+*/0x0107, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_2_ENCHANTMENT:     /*unitEND+*/0x0108, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_3_ENTRYID:         /*unitEND+*/0x0109, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_3_ENCHANTMENT:     /*unitEND+*/0x010A, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_4_ENTRYID:         /*unitEND+*/0x010B, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_4_ENCHANTMENT:     /*unitEND+*/0x010C, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_5_ENTRYID:         /*unitEND+*/0x010D, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_5_ENCHANTMENT:     /*unitEND+*/0x010E, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_6_ENTRYID:         /*unitEND+*/0x010F, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_6_ENCHANTMENT:     /*unitEND+*/0x0110, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_7_ENTRYID:         /*unitEND+*/0x0111, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_7_ENCHANTMENT:     /*unitEND+*/0x0112, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_8_ENTRYID:         /*unitEND+*/0x0113, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_8_ENCHANTMENT:     /*unitEND+*/0x0114, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_9_ENTRYID:         /*unitEND+*/0x0115, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_9_ENCHANTMENT:     /*unitEND+*/0x0116, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_10_ENTRYID:        /*unitEND+*/0x0117, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_10_ENCHANTMENT:    /*unitEND+*/0x0118, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_11_ENTRYID:        /*unitEND+*/0x0119, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_11_ENCHANTMENT:    /*unitEND+*/0x011A, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_12_ENTRYID:        /*unitEND+*/0x011B, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_12_ENCHANTMENT:    /*unitEND+*/0x011C, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_13_ENTRYID:        /*unitEND+*/0x011D, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_13_ENCHANTMENT:    /*unitEND+*/0x011E, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_14_ENTRYID:        /*unitEND+*/0x011F, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_14_ENCHANTMENT:    /*unitEND+*/0x0120, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_15_ENTRYID:        /*unitEND+*/0x0121, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_15_ENCHANTMENT:    /*unitEND+*/0x0122, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_16_ENTRYID:        /*unitEND+*/0x0123, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_16_ENCHANTMENT:    /*unitEND+*/0x0124, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_17_ENTRYID:        /*unitEND+*/0x0125, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_17_ENCHANTMENT:    /*unitEND+*/0x0126, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_18_ENTRYID:        /*unitEND+*/0x0127, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_18_ENCHANTMENT:    /*unitEND+*/0x0128, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    VISIBLE_ITEM_19_ENTRYID:        /*unitEND+*/0x0129, // Size: 1, Type: INT, Flags: PUBLIC
    VISIBLE_ITEM_19_ENCHANTMENT:    /*unitEND+*/0x012A, // Size: 1, Type: TWO_SHORT, Flags: PUBLIC
    CHOSEN_TITLE:                   /*unitEND+*/0x012B, // Size: 1, Type: INT, Flags: PUBLIC
    FAKE_INEBRIATION:               /*unitEND+*/0x012C, // Size: 1, Type: INT, Flags: PUBLIC
    PAD_0:                          /*unitEND+*/0x012D, // Size: 1, Type: INT, Flags: NONE

    INV_SLOT_HEAD:                  /*unitEND+*/[0x012E, 'GUID'], // Size: 46, Type: LONG, Flags: PRIVATE
    PACK_SLOT_1:                    /*unitEND+*/[0x015C, 'GUID'], // Size: 32, Type: LONG, Flags: PRIVATE
    BANK_SLOT_1:                    /*unitEND+*/[0x017C, 'GUID'], // Size: 56, Type: LONG, Flags: PRIVATE
    BANKBAG_SLOT_1:                 /*unitEND+*/[0x01B4, 'GUID'], // Size: 14, Type: LONG, Flags: PRIVATE
    VENDORBUYBACK_SLOT_1:           /*unitEND+*/[0x01C2, 'GUID'], // Size: 24, Type: LONG, Flags: PRIVATE
    KEYRING_SLOT_1:                 /*unitEND+*/[0x01DA, 'GUID'], // Size: 64, Type: LONG, Flags: PRIVATE
    //FIXME are these GUIDs or just u64's?
    FARSIGHT:                       /*unitEND+*/[0x021A, 'u64'], // Size: 2, Type: LONG, Flags: PRIVATE
    KNOWN_TITLES:                   /*unitEND+*/[0x021C, 'u64'], // Size: 2, Type: LONG, Flags: PRIVATE
    KNOWN_TITLES1:                  /*unitEND+*/[0x021E, 'u64'], // Size: 2, Type: LONG, Flags: PRIVATE
    KNOWN_TITLES2:                  /*unitEND+*/[0x0220, 'u64'], // Size: 2, Type: LONG, Flags: PRIVATE
    XP:                             /*unitEND+*/0x0222, // Size: 1, Type: INT, Flags: PRIVATE
    NEXT_LEVEL_XP:                  /*unitEND+*/0x0223, // Size: 1, Type: INT, Flags: PRIVATE
    SKILL_INFO_1_1:                 /*unitEND+*/0x0224, // Size: 384, Type: TWO_SHORT, Flags: PRIVATE
    CHARACTER_POINTS:               /*unitEND+*/0x03A4, // Size: 1, Type: INT, Flags: PRIVATE
    TRACK_CREATURES:                /*unitEND+*/0x03A5, // Size: 1, Type: INT, Flags: PRIVATE
    TRACK_RESOURCES:                /*unitEND+*/0x03A6, // Size: 1, Type: INT, Flags: PRIVATE
    BLOCK_PERCENTAGE:               /*unitEND+*/[0x03A7, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    DODGE_PERCENTAGE:               /*unitEND+*/[0x03A8, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    PARRY_PERCENTAGE:               /*unitEND+*/[0x03A9, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    EXPERTISE:                      /*unitEND+*/0x03AA, // Size: 1, Type: INT, Flags: PRIVATE
    OFFHAND_EXPERTISE:              /*unitEND+*/0x03AB, // Size: 1, Type: INT, Flags: PRIVATE
    CRIT_PERCENTAGE:                /*unitEND+*/[0x03AC, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    RANGED_CRIT_PERCENTAGE:         /*unitEND+*/[0x03AD, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    OFFHAND_CRIT_PERCENTAGE:        /*unitEND+*/[0x03AE, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    SPELL_CRIT_PERCENTAGE1:         /*unitEND+*/[0x03AF, 'float'], // Size: 7, Type: FLOAT, Flags: PRIVATE
    SHIELD_BLOCK:                   /*unitEND+*/0x03B6, // Size: 1, Type: INT, Flags: PRIVATE
    SHIELD_BLOCK_CRIT_PERCENTAGE:   /*unitEND+*/[0x03B7, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MASTERY:                        /*unitEND+*/[0x03B8, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    EXPLORED_ZONES_1:               /*unitEND+*/0x03B9, // Size: 144, Type: BYTES, Flags: PRIVATE
    REST_STATE_EXPERIENCE:          /*unitEND+*/0x0449, // Size: 1, Type: INT, Flags: PRIVATE
    COINAGE:                        /*unitEND+*/[0x044A, 'u64'], // Size: 2, Type: LONG, Flags: PRIVATE
    MOD_DAMAGE_DONE_POS:            /*unitEND+*/0x044C, // Size: 7, Type: INT, Flags: PRIVATE
    MOD_DAMAGE_DONE_NEG:            /*unitEND+*/0x0453, // Size: 7, Type: INT, Flags: PRIVATE
    MOD_DAMAGE_DONE_PCT:            /*unitEND+*/0x045A, // Size: 7, Type: INT, Flags: PRIVATE
    MOD_HEALING_DONE_POS:           /*unitEND+*/0x0461, // Size: 1, Type: INT, Flags: PRIVATE
    MOD_HEALING_PCT:                /*unitEND+*/[0x0462, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_HEALING_DONE_PCT:           /*unitEND+*/[0x0463, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_SPELL_POWER_PCT:            /*unitEND+*/[0x0464, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_TARGET_RESISTANCE:          /*unitEND+*/0x0465, // Size: 1, Type: INT, Flags: PRIVATE
    MOD_TARGET_PHYSICAL_RESISTANCE: /*unitEND+*/0x0466, // Size: 1, Type: INT, Flags: PRIVATE
    _PLAYER_FIELD_BYTES:            /*unitEND+*/0x0467, // Size: 1, Type: BYTES, Flags: PRIVATE
    SELF_RES_SPELL:                 /*unitEND+*/0x0468, // Size: 1, Type: INT, Flags: PRIVATE
    PVP_MEDALS:                     /*unitEND+*/0x0469, // Size: 1, Type: INT, Flags: PRIVATE
    BUYBACK_PRICE_1:                /*unitEND+*/0x046A, // Size: 12, Type: INT, Flags: PRIVATE
    BUYBACK_TIMESTAMP_1:            /*unitEND+*/0x0476, // Size: 12, Type: INT, Flags: PRIVATE
    KILLS:                          /*unitEND+*/0x0482, // Size: 1, Type: TWO_SHORT, Flags: PRIVATE
    LIFETIME_HONORABLE_KILLS:       /*unitEND+*/0x0483, // Size: 1, Type: INT, Flags: PRIVATE
    _PLAYER_FIELD_BYTES2:           /*unitEND+*/0x0484, // Size: 1, Type: 6, Flags: PRIVATE
    WATCHED_FACTION_INDEX:          /*unitEND+*/0x0485, // Size: 1, Type: INT, Flags: PRIVATE
    COMBAT_RATING_1:                /*unitEND+*/0x0486, // Size: 26, Type: INT, Flags: PRIVATE
    ARENA_TEAM_INFO_1_1:            /*unitEND+*/0x04A0, // Size: 21, Type: INT, Flags: PRIVATE
    BATTLEGROUND_RATING:            /*unitEND+*/0x04B5, // Size: 1, Type: INT, Flags: PRIVATE
    MAX_LEVEL:                      /*unitEND+*/0x04B6, // Size: 1, Type: INT, Flags: PRIVATE
    DAILY_QUESTS_1:                 /*unitEND+*/0x04B7, // Size: 25, Type: INT, Flags: PRIVATE
    RUNE_REGEN_1:                   /*unitEND+*/[0x04D0, 'float'], // Size: 4, Type: FLOAT, Flags: PRIVATE
    NO_REAGENT_COST_1:              /*unitEND+*/0x04D4, // Size: 3, Type: INT, Flags: PRIVATE
    GLYPH_SLOTS_1:                  /*unitEND+*/0x04D7, // Size: 9, Type: INT, Flags: PRIVATE
    GLYPHS_1:                       /*unitEND+*/0x04E0, // Size: 9, Type: INT, Flags: PRIVATE
    GLYPHS_ENABLED:                 /*unitEND+*/0x04E9, // Size: 1, Type: INT, Flags: PRIVATE
    PET_SPELL_POWER:                /*unitEND+*/0x04EA, // Size: 1, Type: INT, Flags: PRIVATE
    RESEARCHING_1:                  /*unitEND+*/0x04EB, // Size: 8, Type: TWO_SHORT, Flags: PRIVATE
    RESERACH_SITE_1:                /*unitEND+*/0x04F3, // Size: 8, Type: TWO_SHORT, Flags: PRIVATE
    PROFESSION_SKILL_LINE_1:        /*unitEND+*/0x04FB, // Size: 2, Type: INT, Flags: PRIVATE
    UI_HIT_MODIFIER:                /*unitEND+*/[0x04FD, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    UI_SPELL_HIT_MODIFIER:          /*unitEND+*/[0x04FE, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    HOME_REALM_TIME_OFFSET:         /*unitEND+*/0x04FF, // Size: 1, Type: INT, Flags: PRIVATE
    MOD_HASTE:                      /*unitEND+*/[0x0500, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_RANGED_HASTE:               /*unitEND+*/[0x0501, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_PET_HASTE:                  /*unitEND+*/[0x0502, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    MOD_HASTE_REGEN:                /*unitEND+*/[0x0503, 'float'], // Size: 1, Type: FLOAT, Flags: PRIVATE
    END:                            /*unitEND+*/0x0504,
});
makeFields('gameObject', 'object', {
    CREATED_BY:                     /*objectEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    DISPLAYID:                      /*objectEND+*/0x0002, // Size: 1, Type: INT, Flags: PUBLIC
    FLAGS:                          /*objectEND+*/0x0003, // Size: 1, Type: INT, Flags: PUBLIC
    PARENTROTATION:                 /*objectEND+*/[0x0004, 'float'], // Size: 4, Type: FLOAT, Flags: PUBLIC
    DYNAMIC:                        /*objectEND+*/0x0008, // Size: 1, Type: TWO_SHORT, Flags: UNUSED2
    FACTION:                        /*objectEND+*/0x0009, // Size: 1, Type: INT, Flags: PUBLIC
    LEVEL:                          /*objectEND+*/0x000A, // Size: 1, Type: INT, Flags: PUBLIC
    BYTES_1:                        /*objectEND+*/0x000B, // Size: 1, Type: BYTES, Flags: PUBLIC
    END:                            /*objectEND+*/0x000C,
});
makeFields('dynamicObject', 'object', {
    CASTER:                         /*objectEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    BYTES:                          /*objectEND+*/0x0002, // Size: 1, Type: BYTES, Flags: PUBLIC
    SPELLID:                        /*objectEND+*/0x0003, // Size: 1, Type: INT, Flags: PUBLIC
    RADIUS:                         /*objectEND+*/[0x0004, 'float'], // Size: 1, Type: FLOAT, Flags: PUBLIC
    CASTTIME:                       /*objectEND+*/0x0005, // Size: 1, Type: INT, Flags: PUBLIC
    END:                            /*objectEND+*/0x0006,
});
makeFields('corpse', 'object', {
    OWNER:                          /*objectEND+*/[0x0000, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    PARTY:                          /*objectEND+*/[0x0002, 'GUID'], // Size: 2, Type: LONG, Flags: PUBLIC
    DISPLAY_ID:                     /*objectEND+*/0x0004, // Size: 1, Type: INT, Flags: PUBLIC
    ITEM:                           /*objectEND+*/0x0005, // Size: 19, Type: INT, Flags: PUBLIC
    BYTES_1:                        /*objectEND+*/0x0018, // Size: 1, Type: BYTES, Flags: PUBLIC
    BYTES_2:                        /*objectEND+*/0x0019, // Size: 1, Type: BYTES, Flags: PUBLIC
    FLAGS:                          /*objectEND+*/0x001A, // Size: 1, Type: INT, Flags: PUBLIC
    DYNAMIC_FLAGS:                  /*objectEND+*/0x001B, // Size: 1, Type: INT, Flags: UNUSED2
    END:                            /*objectEND+*/0x001C,
});