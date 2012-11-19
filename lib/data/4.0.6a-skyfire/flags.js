exports.GUIDType = {
    ITEM:           0x4000,                       // blizz 4000
    CONTAINER:      0x4000,                       // blizz 4000
    PLAYER:         0x0000,                       // blizz 0000
    GAMEOBJECT:     0xF110,                       // blizz F110
    TRANSPORT:      0xF120,                       // blizz F120 (for GAMEOBJECT_TYPE_TRANSPORT)
    UNIT:           0xF130,                       // blizz F130
    PET:            0xF140,                       // blizz F140
    VEHICLE:        0xF150,                       // blizz F550
    DYNAMICOBJECT:  0xF100,                       // blizz F100
    CORPSE:         0xF101,                       // blizz F100
    MO_TRANSPORT:   0x1FC0,                       // blizz 1FC0 (for GAMEOBJECT_TYPE_MO_TRANSPORT)
    GROUP:          0x1F50,
    GUILD:          0x1FF6
};
exports.objectType = {
    OBJECT:         0,
    ITEM:           1,
    CONTAINER:      2,
    UNIT:           3,
    PLAYER:         4,
    GAMEOBJECT:     5,
    DYNAMICOBJECT:  6,
    CORPSE:         7
};
exports.updateType = {
    VALUES:                 0,
    CREATE_OBJECT:          1,
    CREATE_OBJECT2:         2,
    OUT_OF_RANGE_OBJECTS:   3
};
exports.updateFlag = {
    NONE:           0x0000,
    SELF:           0x0001,
    TRANSPORT:      0x0002,
    HAS_TARGET:     0x0004,
    UNK1:           0x0008,
    UNK2:           0x0010,
    LIVING:         0x0020,
    HAS_POSITION:   0x0040,
    VEHICLE:        0x0080,
    POSITION:       0x0100,
    ROTATION:       0x0200,
    UNK3:           0x0400,
    ANIMKITS:       0x0800,
    UNK5:           0x1000,
    UNK6:           0x2000
};

exports.movementFlag = {
    NONE:                   0x00000000,
    FORWARD:                0x00000001,
    BACKWARD:               0x00000002,
    STRAFE_LEFT:            0x00000004,
    STRAFE_RIGHT:           0x00000008,
    LEFT:                   0x00000010,
    RIGHT:                  0x00000020,
    PITCH_UP:               0x00000040,
    PITCH_DOWN:             0x00000080,
    WALKING:                0x00000100,               // Walking
    ONTRANSPORT:            0x00000200,               // Used for flying on some creatures
    LEVITATING:             0x00000400,
    ROOT:                   0x00000800,               // Must not be set along with MOVEMENTFLAG_MASK_MOVING
    JUMPING:                0x00001000,
    FALLING:                0x00002000,               // damage dealt on that type of falling
    PENDING_STOP:           0x00004000,
    PENDING_STRAFE_STOP:    0x00008000,
    PENDING_FORWARD:        0x00010000,
    PENDING_BACKWARD:       0x00020000,
    PENDING_STRAFE_LEFT:    0x00040000,
    PENDING_STRAFE_RIGHT:   0x00080000,
    PENDING_ROOT:           0x00100000,
    SWIMMING:               0x00200000,               // appears with fly flag also
    ASCENDING:              0x00400000,               // press "space" when flying
    DESCENDING:             0x00800000,
    CAN_FLY:                0x01000000,               // can fly
    FLYING:                 0x02000000,               // hover
    SPLINE_ELEVATION:       0x04000000,               // used for flight paths
    SPLINE_ENABLED:         0x08000000,               // used for flight paths
    WATERWALKING:           0x10000000,               // prevent unit from falling through water
    FALLING_SLOW:           0x20000000,               // active rogue safe fall spell (passive)
    HOVER:                  0x40000000,               // hover, cannot jump

    /*FIXME TODO add these if required

    // TODO: Check if PITCH_UP and PITCH_DOWN really belong here..
    MASK_MOVING:
    MOVEMENTFLAG_FORWARD | MOVEMENTFLAG_BACKWARD | MOVEMENTFLAG_STRAFE_LEFT | MOVEMENTFLAG_STRAFE_RIGHT |
    MOVEMENTFLAG_PITCH_UP | MOVEMENTFLAG_PITCH_DOWN | MOVEMENTFLAG_JUMPING | MOVEMENTFLAG_FALLING | MOVEMENTFLAG_ASCENDING | MOVEMENTFLAG_DESCENDING |
    MOVEMENTFLAG_SPLINE_ELEVATION,

    MASK_TURNING:
    MOVEMENTFLAG_LEFT | MOVEMENTFLAG_RIGHT,
    */
};
exports.movementFlag2 = {
    NONE:                   0x00000000,
    NO_STRAFE:              0x00000001,
    NO_JUMPING:             0x00000002,
    UNK3:                   0x00000004,        // Overrides various clientside checks
    FULL_SPEED_TURNING:     0x00000008,
    FULL_SPEED_PITCHING:    0x00000010,
    ALWAYS_ALLOW_PITCHING:  0x00000020,
    UNK7:                   0x00000040,
    UNK8:                   0x00000080,
    UNK9:                   0x00000100,
    UNK10:                  0x00000200,
    INTERPOLATED_MOVEMENT:  0x00000400,
    INTERPOLATED_TURNING:   0x00000800,
    INTERPOLATED_PITCHING:  0x00001000,
    UNK14:                  0x00002000,
    UNK15:                  0x00004000,
    UNK16:                  0x00008000,
};
// FIXME splineFlag uses UpperCamelCase, when all other enums use ALL_UPPER_CASE.
// Should all other enums be changed to UpperCamelCase
// or should splineFlag be changed to ALL_UPPER_CASE???
exports.splineFlag = {
    None:           0x00000000,
    // x00-xFF(first byte) used as animation Ids storage in pair with Animation flag
    Done:           0x00000100,
    Falling:        0x00000200,           // Affects elevation computation, can't be combined with Parabolic flag
    NoSpline:       0x00000400,
    Parabolic:      0x00000800,           // Affects elevation computation, can't be combined with Falling flag
    Walkmode:       0x00001000,
    Flying:         0x00002000,           // Smooth movement(Catmullrom interpolation mode), flying animation
    OrientationFixed: 0x00004000,         // Model orientation fixed
    FinalPoint:     0x00008000,
    FinalTarget:    0x00010000,
    FinalAngle:     0x00020000,
    Catmullrom:     0x00040000,           // Used Catmullrom interpolation mode
    Cyclic:         0x00080000,           // Movement by cycled spline
    EnterCycle:     0x00100000,           // Everytimes appears with cyclic flag in monster move packet, erases first spline vertex after first cycle done
    Animation:      0x00200000,           // Plays animation after some time passed
    Frozen:         0x00400000,           // Will never arrive
    Transport:      0x00800000,
    ExitVehicle:    0x01000000,
    Unknown26:      0x02000000,
    Unknown27:      0x04000000,
    OrientationInversed: 0x08000000,
    UsePathSmoothing: 0x10000000,
    Animation2:     0x20000000,
    UnCompressedPath: 0x40000000,
    Unknown32:      0x80000000,

    /*FIXME TODO add these if required

    // Masks
    Mask_Final_Facing:  Final_Point | Final_Target | Final_Angle,
    // animation ids stored here, see AnimType enum, used with Animation flag
    Mask_Animations:  0xFF,
    // flags that shouldn't be appended into SMSG_MONSTER_MOVE\SMSG_MONSTER_MOVE_TRANSPORT packet, should be more probably
    Mask_No_Monster_Move:  Mask_Final_Facing | Mask_Animations | Done,
    // CatmullRom interpolation mode used
    Mask_CatmullRom:  Flying | Catmullrom,
    // Unused, not supported flags
    Mask_Unused:  No_Spline|Enter_Cycle|Frozen|Transport|Exit_Vehicle|Unknown26|Unknown27,
    */
};

