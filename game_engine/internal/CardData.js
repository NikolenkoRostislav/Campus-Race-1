const cardCatalog = require("./cardCatalog.js");

class CardData {
    constructor(cardID) {
        let card = cardCatalog.get(cardID);

        this.cardID = cardID;
        this.hp = card.hp;
        this.dmg = card.dmg;
    }

    takeDamage(dmg) {
        this.hp = this.hp - dmg
        if (this.hp <= 0) {
            this.hp = 0
        }
        return this.hp
    }

    increaseDamage(dmg) {
        this.dmg += dmg
    }

    increaseHP(hp) {
        this.hp += hp
    }

    isDead() {
        return this.hp <= 0
    }
}

module.exports = CardData;
