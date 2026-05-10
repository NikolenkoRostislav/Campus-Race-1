class Card {
    constructor(name, cost, hp, dmg, imgSrc, effects = []) {
        this.name = name;
        this.cost = cost;
        this.hp = hp;
        this.dmg = dmg;
        this.imgSrc = imgSrc;
        this.effects = effects;
    }
}