// Frontend gameboard

// --- ENERGY LOGIC ---
const energyText = document.getElementById('energy-amount');
let currentEnergy = 0;

function updateEnergy(newAmount) {
    if (newAmount < 0) {
        newAmount = 0;
    }
    
    currentEnergy = newAmount;
    
    if (energyText) {
        energyText.textContent = currentEnergy;
        
        // Update colors based on energy amount
        if (currentEnergy === 0) {
            energyText.classList.remove('energy-positive');
            energyText.classList.add('energy-zero');
        } else {
            energyText.classList.remove('energy-zero');
            energyText.classList.add('energy-positive');
        }
    }
}

// --- HP LOGIC ---
function updateHP(containerId, hpAmount) {
    const container = document.getElementById(containerId);
    if (!container) return; 
    
    container.innerHTML = '';
    
    if (hpAmount < 0) hpAmount = 0;

    // --- For 20 hp, 1 heart - 2hp ---
    // const fullHearts = Math.floor(hpAmount / 2);
    // const hasHalfHeart = hpAmount % 2 !== 0; 

    const fullHearts = hpAmount; 

    for (let i = 0; i < fullHearts; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart-icon');
        container.appendChild(heart);
    }

    /*
    if (hasHalfHeart) {
        const halfHeart = document.createElement('div');
        halfHeart.classList.add('half-heart-icon');
        container.appendChild(halfHeart);
    }
    */
}

function updateHand(cardCount) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    
    handContainer.innerHTML = '';
    if (cardCount <= 0) return;

    const angleStep = 10; 
    const yStep = 2; 
    const middleIndex = (cardCount - 1) / 2;

    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement('div');
        card.classList.add('hand-card');

        const offset = i - middleIndex;
        const angle = offset * angleStep;
        const yOffset = Math.abs(offset) * yStep; 

        card.style.setProperty('--card-angle', `${angle}deg`);
        card.style.setProperty('--card-y', yOffset);
        card.style.zIndex = i;

        handContainer.appendChild(card);
    }
}

// --- CARD PLACEMENT LOGIC ---

let selectedCard = null;

// Initialize card interaction
function setupCardInteractions() {
    // Select card in hand
    const handContainer = document.getElementById('player-hand');
    if (handContainer) {
        handContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.hand-card');
            if (!card) return;

            if (selectedCard === card) {
                clearSelection();
                return;
            }

            clearSelection();
            selectedCard = card;
            selectedCard.classList.add('selected');
            highlightValidSlots();
        });
    }

    // Click on a slot
    const allSlots = document.querySelectorAll('.card-slot');
    allSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.classList.contains('highlight') && selectedCard) {
                placeCardInSlot(slot);
            }
        });
    });
}

// Highlight card slots 
function highlightValidSlots() {
    const frontRow = document.getElementById('player-front-row');
    if (!frontRow) return;

    const emptySlots = frontRow.querySelectorAll('.card-slot:not(.occupied)');
    emptySlots.forEach(slot => {
        slot.classList.add('highlight');
    });
}

// Clear selection and highlights
function clearSelection() {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
    
    const highlightedSlots = document.querySelectorAll('.card-slot.highlight');
    highlightedSlots.forEach(slot => {
        slot.classList.remove('highlight');
    });
}

// Place card and trigger animations
function placeCardInSlot(slot) {
    slot.classList.add('occupied');
    slot.classList.remove('highlight');

    const boardCard = document.createElement('div');
    boardCard.classList.add('board-card');
    
    const cardBg = window.getComputedStyle(selectedCard).backgroundImage;
    boardCard.style.backgroundImage = cardBg;

    slot.appendChild(boardCard);

    selectedCard.remove();
    clearSelection();
    
    // Recalculate hand fan
    updateHand(document.querySelectorAll('.hand-card').length);
}

setupCardInteractions();

// --- ATTACK ANIMATION & QUEUE ---

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getCardSlot(side, index) {
    const rowId = side === 'player' ? 'player-front-row' : 'opponent-front-row';
    const row = document.getElementById(rowId);
    if (!row) return null;
    return row.querySelector(`.card-slot[data-index="${index}"]`);
}

// Perform a single, multi-stage attack animation
async function playAttackAnimation(attackerData, targetData) {
    const attackerSlot = getCardSlot(attackerData[1], attackerData[0]);
    const targetSlot = getCardSlot(targetData[1], targetData[0]);

    if (!attackerSlot || !targetSlot) return;

    const attackerCard = attackerSlot.querySelector('.board-card');
    const targetCard = targetSlot.querySelector('.board-card');

    if (!attackerCard) return;

    // Calculate distances
    const attackerRect = attackerCard.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    const moveX = targetRect.left - attackerRect.left;
    const moveY = targetRect.top - attackerRect.top;

    // Start attack sequence
    attackerCard.classList.add('attacking');

    attackerCard.classList.add('lifted');
    await sleep(250); 

    attackerCard.style.setProperty('--move-x', `${moveX}px`);
    attackerCard.style.setProperty('--move-y', `${moveY}px`);
    await sleep(300); 

    attackerCard.classList.remove('lifted');
    attackerCard.classList.add('striking'); 
    await sleep(150); 

    if (targetCard) {
        targetCard.remove();
        targetSlot.classList.remove('occupied');
    }

    attackerCard.classList.remove('striking');
    attackerCard.classList.add('lifted');
    await sleep(250); 

    attackerCard.style.setProperty('--move-x', `0px`);
    attackerCard.style.setProperty('--move-y', `0px`);
    await sleep(300); 

    attackerCard.classList.remove('lifted');
    await sleep(250); 

    // Cleanup
    attackerCard.classList.remove('attacking');
    attackerCard.style.removeProperty('--move-x');
    attackerCard.style.removeProperty('--move-y');
    
    await sleep(100); 
}

// Queue system to process multiple attacks one by one
async function processAttackQueue(attacksArray) {
    for (const attackObj of attacksArray) {
        if (attackObj.Action === "ATTACK") {
            await playAttackAnimation(attackObj.AttackerCoord, attackObj.TargetCoord);
        }
    }
}
