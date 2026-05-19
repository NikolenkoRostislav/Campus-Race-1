const CardCatalog = require("./internal/cardCatalog.js");
const { AttackCommand, AttackCommandRegistry } = require("./internal/attackCommand.js");
const { CardType } = require("./internal/card.js");
const GameBoard = require("./internal/gameBoard.js");
const PlayerInfo = require("./internal/playerInfo.js");
const User = require("../database/models/user.js")

class Game {
    constructor(p1Id, p2Id) {
        this.players = new Map();

        this.players.set(1, new PlayerInfo(p1Id));
        this.players.set(-1, new PlayerInfo(p2Id));

        this.gameBoard = new GameBoard();
        this.turn = 0;
    }

    getPlayerSideByUserID(userID) {
        for (const playerSide of this.players) {
            if (playerSide.values().userID === userID) {
                return playerSide;
            }
        }

        return null;
    }

    getPlayer(side) {
        return this.players.get(side);
    }

    async getPlayerInfo(side) {
        let user = await User.findById(this.getPlayer(side).id);
        if (!user?.login) return null;
        return { login: user.login, pfp_url: user.pfp_url, id: user.id };
    }

    damagePlayer(side, dmg) {
        const newHP = this.getPlayer(side).getDamage(dmg);
        let playerDamageLog = {
            Action: "PLAYER_HP_UPDATE",
            Side: side,
            NewHP: newHP
        };
        return playerDamageLog
    }

    wipeEnergy() {
        this.getPlayer(1).clearEnergy();
        this.getPlayer(-1).clearEnergy();
    }

    sacrificeCard(x, side) {
        let cardData = this.gameBoard.get(x, side);
        let card = CardCatalog.get(cardData.cardID);
        this.gameBoard.removeCard(x, side);

        if (card.type === CardType.SACRIFICE_BIG) {
            this.getPlayer(side).addEnergy(3);
        }
        this.getPlayer(side).addEnergy(1);
    }

    placeCard(x, side, cardID) {
        cardID = Number(cardID);
        let card = CardCatalog.get(cardID);
        let player = this.getPlayer(side);

        if (
            player.hasCard(cardID) &&
            player.hasEnoughEnergy(card.cost) &&
            this.gameBoard.placeCard(x, side, cardID)
        ) {
            player.consumeCard(cardID);
            player.consumeEnergy(card.cost);
            return true;
        }
        return false;
    }

    playerDie(side) {
        let playerDieLog = {
            Action: "PLAYER_DIE",
            Side: side
        };
        return playerDieLog
    }

    battle(side) {
        let battleLog = [];

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameBoard.get(x, side);
            if (!attacker) continue

            let card = CardCatalog.get(attacker.cardID);
            const CommandClass = AttackCommandRegistry[card.type] || AttackCommand;
            let attackCommand = new CommandClass(this, x, side, battleLog);
            attackCommand.execute();
            battleLog = attackCommand.battleLog;

            if (this.getPlayer(1).hp <= 0) {
                battleLog.push(this.playerDie(1));
                break;
            } else if (this.getPlayer(-1).hp <= 0) {
                battleLog.push(this.playerDie(-1));
                break;
            }
        }

        return battleLog;
    }
}

module.exports = Game;
