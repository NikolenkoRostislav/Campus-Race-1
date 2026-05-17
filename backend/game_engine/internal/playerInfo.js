class PlayerInfo {
    constructor(id) {
        this.id = id;
        this.hand = [];
        this.drawStarterHand();
        this.hp = 10;
        this.energy = 0;
    }

    clearEnergy() {
        this.energy = 0;
    }

    addEnergy(energy) {
        this.energy += energy;
    }

    hasEnoughEnergy(energy) {
        return this.energy >= energy;
    }

    consumeEnergy(energy) {
        if (this.energy - energy < 0) return false

        this.energy -= energy;
        return true
    }

    hasCard(cardID) {
        return this.hand.includes(cardID);
    }

    consumeCard(cardID) {
        if (!this.hasCard(cardID)) return false
        this.hand.splice(this.hand.indexOf(cardID), 1);
        return true
    }

    drawCard(random) {
        let cardID = 1
        if (random) cardID = Math.floor(Math.random() * 20) + 2;

        this.hand.push(cardID);
    }

    drawStarterHand() {
        this.drawCard(false)
        for (let i = 0; i < 5; i++) {
            this.drawCard(true)
        }
    }

    getDamage(dmg) {
        this.hp -= dmg;
        return this.hp
    }
}

module.exports = PlayerInfo