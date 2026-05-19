// Frontend gameboard

// --- GLOBAL GAME STATE ---
window.currentRoomID = null;
window.myUserID = null;
window.mySide = null;
/*window.currentState = null;*/
window.isGameActive = false;

// --- FRONTEND CARD CATALOG ---
const FRONTEND_CATALOG = {
    1: { hp: 1, dmg: 0 },
    2: { hp: 2, dmg: 0 },
    3: { hp: 1, dmg: 2 },
    4: { hp: 4, dmg: 1 },
    5: { hp: 6, dmg: 0 },
    6: { hp: 1, dmg: 1 },
    7: { hp: 1, dmg: 1 },
    8: { hp: 2, dmg: 3 },
    9: { hp: 3, dmg: 2 },
    10: { hp: 2, dmg: 1 },
    11: { hp: 2, dmg: 1 },
    12: { hp: 6, dmg: 1 },
    13: { hp: 2, dmg: 2 },
    14: { hp: 1, dmg: 1 },
    15: { hp: 4, dmg: 1 },
    16: { hp: 6, dmg: 4 },
    17: { hp: 5, dmg: 2 },
    18: { hp: 2, dmg: 2 },
    19: { hp: 4, dmg: 1 },
    20: { hp: 8, dmg: 5 },
    21: { hp: 1, dmg: 1 },
    101: { hp: 1, dmg: 1 }
};

let _internalState = null;
Object.defineProperty(window, 'currentState', {
    get: () => _internalState,
    set: (value) => {
        _internalState = value;
        if (typeof updateTurnHighlight === 'function') {
            updateTurnHighlight();
        }
    }
});

// Read room and side from URL (side is set when redirecting from the lobby)
const urlParams = new URLSearchParams(window.location.search);
window.currentRoomID = urlParams.get("roomID");
window.mySide = parseInt(urlParams.get("side"), 10);

if (!window.currentRoomID) {
    console.log("No room ID in URL (main menu view).");
} else {
    console.log("Active room:", window.currentRoomID);

    // Draw default HP on load before the server snapshot arrives
    updateHP('left-hp', 10);
    updateHP('right-hp', 10);

    fetchClientIdentity();
}

async function fetchClientIdentity() {
    try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (data.loggedIn) {
            window.myUserID = data.user.id;
            console.log("Identity verified. User ID:", window.myUserID);

            const playerNameEl = document.getElementById('playerName');
            if (playerNameEl) playerNameEl.textContent = data.user.login || "Player";

            // Connect WebSocket after we know who we are
            initSocket();

            // Initial sync: hand and board from the server
            const handData = await getHand(window.currentRoomID);
            await loadUsersData();
            if (handData?.hand) updateHand(handData.hand);

            const boardData = await getGameboard(window.currentRoomID);
            if (boardData) {
                if (boardData.board) syncBoard(boardData.board);

                // Recover phase if we missed state_changed during page load
                if (boardData.currentState) {
                    window.currentState = boardData.currentState;
                    console.log("Recovered match phase from backend:", window.currentState);

                    if (typeof window.startLocalTimer === 'function') window.startLocalTimer(window.currentState);

                    const isMyPlacePhase = (window.mySide === 1 && window.currentState === "P1_PLACE") ||
                                           (window.mySide === -1 && window.currentState === "P2_PLACE");
                    
                    if (isMyPlacePhase) {
                        const endTurnBtn = document.getElementById('end-turn-btn');
                        if (endTurnBtn) endTurnBtn.style.display = 'block';
                    }
                }
            }

            fetchOpponentIdentity();
        } else {
            window.location.href = "/login";
        }
    } catch (e) {
        console.error("Failed to load player identity:", e);
    }
}

