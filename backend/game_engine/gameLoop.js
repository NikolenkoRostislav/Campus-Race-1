const Game = require("./engine.js");
const EventEmitter = require("events");

const States = {
    P1_DRAW: "P1_DRAW",
    P1_PLACE: "P1_PLACE",
    P1_BATTLE: "P1_BATTLE",

    P2_DRAW: "P2_DRAW",
    P2_PLACE: "P2_PLACE",
    P2_BATTLE: "P2_BATTLE"
};

const BattleTime = 5_000;
const DrawTime = 15_000;
const PlaceTime = 60_000;

class GameLoop extends EventEmitter {
    constructor(id, p1ID, p2ID) {
        super();

        this.id = id;
        this.game = new Game(p1ID, p2ID);

        this.state = null;
        this.timer = null;

        this.enterState(States.P1_PLACE);
    }

    clearTimer() {
        if (!this.timer) return;

        clearTimeout(this.timer);
        this.timer = null;
    }

    enterState(state) {
        this.clearTimer();

        this.state = state;
        this.emit("state_changed", {
            id: this.id,
            newState: this.state,
        });

        switch (state) {
            case States.P1_DRAW:
                this.handleP1Draw();
                break;

            case States.P1_PLACE:
                this.handleP1Place();
                break;

            case States.P1_BATTLE:
                this.handleP1Battle();
                break;

            case States.P2_DRAW:
                this.handleP2Draw();
                break;

            case States.P2_PLACE:
                this.handleP2Place();
                break;

            case States.P2_BATTLE:
                this.handleP2Battle();
                break;
        }
    }

    handleP1Draw() {
        this.timer = setTimeout(() => {
            this.game.getPlayer(1).drawCard(false);
            this.enterState(States.P1_PLACE);
        }, DrawTime);
    }

    handleP1Place() {
        this.game.wipeEnergy();

        this.timer = setTimeout(() => {
            this.enterState(States.P1_BATTLE);
        }, PlaceTime);
    }

    handleP1Battle() {
        let log = this.game.battle(1);
        this.emit("battle_completed", log);

        this.timer = setTimeout(() => {
            this.game.turn++;
            this.enterState(States.P2_DRAW);
        }, BattleTime);
    }

    handleP2Draw() {
        this.timer = setTimeout(() => {
            this.game.getPlayer(-1).drawCard(false);
            this.enterState(States.P2_PLACE);
        }, DrawTime);
    }

    handleP2Place() {
        this.game.wipeEnergy();

        this.timer = setTimeout(() => {
            this.enterState(States.P2_BATTLE);
        }, PlaceTime);
    }

    handleP2Battle() {
        let log = this.game.battle(-1);
        this.emit("battle_completed", log);

        this.timer = setTimeout(() => {
            this.game.turn++;
            this.enterState(States.P1_DRAW);
        }, BattleTime);
    }

    drawCard(side, random) {
        const valid = (side === 1 && this.state === States.P1_DRAW) || (side === -1 && this.state === States.P2_DRAW);
        if (!valid) return false;

        this.clearTimer();

        this.game.getPlayer(side).drawCard(random);

        if (side === 1) {
            this.enterState(States.P1_PLACE);
        } else {
            this.enterState(States.P2_PLACE);
        }

        return {
            hand: this.game.getPlayer(side).hand
        };
    }

    placeCard(side, x, cardID) {
        const valid = (side === 1 && this.state === States.P1_PLACE) || (side === -1 && this.state === States.P2_PLACE);
        if (!valid) return "failed to place card";

        const success = this.game.placeCard(x, side, cardID);
        if (!success) return "failed to place card";

        return {
            board: Object.fromEntries(this.game.gameBoard.board),
            hand: this.game.getPlayer(side).hand,
            energy: this.game.getPlayer(side).energy
        };
    }

    sacrificeCard(side, x) {
        const valid = (side === 1 && this.state === States.P1_PLACE) || (side === -1 && this.state === States.P2_PLACE);
        if (!valid) return false;

        this.game.sacrificeCard(x, side);
        return {
            board: Object.fromEntries(this.game.gameBoard.board),
            energy: this.game.getPlayer(side).energy
        };
    }

    endPlacePhase(side) {
        if (side === 1 && this.state === States.P1_PLACE) {
            this.enterState(States.P1_BATTLE);
            return true;
        }

        if (side === -1 && this.state === States.P2_PLACE) {
            this.enterState(States.P2_BATTLE);
            return true;
        }

        return false;
    }
}

module.exports = GameLoop;