const GameState = require("./classes/GameState.js");
const CardCatalog = require("./classes/CardCatalog.js");
const CardType = require("./classes/Card.js").CardType;
const { AttackCommand, FlyAttackCommand, LeftRightAttackCommand, DoubleAttackCommand, TripleAttackCommand, InstakillAttackCommand } = require("./classes/AttackCommand.js");

class Game {
    constructor() {
        this.gameState = new GameState();
    }

    damagePlayer(side, dmg) {
        if (side === 1) {
            this.gameState.player1Info.hp = this.gameState.player1Info.hp - dmg;
            return this.gameState.player1Info.hp
        } else {
            this.gameState.player2Info.hp = this.gameState.player2Info.hp - dmg;
            return this.gameState.player2Info.hp
        }
    }

    playerDie(side) {
        console.log("Player " + side + " lost the game"); //placeholder
    }

    battle() {
        let battleLog = [];
        let side;

        if (this.gameState.phase == 3) {
            side = -1;
        } else if (this.gameState.phase == 6) {
            side = 1;
        } else {
            throw new Error("Invalid phase");
        }

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameState.gameBoard.get(x, side);
            if (!attacker) continue

            let attackCommand
            switch (CardCatalog.get(attacker.cardID).type) {
                case CardType.FLY:
                    attackCommand = new FlyAttackCommand(this, x, side, battleLog);
                    break;
                case CardType.LEFT_RIGHT:
                    attackCommand = new LeftRightAttackCommand(this, x, side, battleLog);
                    break;
                case CardType.DOUBLE:
                    attackCommand = new DoubleAttackCommand(this, x, side, battleLog);
                    break;
                case CardType.TRIPLE:
                    attackCommand = new TripleAttackCommand(this, x, side, battleLog);
                    break;
                case CardType.INSTAKILL:
                    attackCommand = new InstakillAttackCommand(this, x, side, battleLog);
                    break;
                default:
                    attackCommand = new AttackCommand(this, x, side, battleLog);
                    break;
            }

            attackCommand.execute();
            battleLog = attackCommand.battleLog;

            if (this.gameState.player1Info.hp <= 0) {
                this.playerDie(1);
                break;
            } else if (this.gameState.player2Info.hp <= 0) {
                this.playerDie(2);
                break;
            }
        }

        return battleLog;
    }
}

module.exports = Game;