async function fetchOpponentIdentity() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let enemyID = urlParams.get("enemyID");

        if (!enemyID) {
            const { creatorID, opponentID } = await getLobbyMembers(window.currentRoomID);
            enemyID = (creatorID === window.myUserID) ? opponentID : creatorID;
        }

        if (enemyID) {
            const enemyData = await getUserByID(enemyID);
            const opponentNameEl = document.getElementById('opponentName');
            if (opponentNameEl) opponentNameEl.textContent = enemyData?.login || "Opponent";
        }
    } catch (e) {
        console.error("Failed to load opponent identity:", e);
        const opponentNameEl = document.getElementById('opponentName');
        if (opponentNameEl) opponentNameEl.textContent = "Opponent";
    }
}

window.isBattleAnimating = false;
window.pendingBoardSync = null;

function syncBoard(boardObject) {
    // Під час бойових анімацій відкладаємо оновлення столу
    if (window.isBattleAnimating) {
        window.pendingBoardSync = boardObject;
        return;
    }

    const currentCards = new Map();
    document.querySelectorAll('.card-slot').forEach(slot => {
        const card = slot.querySelector('.board-card');
        if (card) {
            const sideStr = slot.parentElement.id === 'player-front-row'
                ? window.mySide
                : (window.mySide === 1 ? -1 : 1);
            const x = parseInt(slot.getAttribute('data-index'), 10) + 1;
            currentCards.set(`${x}:${sideStr}`, card);
        }
    });

    for (const [key, cardData] of Object.entries(boardObject)) {
        if (!cardData) continue;

        const [xStr, sideStr] = key.split(':');
        const x = parseInt(xStr, 10);
        const sideVal = parseInt(sideStr, 10);
        const side = sideVal === window.mySide ? 'player' : 'opponent';
        const index = x - 1;

        const slot = getCardSlot(side, index);
        if (!slot) continue;

        let boardCard;

        if (currentCards.has(key)) {
            // КЛЮЧОВА ЗМІНА: якщо картка вже є, ми беремо її для оновлення статів
            boardCard = currentCards.get(key);
            currentCards.delete(key);
        } else {
            // Нова картка з сервера — створюємо з нуля
            slot.classList.add('occupied');
            boardCard = document.createElement('div');
            boardCard.classList.add('board-card');

            const cardID = typeof cardData === 'object' ? (cardData.id || cardData.cardID) : cardData;
            boardCard.style.backgroundImage = getCardImageURL(cardID);
            slot.appendChild(boardCard);
        }

        // Оновлюємо ХП та Демедж кожного разу, коли приходить свіжий стан з бекенду
        if (typeof cardData === 'object') {
            const hp = cardData.hp !== undefined ? cardData.hp : cardData.health;
            const dmg = cardData.dmg !== undefined ? cardData.dmg : cardData.damage;
            
            if (hp !== undefined && dmg !== undefined) {
                updateCardStats(boardCard, hp, dmg);
            }
        }
    }

    // Видаляємо картки, які зникли з бекенду (наприклад, померли)
    currentCards.forEach((cardEl) => {
        const slot = cardEl.parentElement;
        if (slot) {
            cardEl.remove();
            slot.classList.remove('occupied');
        }
    });

    if (typeof window.highlightValidSlots === 'function') {
        window.highlightValidSlots();
    }
}

// --- ENERGY ---
const energyText = document.getElementById('energy-amount');
let currentEnergy = 0;

function updateEnergy(newAmount) {
    if (newAmount < 0) newAmount = 0;
    currentEnergy = newAmount;

    if (energyText) {
        energyText.textContent = currentEnergy;
        if (currentEnergy === 0) {
            energyText.classList.remove('energy-positive');
            energyText.classList.add('energy-zero');
        } else {
            energyText.classList.remove('energy-zero');
            energyText.classList.add('energy-positive');
        }
    }
}

// --- HP ---
function updateHP(containerId, hpAmount) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (hpAmount < 0) hpAmount = 0;

    for (let i = 0; i < hpAmount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart-icon');
        container.appendChild(heart);
    }
}

// --- CARD IMAGE HELPER ---
function getCardImageURL(cardID) {
    if (!cardID) return "url('assets/card_suit.png')";
    
    return `url('assets/cards/${cardID}.png')`;
}

