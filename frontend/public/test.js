//  Testing animations 

updateEnergy(0);
// Card in 'hand'
updateHand(5);

// Set HP for both sides
updateHP('left-hp', 10);
updateHP('right-hp', 10);


function forcePlaceCard(rowId, index) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const slot = row.querySelector(`.card-slot[data-index="${index}"]`);
    if (!slot || slot.classList.contains('occupied')) return;

    slot.classList.add('occupied');
    const boardCard = document.createElement('div');
    boardCard.classList.add('board-card');
    
    boardCard.style.backgroundImage = "url('assets/card_suit.png')"; 
    slot.appendChild(boardCard);
}

// Full test scenario: setup board and attack
async function runFullTestScenario() {
    // Spawn player cards
    forcePlaceCard('player-front-row', 0);
    forcePlaceCard('player-front-row', 1);
    
    // Spawn opponent cards
    forcePlaceCard('opponent-front-row', 0);
    forcePlaceCard('opponent-front-row', 3);
    
    await sleep(500); 

    const testBackendResponse = [
        {
            Action: "ATTACK",
            AttackerCoord: [0, "player"],
            TargetCoord: [0, "opponent"]
        },
        {
            Action: "ATTACK",
            AttackerCoord: [1, "player"],
            TargetCoord: [3, "opponent"]
        }
    ];

    processAttackQueue(testBackendResponse);
}

// Just press 'T' :)
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 't' || event.key.toLowerCase() === 'е') {
        runFullTestScenario();
    }
});