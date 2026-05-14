const { CardType, Card } = require("./card.js");

const cardCatalog = new Map([
  [1, new Card(0, 1, 0)],                               // Can be picked instead of drawing a random card
  [2, new Card(1, 2, 0, CardType.SACRIFICE_BIG)],       // Gives 3 energy on sacrifice
  [3, new Card(1, 1, 2)],
  [4, new Card(1, 4, 1)],
  [5, new Card(1, 6, 0)],
  [6, new Card(1, 1, 1, CardType.LEFT_RIGHT_ATTACK)],   // Attacks right and left tiles instead of front
  [7, new Card(1, 1, 1, CardType.BUFF_DMG)],            // Gives adjacent units +1 damage on placement
  [8, new Card(2, 2, 3)],
  [9, new Card(2, 3, 2)],
  [10, new Card(2, 2, 1, CardType.SPAWNER)],            // Spawns 1hp 1dmg units in adjacent tiles if possible
  [101, new Card(0, 1, 1)],                             // Spawned by swarm mothers effect, can't be found in deck
  [11, new Card(2, 2, 1, CardType.INSTAKILL)],          // Instantly kills attacked card, deals 1 dmg to enemy player
  [12, new Card(2, 6, 1, CardType.BUFF_HP)],            // Adds +2 hp to adjacent cards
  [13, new Card(2, 2, 2, CardType.FLY)],                // Ignores cards, targets enemy player directly
  [14, new Card(1, 1, 1, CardType.FLY)],                // Ignores cards, targets enemy player directly
  [15, new Card(2, 4, 1, CardType.FLY)],                // Ignores cards, targets enemy player directly
  [16, new Card(3, 6, 4)],
  [17, new Card(3, 5, 2, CardType.DOUBLE_ATTACK)],      // Attacks twice in a row
  [18, new Card(3, 2, 2, CardType.THREE_TILE_ATTACK)],  // Attacks front, left, and right enemy tiles
  [19, new Card(3, 4, 1, CardType.BUFF_DMG_STRONG)],    // Adds +2 damage to adjacent cards (assuming +2 for "strong")
  [20, new Card(4, 8, 5)],
  [21, new Card(0, 1, 1)]
]);

module.exports = cardCatalog;