function updateCardStats(cardEl, hp, dmg) {
    let dmgEl = cardEl.querySelector('.card-dmg');
    let hpEl = cardEl.querySelector('.card-hp');

    if (!dmgEl) {
        dmgEl = document.createElement('div');
        dmgEl.classList.add('card-stat', 'card-dmg');
        cardEl.appendChild(dmgEl);
    }
    if (!hpEl) {
        hpEl = document.createElement('div');
        hpEl.classList.add('card-stat', 'card-hp');
        cardEl.appendChild(hpEl);
    }

    if (dmg <= 0) {
        dmgEl.style.display = 'none';
    } else {
        dmgEl.style.display = 'flex';
        dmgEl.textContent = dmg;
    }

    hpEl.textContent = hp;
}


// --- DECK INTERACTION ---
function showCardReveal(cardID, onCompleteCallback) {
    const overlay = document.getElementById('card-reveal-overlay');
    const cardEl = document.getElementById('revealed-card');
    if (!overlay || !cardEl) return;

    // Pick art for the reveal overlay
    cardEl.style.backgroundImage = getCardImageURL(cardID);

    // --- НОВИЙ БЛОК: Додаємо характеристики на велику карту ---
    cardEl.innerHTML = ''; 
    const baseStats = FRONTEND_CATALOG[cardID];
    if (baseStats) {
        updateCardStats(cardEl, baseStats.hp, baseStats.dmg);
    }

    overlay.classList.add('visible');

    const closeReveal = () => {
        overlay.classList.remove('visible');
        overlay.removeEventListener('click', closeReveal);
        if (onCompleteCallback) onCompleteCallback();
    };
    overlay.addEventListener('click', closeReveal);
}

function setupDeckInteractions() {
    const freeDeck = document.getElementById('free-deck');
    const randomDeck = document.getElementById('random-deck');

    // Free deck click
    if (freeDeck) {
        freeDeck.addEventListener('click', async () => {
            const isMyDrawPhase = (window.mySide === 1 && window.currentState === "P1_DRAW") ||
                (window.mySide === -1 && window.currentState === "P2_DRAW");
            if (!isMyDrawPhase) {
                console.log("[DEBUG] Cannot draw: not your draw phase.");
                return;
            }
            try {
                console.log("[DEBUG] Drawing free card...");
                await drawCard(window.currentRoomID, false);
            } catch (error) {
                console.error("Draw free card failed:", error);
            }
        });
    }

    // Random deck click
    if (randomDeck) {
        randomDeck.addEventListener('click', async () => {
            const isMyDrawPhase = (window.mySide === 1 && window.currentState === "P1_DRAW") ||
                (window.mySide === -1 && window.currentState === "P2_DRAW");
            if (!isMyDrawPhase) {
                console.log("[DEBUG] Cannot draw: not your draw phase.");
                return;
            }
            try {
                console.log("[DEBUG] Drawing random card...");

                const res = await drawCard(window.currentRoomID, true);
                if (res?.hand?.length > 0) {
                    const newCard = res.hand[res.hand.length - 1];
                    const cardID = typeof newCard === 'object' ? (newCard.id || newCard.cardID) : newCard;
                    showCardReveal(cardID);
                }
            } catch (error) {
                console.error("Draw random card failed:", error);
            }
        });
    }
}

