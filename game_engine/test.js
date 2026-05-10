const CardData = require("./classes/CardData.js");
const Game = require("./engine.js");

const game = new Game();

function printBoard(title) {
    console.log(`\n${title}\n`);

    for (const [coord, card] of game.gameState.gameBoard.board) {
        console.log(coord, card);
    }

    console.log("\nP1 HP:", game.gameState.player1Info.hp);
    console.log("P2 HP:", game.gameState.player2Info.hp);
}

// Setup phase 3 (player 1 attack)
game.gameState.phase = 3;

// Attacking side (-1)
game.gameState.gameBoard.set(1, -1, new CardData(3));
game.gameState.gameBoard.set(2, -1, new CardData(8));
game.gameState.gameBoard.set(4, -1, new CardData(20));

// Defending side (1)
game.gameState.gameBoard.set(1, 1, new CardData(4));
game.gameState.gameBoard.set(2, 1, new CardData(3));
game.gameState.gameBoard.set(3, 1, new CardData(16));

console.log("=== BEFORE BATTLE ===");
printBoard("START");

// Player 1 attack
let battleLog = game.battle();

console.log("\nBattle Log P1:");
for (const log of battleLog) {
    console.log(log);
}

printBoard("AFTER PLAYER 1");

// Enemy attack 5 times for testing purposes
game.gameState.phase = 6;
for (let i = 0; i < 5; i++) {

    console.log(`\n=== ENEMY BATTLE ROUND ${i + 1} ===`);

    battleLog = game.battle();

    console.log("\nBattle Log P2:");
    for (const log of battleLog) {
        console.log(log);
    }

    printBoard(`AFTER ENEMY ROUND ${i + 1}`);
}