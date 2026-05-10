const GameState = require("./classes/GameState.js");

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

        let side
        if (this.gameState.phase == 3) {
            side = -1

        } else if (this.gameState.phase == 6) {
            side = 1
        } else {
            throw new Error("Invalid phase");
        }
        let defendingSide = -side

        for (let x = 1; x <= 4; x++) {
            const attacker = this.gameState.gameBoard.get(x, side);
            if (attacker == null) {
                continue;
            }
            battleLog.push({ Action: "ATTACK", AttackerCoord: `${x}:${side}`, TargetCoord: `${x}:${defendingSide}` });

            const defender = this.gameState.gameBoard.get(x, defendingSide);
            if (!defender) {
                let newHP = this.damagePlayer(defendingSide, attacker.dmg);
                battleLog.push({ Action: "PLAYER_HP_UPDATE", Side: defendingSide, NewHP: newHP });
                if (newHP <= 0) {
                    battleLog.push({ Action: "PLAYER_DIE", Side: defendingSide });
                    return battleLog
                }
                continue;
            }

            let defenderHP = defender.takeDamage(attacker.dmg);
            battleLog.push({ Action: "CARD_HP_UPDATE", TargetCoord: `${x}:${defendingSide}`, NewHP: defenderHP });

            if (defender.isDead()) {
                this.gameState.gameBoard.set(x, defendingSide, null);
                battleLog.push({ Action: "CARD_DIE", TargetCoord: `${x}:${defendingSide}` });
            }

        }

        return battleLog
    }
}

module.exports = Game;