// --- CARD PLACEMENT & SACRIFICE ---
function setupCardInteractions() {
    const handContainer = document.getElementById('player-hand');
    if (handContainer) {
        handContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.hand-card');
            if (card) selectCard(card);
        });
    }

    const allSlots = document.querySelectorAll('.card-slot');
    allSlots.forEach(slot => {
        slot.addEventListener('click', async () => {
            const slotIndex = parseInt(slot.getAttribute('data-index'), 10);

            console.log(`[DEBUG] Slot click: ${slotIndex + 1}`);

            const isMyPlacePhase = (window.mySide === 1 && window.currentState === "P1_PLACE") ||
                (window.mySide === -1 && window.currentState === "P2_PLACE");

            if (!isMyPlacePhase) {
                console.log("[DEBUG] Action blocked. Current phase:", window.currentState);
                return;
            }

            // Action 1: place card (green highlight only)
            if (slot.classList.contains('highlight') && selectedCard) {
                const rawCardID = selectedCard.getAttribute('data-card-id');
                const cardID = isNaN(rawCardID) ? rawCardID : Number(rawCardID);

                try {
                    console.log(`[DEBUG] Placing card -> slot: ${slotIndex + 1}, id:`, cardID);
                    await placeCard(window.currentRoomID, slotIndex + 1, cardID);
                    clearSelection();
                } catch (error) {
                    console.error("Place card failed:", error);
                }
            }
            // Action 2: sacrifice (red highlight only)
            else if (slot.classList.contains('highlight-sacrifice')) {
                const isMySlot = slot.parentElement.id === 'player-front-row';

                if (isMySlot) {
                    try {
                        console.log(`[DEBUG] Sacrificing card in slot: ${slotIndex + 1}...`);

                        // Optimistic UI: update locally before the server confirms
                        slot.innerHTML = '';
                        slot.classList.remove('occupied', 'highlight-sacrifice');
                        window.updateEnergy(currentEnergy + 1);

                        if (typeof window.highlightValidSlots === 'function') {
                            window.highlightValidSlots();
                        }

                        await sacrificeCard(window.currentRoomID, slotIndex + 1);
                        console.log("[DEBUG] Sacrifice confirmed by server.");
                    } catch (error) {
                        console.error("Sacrifice failed:", error);
                    }
                } else {
                    console.log("[DEBUG] Cannot sacrifice on an opponent slot.");
                }
            } else {
                console.log("[DEBUG] Slot not active (not green or red).");
            }
        });
    });
}

// --- END TURN ---
function setupTurnInteractions() {
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', async () => {
            try {
                console.log("[DEBUG] Ending place phase...");

                // Hide immediately to prevent double-clicks
                endTurnBtn.style.display = 'none';

                await endPlacePhase(window.currentRoomID);
            } catch (e) {
                console.error("End turn failed:", e);
                endTurnBtn.style.display = 'block';
            }
        });
    }
}

// --- HAND DISPLAY ---
function updateHand(handArray) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;

    const cardCount = handArray.length;
    
    // Якщо рука порожня — просто очищаємо
    if (cardCount <= 0) {
        handContainer.innerHTML = '';
        return;
    }

    // 1. Беремо всі існуючі HTML-карти в руці
    const existingCards = Array.from(handContainer.querySelectorAll('.hand-card'));

    // 2. Якщо карт на екрані БІЛЬШЕ, ніж прийшло з сервера (наприклад, поставили на стіл) — видаляємо зайві з кінця
    while (existingCards.length > cardCount) {
        const cardToRemove = existingCards.pop();
        cardToRemove.remove();
    }

    // 3. Якщо карт МЕНШЕ (наприклад, витягнули з колоди) — створюємо лише відсутні слоти
    while (existingCards.length < cardCount) {
        const newCard = document.createElement('div');
        newCard.classList.add('hand-card');
        handContainer.appendChild(newCard);
        existingCards.push(newCard);
    }

    // 4. Тепер просто оновлюємо дані на ІСНУЮЧИХ елементах (ніякого innerHTML = '')
    const maxTotalAngle = 40;
    const preferredAngleStep = 10;
    const angleStep = cardCount > 1
        ? Math.min(preferredAngleStep, maxTotalAngle / (cardCount - 1))
        : 0;

    let overlap = -100;
    if (cardCount > 8) overlap = -104;
    if (cardCount > 15) overlap = -107;

    const yStep = 2;
    const middleIndex = (cardCount - 1) / 2;

    for (let i = 0; i < cardCount; i++) {
        // Беремо вже існуючий або щойно створений елемент
        const card = existingCards[i];

        // Про всяк випадок знімаємо виділення, щоб карти не зависали збільшеними
        card.classList.remove('selected');

        const offset = i - middleIndex;
        const angle = offset * angleStep;
        const yOffset = Math.abs(offset) * yStep * (angleStep / preferredAngleStep);

        const cardData = handArray[i];
        const cardID = typeof cardData === 'object' ? (cardData.id || cardData.cardID) : cardData;

        // Встановлюємо правильний кастомний арт
        card.style.backgroundImage = getCardImageURL(cardID);

        // Підтягуємо характеристики на карту
        const baseStats = FRONTEND_CATALOG[cardID];
        if (baseStats) {
            updateCardStats(card, baseStats.hp, baseStats.dmg);
        }

        // Плавно пересуваємо карту на нову позицію
        card.setAttribute('data-card-id', cardID);
        card.style.setProperty('--card-angle', `${angle}deg`);
        card.style.setProperty('--card-y', yOffset);
        card.style.setProperty('--overlap', overlap);
        card.style.zIndex = i;
    }
}

