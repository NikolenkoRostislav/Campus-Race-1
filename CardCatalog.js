const cardCatalog = new Map([
  [1, new Card("Sacrificial Pawn", 0, 1, 0, "assets/cards/card1.png", [CardEffect.SACRIFICE_BASE])], // Can be picked instead of drawing a random card
  [2, new Card("Energy Core", 1, 2, 0, "assets/cards/card2.png", [CardEffect.SACRIFICE_ENERGY])],  // Gives 3 energy on sacrifice
  [3, new Card("Basic Fighter", 1, 1, 2, "assets/cards/card3.png", [])],
  [4, new Card("Sturdy Defender", 1, 4, 1, "assets/cards/card4.png", [])],
  [5, new Card("Wall", 1, 6, 0, "assets/cards/card5.png", [])],
  [6, new Card("Flanker", 1, 1, 1, "assets/cards/card6.png", [CardEffect.LEFT_RIGHT_ATTACK])],       // Attacks right and left tiles instead of front
  [7, new Card("Commander", 1, 1, 1, "assets/cards/card7.png", [CardEffect.BUFF_DMG])],              // Gives adjacent units +1 damage on placement
  [8, new Card("Bruiser", 2, 2, 3, "assets/cards/card8.png", [])],
  [9, new Card("Tough Brawler", 2, 3, 2, "assets/cards/card9.png", [])],
  [10, new Card("Swarm Mother", 2, 2, 1, "assets/cards/card10.png", [CardEffect.SPAWNER])],           // Spawns 1hp 1dmg units in adjacent tiles if possible
  [11, new Card("Assassin", 2, 2, 1, "assets/cards/card11.png", [CardEffect.INSTAKILL])],             // Instantly kills attacked card, deals 1 dmg to enemy player
  [12, new Card("Healer", 2, 6, 1, "assets/cards/card12.png", [CardEffect.BUFF_HP])],                 // Adds +2 hp to adjacent cards
  [13, new Card("Flying Assaulter", 2, 2, 2, "assets/cards/card13.png", [CardEffect.FLY])],           // Ignores cards, targets enemy player directly
  [14, new Card("Little Flyer", 1, 1, 1, "assets/cards/card14.png", [CardEffect.FLY])],               // Ignores cards, targets enemy player directly
  [15, new Card("Sturdy Flyer", 2, 4, 1, "assets/cards/card15.png", [CardEffect.FLY])],               // Ignores cards, targets enemy player directly
  [16, new Card("Heavy Hitter", 3, 6, 4, "assets/cards/card16.png", [])],
  [17, new Card("Double Striker", 3, 5, 2, "assets/cards/card17.png", [CardEffect.DOUBLE_ATTACK])],   // Attacks twice in a row
  [18, new Card("Cleaver", 3, 2, 2, "assets/cards/card18.png", [CardEffect.THREE_TILE_ATTACK])],      // Attacks front, left, and right enemy tiles
  [19, new Card("General", 3, 4, 1, "assets/cards/card19.png", [CardEffect.BUFF_DMG_STRONG])],        // Adds +2 damage to adjacent cards (assuming +2 for "strong")
  [20, new Card("Boss", 4, 8, 5, "assets/cards/card20.png", [])],
  [21, new Card("Zero Cost Hitter", 0, 1, 1, "assets/cards/card21.png", [])]
]);