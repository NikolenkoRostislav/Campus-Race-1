const Game = require("./engine.js");

const game = new Game();

// I ai generated this test, this is just to demonstrate the engine

function renderCard(card) {
    if (!card) {
        return [
            "EMPTY ",
            "      ",
            "      "
        ];
    }

    return [
        `${String(card.cardID).padEnd(6)}`,
        `HP:${String(card.hp).padEnd(2)}`,
        `DMG:${String(card.dmg).padEnd(1)}`
    ];
}

function printGraphicBoard(game) {
    const top = [];
    const bottom = [];

    for (let x = 1; x <= 4; x++) {
        top.push(renderCard(
            game.gameState.gameBoard.get(x, -1)
        ));

        bottom.push(renderCard(
            game.gameState.gameBoard.get(x, 1)
        ));
    }

    const printRow = (row) => {
        console.log(
            "║ " +
            row.map(c => c.padEnd(6)).join(" ║ ") +
            " ║"
        );
    };

    console.log(`\nP2 HP: ${game.gameState.player2Info.hp}`);
    console.log("\n╔═══════════════════════════════════╗");
    console.log("║              PLAYER 1             ║");
    console.log("╠════════╦════════╦════════╦════════╣");

    for (let i = 0; i < 3; i++) {
        printRow(top.map(card => card[i]));
    }

    console.log("╚════════╩════════╩════════╩════════╝");


    console.log("╔═══════════════════════════════════╗");
    console.log("║              PLAYER 2             ║");
    console.log("╠════════╦════════╦════════╦════════╣");

    for (let i = 0; i < 3; i++) {
        printRow(bottom.map(card => card[i]));
    }

    console.log("╚════════╩════════╩════════╩════════╝");
    console.log(`P1 HP: ${game.gameState.player1Info.hp}\n`);
}

function printLog(logs, title) {
    console.log(`\n--- ${title} ---`);

    if (!logs) return;
    for (const log of logs) {
        console.log(log);
    }
}

console.log("STARTING GAME");

game.gameState.player1Info.energy = 20;
game.gameState.player2Info.energy = 20;

printGraphicBoard(game);

//
// PLAYER 1 SETUP
//

console.log("\nPLAYER 1 PLACING CARDS");

// Commander
let logs = game.placeCard(2, 1, 7);
printLog(logs, "P1 PLACE COMMANDER");

// Basic Fighter beside commander
logs = game.placeCard(1, 1, 3);
printLog(logs, "P1 PLACE BASIC FIGHTER");

// Double Striker beside commander
logs = game.placeCard(3, 1, 17);
printLog(logs, "P1 PLACE DOUBLE STRIKER");

// Healer
logs = game.placeCard(4, 1, 12);
printLog(logs, "P1 PLACE HEALER");

printGraphicBoard(game);

//
// PLAYER -1 SETUP
//

console.log("\nPLAYER -1 PLACING CARDS");

// Swarm Mother
logs = game.placeCard(2, -1, 10);
printLog(logs, "P2 PLACE SWARM MOTHER");

// Assassin
logs = game.placeCard(3, -1, 11);
printLog(logs, "P2 TRIES TO PLACE ASSASSIN (fails)");

// Flying unit
logs = game.placeCard(4, -1, 13);
printLog(logs, "P2 PLACE FLYER");

// Wall
logs = game.placeCard(1, -1, 5);
printLog(logs, "P2 PLACE WALL");

printGraphicBoard(game);

//
// PLAYER -1 ATTACK PHASE
//

console.log("\nPLAYER -1 ATTACK PHASE");

game.gameState.phase = 3;

logs = game.battle();

printLog(logs, "PLAYER -1 BATTLE");

printGraphicBoard(game);

//
// PLAYER 1 ATTACK PHASE
//

console.log("\nPLAYER 1 ATTACK PHASE");

game.gameState.phase = 6;

logs = game.battle();

printLog(logs, "PLAYER 1 BATTLE");

printGraphicBoard(game);

//
// EXTRA ROUND
//

console.log("\nSECOND ROUND");

game.gameState.phase = 3;

logs = game.battle();

printLog(logs, "PLAYER -1 SECOND BATTLE");

printGraphicBoard(game);