// --- CARD SELECTION ---
let selectedCard = null;

function selectCard(card) {
    if (!card) return;
    if (selectedCard === card) {
        clearSelection();
        return;
    }
    clearSelection();
    selectedCard = card;
    selectedCard.classList.add('selected');
    highlightValidSlots();

    const placeHint = document.getElementById('place-hint');
    if (placeHint) {
        placeHint.innerHTML = 'Place a card <br> <span style="margin-top: 2px;">→</span>';
    }
}

// --- KEYBOARD NAVIGATION ---
document.addEventListener('keydown', (event) => {
    if (!selectedCard) return;
    const handCards = Array.from(document.querySelectorAll('.hand-card'));
    if (handCards.length === 0) return;

    const currentIndex = handCards.indexOf(selectedCard);
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
        selectCard(handCards[currentIndex - 1]);
    } else if (event.key === 'ArrowRight' && currentIndex < handCards.length - 1) {
        selectCard(handCards[currentIndex + 1]);
    } else if (event.key === 'Escape') {
        clearSelection();
    }
});

function highlightValidSlots() {
    const frontRow = document.getElementById('player-front-row');
    if (!frontRow) return;

    document.querySelectorAll('.card-slot').forEach(slot => {
        slot.classList.remove('highlight', 'highlight-sacrifice');
    });

    const isMyPlacePhase = (window.mySide === 1 && window.currentState === "P1_PLACE") ||
        (window.mySide === -1 && window.currentState === "P2_PLACE");
    if (!isMyPlacePhase) return;

    // Red highlight: sacrifice on your occupied slots during your place phase
    frontRow.querySelectorAll('.card-slot.occupied').forEach(slot => {
        slot.classList.add('highlight-sacrifice');
    });

    // Green highlight: place when a hand card is selected and you have energy (or a free card)
    if (selectedCard) {
        const rawCardID = selectedCard.getAttribute('data-card-id');
        const cardID = isNaN(rawCardID) ? rawCardID : Number(rawCardID);
        const isFreeCard = (cardID === 1 || String(cardID).includes('free'));

        if (isFreeCard || currentEnergy > 0) {
            frontRow.querySelectorAll('.card-slot:not(.occupied)').forEach(slot => {
                slot.classList.add('highlight');
            });
        }
    }
}

function clearSelection() {
    if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
    }
    highlightValidSlots();

    const placeHint = document.getElementById('place-hint');
    if (placeHint) {
        placeHint.innerHTML = 'Choose a card <br> <span>↓</span>';
    }
}

// --- ATTACK ANIMATIONS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getCardSlot(side, index) {
    const rowId = side === 'player' ? 'player-front-row' : 'opponent-front-row';
    const row = document.getElementById(rowId);
    if (!row) return null;
    return row.querySelector(`.card-slot[data-index="${index}"]`);
}

