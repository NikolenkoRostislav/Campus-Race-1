class PlayerInfo {
    constructor(id) {
        this.id = id;
        this.deck = [];
        this.drawStarterDeck();
        this.hp = 20;
        this.energy = 0;
    }

    clearEnergy() {
        this.energy = 0;
    }

    addEnergy(energy) {
        this.energy += energy;
    }

    consumeEnergy(energy) {
        if (this.energy - energy < 0) {
            return false
        }
        this.energy -= energy;
        return true
    }

    drawCard(random) {
        let cardID = 1
        if (random) {
            cardID = Math.floor(Math.random() * 20) + 2;
        }

        this.deck.push(cardID);
    }

    drawStarterDeck() {
        this.drawCard(false)
        for (let i = 0; i <= 8; i++) {
            this.drawCard(true)
        }
    }

    getDeck() {
        return this.deck
    }

    hasCard(cardID) {
        return this.deck.includes(cardID);
    }

    consumeCard(cardID) {
        if (!this.hasCard(cardID)) return false
        this.deck.splice(this.deck.indexOf(cardID), 1);
        return true
    }

    getDamage(dmg) {
        this.hp -= dmg;
        return this.hp
    }
}

module.exports = PlayerInfo