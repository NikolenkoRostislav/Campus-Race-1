const CardType = require("./Card.js").CardType;

class AttackCommand {
    constructor(game, x, attackingSide, battleLog) {
        this.game = game;
        this.x = x;
        this.attackingSide = attackingSide;
        this.defendingSide = -attackingSide;
        this.battleLog = battleLog;
        this.attacker = this.game.gameState.gameBoard.get(x, attackingSide);
    }

    execute() {
        this.attackLane(this.x);
    }

    attackLane(targetX) {
        if (![1, 2, 3, 4].includes(targetX)) return;

        this.battleLog.push({
            Action: "ATTACK",
            AttackerCoord: `${this.x}:${this.attackingSide}`,
            TargetCoord: `${targetX}:${this.defendingSide}`
        });

        const defender = this.game.gameState.gameBoard.get(
            targetX,
            this.defendingSide
        );

        if (!defender) {
            this.attackPlayer();
            return
        };

        this.attackCard(targetX, defender, this.attacker.dmg);
    }

    attackPlayer() {
        const newHP = this.game.damagePlayer(
            this.defendingSide,
            this.attacker.dmg
        );

        this.battleLog.push({
            Action: "PLAYER_HP_UPDATE",
            Side: this.defendingSide,
            NewHP: newHP
        });

        if (newHP <= 0) {
            this.battleLog.push({ Action: "PLAYER_DIE", Side: this.defendingSide });
            return;
        }

        return;
    }

    attackCard(x, defender, damage) {
        if (![1, 2, 3, 4].includes(x)) return;
        const defenderHP = defender.takeDamage(damage);

        this.battleLog.push({
            Action: "CARD_HP_UPDATE",
            TargetCoord: `${x}:${this.defendingSide}`,
            NewHP: defenderHP
        });

        if (defender.isDead()) {
            this.game.gameState.gameBoard.set(
                this.x,
                this.defendingSide,
                null
            );

            this.battleLog.push({ Action: "CARD_DIE", TargetCoord: `${x}:${this.defendingSide}` });
        }
    }
}

class DoubleAttackCommand extends AttackCommand {
    execute() {
        super.execute();
        super.execute();
    }
}

class LeftRightAttackCommand extends AttackCommand {
    execute() {
        this.attackLane(this.x - 1);
        this.attackLane(this.x + 1);
    }
}

class TripleAttackCommand extends AttackCommand {
    execute() {
        super.attackLane(this.x - 1);
        super.attackLane(this.x);
        super.attackLane(this.x + 1);
    }
}

class FlyAttackCommand extends AttackCommand {
    execute() {
        this.attackPlayer();
    }
}

class InstakillAttackCommand extends AttackCommand {
    execute() {
        const defender = this.game.gameState.gameBoard.get(
            this.x,
            this.defendingSide
        );

        if (!defender) {
            this.attackPlayer();
            return
        }

        this.attackCard(this.x, defender, 999);
    }
}

const AttackCommandRegistry = {
    [CardType.FLY]: FlyAttackCommand,
    [CardType.LEFT_RIGHT_ATTACK]: LeftRightAttackCommand,
    [CardType.DOUBLE_ATTACK]: DoubleAttackCommand,
    [CardType.THREE_TILE_ATTACK]: TripleAttackCommand,
    [CardType.INSTAKILL]: InstakillAttackCommand,
};

module.exports = { AttackCommand, AttackCommandRegistry };