function getCardSlotFromBackendCoord(backendCoord) {
    if (backendCoord == null) return null;
    let x, sideVal;

    if (typeof backendCoord === 'string') {
        const parts = backendCoord.split(':');
        if (parts.length !== 2) return null;
        x = parseInt(parts[0], 10);
        sideVal = parseInt(parts[1], 10);
    } else if (Array.isArray(backendCoord)) {
        x = backendCoord[0];
        sideVal = backendCoord[1];
    } else if (typeof backendCoord === 'object') {
        x = backendCoord.x !== undefined ? backendCoord.x : backendCoord.X;
        sideVal = backendCoord.side !== undefined ? backendCoord.side : backendCoord.Side;
    } else {
        return null;
    }

    if (x === undefined || sideVal === undefined || Number.isNaN(x)) return null;

    // Test harness uses 0-based indices and "player"/"opponent" labels
    if (typeof sideVal === 'string') {
        const sideStr = sideVal === 'player' ? 'player' : 'opponent';
        const index = x >= 1 && x <= 4 ? x - 1 : x;
        return getCardSlot(sideStr, index);
    }

    const sideStr = (sideVal === window.mySide) ? 'player' : 'opponent';
    return getCardSlot(sideStr, x - 1);
}

async function playAttackAnimation(attackerCoord, targetCoord) {
    const attackerSlot = getCardSlotFromBackendCoord(attackerCoord);
    if (!attackerSlot) {
        console.log("Attacker card not found on board:", attackerCoord);
        return;
    }

    const attackerCard = attackerSlot.querySelector('.board-card');
    if (!attackerCard) return;

    const isMyCard = attackerSlot.parentElement.id === 'player-front-row';
    let moveX = 0;
    let moveY = 0;

    const targetSlot = getCardSlotFromBackendCoord(targetCoord);
    if (targetSlot) {
        const attackerRect = attackerCard.getBoundingClientRect();
        const targetRect = targetSlot.getBoundingClientRect();
        moveX = targetRect.left - attackerRect.left;
        moveY = targetRect.top - attackerRect.top;
    } else {
        moveY = isMyCard ? -160 : 160;
    }

    // 1. Lift
    attackerCard.classList.add('attacking', 'lifted');
    await sleep(200);

    // 2. Fly toward target
    attackerCard.style.setProperty('--move-x', `${moveX}px`);
    attackerCard.style.setProperty('--move-y', `${moveY}px`);
    await sleep(250);

    // 3. Strike
    attackerCard.classList.remove('lifted');
    attackerCard.classList.add('striking');
    await sleep(100);

    if (targetSlot) {
        const targetCard = targetSlot.querySelector('.board-card');
        if (targetCard) {
            targetCard.style.filter = "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5) contrast(2)";
            setTimeout(() => { if (targetCard) targetCard.style.filter = ""; }, 200);
        }
    }
    await sleep(100);

    // 4. Bounce back
    attackerCard.classList.remove('striking');
    attackerCard.classList.add('lifted');
    await sleep(150);

    // 5. Return home
    attackerCard.style.setProperty('--move-x', '0px');
    attackerCard.style.setProperty('--move-y', '0px');
    await sleep(250);

    // 6. Land
    attackerCard.classList.remove('lifted');
    await sleep(200);

    attackerCard.classList.remove('attacking');
    attackerCard.style.removeProperty('--move-x');
    attackerCard.style.removeProperty('--move-y');
}