exports.MAX_ACTION_BUTTONS = 144; //checked in 3.2.0

exports.castFlag = {
    NONE:               0x00000000,
    PENDING:            0x00000001,              // aoe combat log?
    UNKNOWN_2:          0x00000002,
    UNKNOWN_3:          0x00000004,
    UNKNOWN_4:          0x00000008,              // ignore AOE visual
    UNKNOWN_5:          0x00000010,
    UNKNOWN_6:          0x00000020,
    UNKNOWN_7:          0x00000040,
    UNKNOWN_8:          0x00000080,
    UNKNOWN_9:          0x00000100,
    UNKNOWN_10:         0x00000200,
    UNKNOWN_11:         0x00000400,
    POWER_LEFT_SELF:    0x00000800,
    UNKNOWN_13:         0x00001000,
    UNKNOWN_14:         0x00002000,
    UNKNOWN_15:         0x00004000,
    UNKNOWN_16:         0x00008000,
    UNKNOWN_17:         0x00010000,
    UNKNOWN_18:         0x00020000,
    UNKNOWN_19:         0x00040000,
    UNKNOWN_20:         0x00080000,
    UNKNOWN_21:         0x00100000,
    RUNE_LIST:          0x00200000,
    UNKNOWN_23:         0x00400000,
    UNKNOWN_24:         0x00800000,
    UNKNOWN_25:         0x01000000,
    UNKNOWN_26:         0x02000000,
    UNKNOWN_27:         0x04000000,
    UNKNOWN_28:         0x08000000,
    UNKNOWN_29:         0x10000000,
    UNKNOWN_30:         0x20000000,
    UNKNOWN_31:         0x40000000,
    UNKNOWN_32:         0x80000000
};
exports.MAX_RUNES = 6;

exports.auraFlag = {
    NONE:                           0x00,
    EFF_INDEX_0:                    0x01,
    EFF_INDEX_1:                    0x02,
    EFF_INDEX_2:                    0x04,
    CASTER:                         0x08,
    POSITIVE:                       0x10,
    DURATION:                       0x20,
    ANY_EFFECT_AMOUNT_SENT:         0x40, // used with AFLAG_EFF_INDEX_0/1/2
    NEGATIVE:                       0x80
};
exports.MAX_SPELL_EFFECTS = 3;

exports.MAX_QUEST_LOG_SIZE = 25;

exports.QUEST_OBJECTIVES_COUNT = 4;
exports.QUEST_ITEM_OBJECTIVES_COUNT = 6;
exports.QUEST_SOURCE_ITEM_IDS_COUNT = 4;
exports.QUEST_REWARD_CHOICES_COUNT = 6;
exports.QUEST_REWARDS_COUNT = 4;
exports.QUEST_DEPLINK_COUNT = 10;
exports.QUEST_REPUTATIONS_COUNT = 5;
exports.QUEST_EMOTE_COUNT = 4;
exports.QUEST_PVP_KILL_SLOT = 0;
exports.QUEST_CURRENCY_COUNT = 4;
