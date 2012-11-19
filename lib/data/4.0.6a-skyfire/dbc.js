var u = 'u32', i = 'i32', f = 'float', s = 'string';
exports.dbcDefs = {
    SpellCooldowns: {id:u, categoryRecoveryTime:u, recoveryTime:u, startRecoveryTime:u},
    SpellPower: {id:u, cost:u, costPerLevel:u, costPct:u, perSecond:u, displayID:u, unk1:u},
    Spell: {
        id:u, attributes:u,
        attributesEx :u, attributesEx2:u, attributesEx3:u, attributesEx4:u,
        attributesEx5:u, attributesEx6:u, attributesEx7:u, attributesEx8:u,
        unk_400_1:u, castingTimeIdx:u, durationIdx:u, powerType:u, rangeIdx:u,
        speed:f, spellVisual1:u, spellVisual2:u, spellIconID:u, activeIconID:u,
        name:s, rank:s, description:s, tooltip:s, schoolMask:u,
        runeCostID:u, missileID:u, descriptionVariableID:u, diffificultyID:u,
        unk_f1:f,
        // XID is an index in SpellX.dbc.
        scalingID:u, auraOptionsID:u, auraRestrictionID:u, castingRequirementsID:u,
        categoriesID:u, classOptionsID:u, cooldownsID:u, unkIndex7:u,
        equippedItemsID:u, interruptsID:u, levelsID:u, powerID:u,
        reagentsID:u, shapeshiftID:u, targetRestrictionsID:u, totemsID:u,
        unk2:u
    },
    WorldMapArea: {id:u, map:u, area:u, name:s, x1:f, x2:f, y1:f, y2:f, _1:i, _2:i, _3:u, _4:u},
    WorldMapOverlay: {id:u, base:u, _1:u, _2:u, _3:u, _4:u, name:s, width:u, height:u, x:u, y:u, _5:u, _6:u, _7:u, _8:u}
};
