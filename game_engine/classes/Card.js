const CardType = Object.freeze({
    BASIC: "basic",
    LEFT_RIGHT_ATTACK: "left-right-attack",
    BUFF_DMG: "buff-dmg",
    SPAWNER: "spawner",
    INSTAKILL: "instakill",
    BUFF_HP: "buff-hp",
    FLY: "fly",
    DOUBLE_ATTACK: "double-attack",
    THREE_TILE_ATTACK: "three-tile-attack",
    BUFF_DMG_STRONG: "buff-dmg-strong",
    SACRIFICE_BIG: "sacrifice-big"
});

class Card {
    constructor(name, cost, hp, dmg, imgSrc, type) {
        this.name = name;
        this.cost = cost;
        this.hp = hp;
        this.dmg = dmg;
        this.imgSrc = imgSrc;
        this.type = type;
        if (!this.type) {
            this.type = CardType.BASIC;
        }
    }
}

module.exports = { Card, CardType };