async function processAttackQueue(attacksArray) {
    console.log("Starting battle sequence...", attacksArray);

    if (!attacksArray?.length) return;

    window.isBattleAnimating = true;

    for (const actionObj of attacksArray) {
        if (actionObj.Action === "ATTACK") {
            await playAttackAnimation(actionObj.AttackerCoord, actionObj.TargetCoord);
        } 
        // --- НОВИЙ БЛОК: ОНОВЛЕННЯ ХП КАРТКИ ПРИ УДАРІ ---
        else if (actionObj.Action === "CARD_HP_UPDATE") {
            const targetSlot = getCardSlotFromBackendCoord(actionObj.TargetCoord);
            if (targetSlot) {
                const targetCard = targetSlot.querySelector('.board-card');
                if (targetCard) {
                    let hpEl = targetCard.querySelector('.card-hp');
                    
                    // Якщо елемента .card-hp ще немає на картці, створюємо його на льоту
                    if (!hpEl) {
                        hpEl = document.createElement('div');
                        hpEl.classList.add('card-stat', 'card-hp');
                        targetCard.appendChild(hpEl);
                    }
                    
                    // Оновлюємо значення ХП новими даними з бекенду
                    hpEl.textContent = actionObj.NewHP;
                    
                    // Запускаємо твою анімацію спалаху
                    hpEl.classList.add('flash-damage');
                    setTimeout(() => hpEl.classList.remove('flash-damage'), 300);
                }
            }
            await sleep(150);
        }
        else if (actionObj.Action === "CARD_DIE") {
            const deadSlot = getCardSlotFromBackendCoord(actionObj.TargetCoord || actionObj.Coord);
            if (deadSlot) {
                const deadCard = deadSlot.querySelector('.board-card');
                if (deadCard) {
                    deadCard.style.transition = "opacity 0.25s, transform 0.25s";
                    deadCard.style.opacity = "0";
                    deadCard.style.transform = "scale(0.5)";
                    setTimeout(() => {
                        if (deadCard?.parentElement) deadCard.remove();
                        deadSlot.classList.remove('occupied');
                    }, 250);
                }
            }
        } else if (actionObj.Action === "PLAYER_HP_UPDATE") {
            const containerId = (actionObj.Side === window.mySide) ? 'left-hp' : 'right-hp';
            updateHP(containerId, actionObj.NewHP);
            await sleep(150);

            if (actionObj.NewHP <= 0) {
                await sleep(500);
                if (actionObj.Side === window.mySide) {
                    if (typeof window.showGameOver === 'function') window.showGameOver(false);
                } else {
                    if (typeof window.showGameOver === 'function') window.showGameOver(true);
                }
            }
        }
    }

    window.isBattleAnimating = false;
    if (window.pendingBoardSync) {
        syncBoard(window.pendingBoardSync);
        window.pendingBoardSync = null;
    }
}

// --- TURN HIGHLIGHT / END TURN BUTTON---
function updateTurnHighlight() {
    const playerNameEl = document.getElementById('playerName');
    const opponentNameEl = document.getElementById('opponentName');
    const endTurnBtn = document.getElementById('end-turn-btn');
    
    const freeDeck = document.getElementById('free-deck');
    const randomDeck = document.getElementById('random-deck');
    
    // Елементи підказок
    const drawHint = document.getElementById('draw-hint');
    const placeHint = document.getElementById('place-hint');
    
    if (!playerNameEl || !opponentNameEl || !window.currentState) return;

    const isP1Turn = window.currentState.startsWith("P1");
    const isP2Turn = window.currentState.startsWith("P2");
    const isMyTurn = (window.mySide === 1 && isP1Turn) || (window.mySide === -1 && isP2Turn);

    if (isMyTurn) {
        playerNameEl.classList.add('active-turn');
        opponentNameEl.classList.remove('active-turn');
    } else {
        playerNameEl.classList.remove('active-turn');
        opponentNameEl.classList.add('active-turn');
    }

    const isMyDrawPhase = (window.mySide === 1 && window.currentState === "P1_DRAW") ||
                          (window.mySide === -1 && window.currentState === "P2_DRAW");
    
    const isMyPlacePhase = (window.mySide === 1 && window.currentState === "P1_PLACE") ||
                           (window.mySide === -1 && window.currentState === "P2_PLACE");

    // Управління колодами та підказкою DRAW
    if (freeDeck && randomDeck) {
        if (isMyDrawPhase) {
            freeDeck.classList.remove('disabled');
            randomDeck.classList.remove('disabled');
            if (drawHint) drawHint.classList.add('visible');
        } else {
            freeDeck.classList.add('disabled');
            randomDeck.classList.add('disabled');
            if (drawHint) drawHint.classList.remove('visible');
        }
    }

    // Управління підказкою PLACE
    if (placeHint) {
        if (isMyPlacePhase) {
            placeHint.classList.add('visible');
            // Якщо хід тільки почався і карта ще не вибрана — скидаємо текст
            if (!selectedCard) {
                placeHint.innerHTML = 'Choose a card <br> <span>↓</span>';
            }
        } else {
            placeHint.classList.remove('visible');
        }
    }

    if (endTurnBtn) {
        if (isMyPlacePhase) {
            endTurnBtn.style.display = 'block';
        } else {
            endTurnBtn.style.display = 'none';
        }
    }
}

