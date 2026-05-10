const cardCatalog = [
  new Card(1, "Sacrificial Pawn", 0, 1, 0, [CardEffect.SACRIFICE_BASE]), // Can be picked instead of drawing a random card
  new Card(2, "Energy Core", 1, 2, 0, [CardEffect.SACRIFICE_ENERGY]),  // Gives 3 energy on sacrifice
  new Card(3, "Basic Fighter", 1, 1, 2, []),
  new Card(4, "Sturdy Defender", 1, 4, 1, []),
  new Card(5, "Wall", 1, 6, 0, []),
  new Card(6, "Flanker", 1, 1, 1, [CardEffect.LEFT_RIGHT_ATTACK]),       // Attacks right and left tiles instead of front
  new Card(7, "Commander", 1, 1, 1, [CardEffect.BUFF_DMG]),              // Gives adjacent units +1 damage on placement
  new Card(8, "Bruiser", 2, 2, 3, []),
  new Card(9, "Tough Brawler", 2, 3, 2, []),
  new Card(10, "Swarm Mother", 2, 2, 1, [CardEffect.SPAWNER]),           // Spawns 1hp 1dmg units in adjacent tiles if possible
  new Card(11, "Assassin", 2, 2, 1, [CardEffect.INSTAKILL]),             // Instantly kills attacked card, deals 1 dmg to enemy player
  new Card(12, "Healer", 2, 6, 1, [CardEffect.BUFF_HP]),                 // Adds +2 hp to adjacent cards
  new Card(13, "Flying Assaulter", 2, 2, 2, [CardEffect.FLY]),           // Ignores cards, targets enemy player directly
  new Card(14, "Little Flyer", 1, 1, 1, [CardEffect.FLY]),               // Ignores cards, targets enemy player directly
  new Card(15, "Sturdy Flyer", 2, 4, 1, [CardEffect.FLY]),               // Ignores cards, targets enemy player directly
  new Card(16, "Heavy Hitter", 3, 6, 4, []),
  new Card(17, "Double Striker", 3, 5, 2, [CardEffect.DOUBLE_ATTACK]),   // Attacks twice in a row
  new Card(18, "Cleaver", 3, 2, 2, [CardEffect.THREE_TILE_ATTACK]),      // Attacks front, left, and right enemy tiles
  new Card(19, "General", 3, 4, 1, [CardEffect.BUFF_DMG_STRONG]),        // Adds +2 damage to adjacent cards (assuming +2 for "strong")
  new Card(20, "Boss", 4, 8, 5, []),
  new Card(21, "Zero Cost Hitter", 0, 1, 1, [])
];