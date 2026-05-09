class Card {
    constructor(id, name, cost, hp, dmg, effects = []) {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.maxHp = hp;
        this.hp = hp;
        this.dmg = dmg;
        this.effects = effects;
        this.isAlive = true;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    healOrBuff(amount) {
        this.hp += amount;
    }

    buffDamage(amount) {
        this.dmg += amount;
    }

    die() {
        this.isAlive = false;
    }
}