// --- GAME OVER ---

window.showGameOver = function(isWinner) {
    const overlay = document.getElementById('game-over-overlay');
    const title = document.getElementById('gameOverTitle');
    
    if (!overlay || !title) return;

    if (isWinner) {
        title.textContent = "VICTORY!";
        title.className = "game-over-title win-text";
    } else {
        title.textContent = "DEFEAT...";
        title.className = "game-over-title lose-text";
    }
    
    overlay.classList.add('visible');
};

const mainMenuBtn = document.getElementById('mainMenuBtn');
if (mainMenuBtn) {
    mainMenuBtn.onclick = () => {
        window.location.href = '/';
    };
}

async function loadUsersData() {
    const playerAvatar = document.querySelector(".player-avatar");
    const opponentAvatar = document.querySelector(".opponent-avatar");

    const defaultPlayerUrl = "https://i.pinimg.com/736x/16/2a/9c/162a9c07ec2e669d6de08a37a40bc282.jpg"; 
    const defaultOpponentUrl = "https://i.pinimg.com/736x/16/2a/9c/162a9c07ec2e669d6de08a37a40bc282.jpg";

    try {
        const result = await getPlayers(window.currentRoomID);
        
        const myAvatar = (result && result.me && result.me.pfp_url) ? result.me.pfp_url : defaultPlayerUrl;
        const enemyAvatar = (result && result.opponent && result.opponent.pfp_url) ? result.opponent.pfp_url : defaultOpponentUrl;

        playerAvatar.style.backgroundImage = `url("${myAvatar}")`;
        opponentAvatar.style.backgroundImage = `url("${enemyAvatar}")`;
        
    } catch (error) {
        console.error("Cannot load player avatars", error);
        playerAvatar.style.backgroundImage = `url("${defaultPlayerUrl}")`;
        opponentAvatar.style.backgroundImage = `url("${defaultOpponentUrl}")`;
    }
}

// --- TIMER ---

const TIME_BATTLE = 5000;
const TIME_DRAW = 15000;
const TIME_PLACE = 60000;

let localTimerInterval = null;

window.startLocalTimer = function(stateName) {
    const timerEl = document.getElementById('game-timer');
    if (!timerEl || !stateName) return;

    // --- 1. ПЕРЕВІРКА НА ФАЗУ БОЮ ---
    if (stateName.includes("BATTLE")) {
        timerEl.style.display = 'none';
        
        if (localTimerInterval) {
            clearInterval(localTimerInterval);
            localTimerInterval = null;
        }
        return;
    } else {
        timerEl.style.display = 'block';
    }

    let durationMs = 0;

    if (stateName.includes("DRAW")) {
        durationMs = TIME_DRAW;
    } else if (stateName.includes("PLACE")) {
        durationMs = TIME_PLACE;
    }

    if (localTimerInterval) {
        clearInterval(localTimerInterval);
        localTimerInterval = null;
    }

    if (durationMs <= 0) {
        timerEl.textContent = '';
        return;
    }

    const endTime = Date.now() + durationMs;

    const tick = () => {
        const remainingMs = endTime - Date.now();
        
        if (remainingMs <= 0) {
            timerEl.textContent = "0";
            timerEl.classList.remove('hurry');
            clearInterval(localTimerInterval);
            return;
        }

        const sec = Math.ceil(remainingMs / 1000);
        timerEl.textContent = sec;

        if (sec <= 10) {
            timerEl.classList.add('hurry');
        } else {
            timerEl.classList.remove('hurry');
        }
    };

    tick();
    localTimerInterval = setInterval(tick, 100);
};

// --- INIT ---
setupCardInteractions();
setupDeckInteractions();
setupTurnInteractions();

// Expose handlers for websocket.js
window.processAttackQueue = processAttackQueue;
window.updateEnergy = updateEnergy;
window.updateHand = updateHand;
window.syncBoard = syncBoard;
window.highlightValidSlots = highlightValidSlots;
