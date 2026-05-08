# Flow 
1. User registers  
2. user logs in  
3. either create new room and share room id with a friend or join one by room id  
4. start the game after an intro animation (random player gets 1st turn)
5. gameplay
6. either user wins by getting the oponent to 0hp and we show victory anim
7. players are sent back to main menu

# Database
we only use the db to store user accounts
(avatar_url, login (unique) and password_hash), don't see a reason to make it require an email, a user may create any number of unique accounts
maybe we'll store user stats (win rate and total games played should be pretty ez to add)

# Game State
we expect a decently low maximum amount of concurrent players, so we use a dict to store game state per room id
game state is an object that stores: **player 1 info**, **player 2 info**, **gameboard info** (dict with coords as keys and card data as values), **game cycle phase** (int), **turn count**(int)

after a game ends (either by one players victory or the game reaches turn 100)

## Game cycle
The game loops through 6 phases (so it goes 1-2-3-4-5-6-1-2-3-...)
1. player 1 picks a card (either a random one or a guaranteed free energy one) (this phase has a time limit, on finish the phase automatically ends and the player automatically grabs the free energy card if they didnt choose anything)
2. player 1 plays their cards on the table (this phase has a time limit, on finish the phase automatically ends)
3. player 1's cards placed on the table attack (this phase runs automatically and requires no player input)
4. player 2 picks a card (either a random one or a guaranteed free energy one) (this phase has a time limit, on finish the phase automatically ends and the player automatically grabs the free energy card if they didnt choose anything)
5. player 2 plays their cards on the table (this phase has a time limit, on finish the phase automatically ends)
6. player 2's cards placed on the table attack (this phase runs automatically and requires no player input)

So 
phases 1–2: only player 1 input allowed
phases 4–5: only player 2 input allowed
phases 3–6: engine only

## Player info
- user id
- player deck (array of card types (enums))
- hp

## Coords for gameboard info
a coord is two ints, one for x and one for side (-1 or 1): 

```js
| (1, 1) | (2, 1) | (3, 1) | (4, 1) |
| (1,-1) | (2,-1) | (3,-1) | (4,-1) |
```

## Card data
an empty card data means the slot is empty
card data stores the following: 
- current card hp
- current card damage
- card type (enum), card type determines the card class used 

a card object (instance of card class) must have the following fields:
- starter hp
- starter damage
- energy on sacrifice (usually 1 but some cards may grant more)
- price (how much energy is needed to spawn this card)
- name
- image source
- effects (array of enums), effects impact how the engine does certain actions (for example a card may do two attacks in a row if it has the berserker effect or takes less damage from all attacks if it has the defended effect)

**The cards only store data, they dont have their own methods for attacking, taking damage etc, that's handled by the engine**

# The engine
The engine is the brain behind phases 3 and 6 of the game loop, it goes from x coords 1 to 4 and triggers each cards effects, a card can attack on its turn, it might take damage and die on the enemy turn. If a card attacks an empty space, the damage is dealt to the oponent, otherwise it's dealt to the attacked card, damage higher than the attacked cards hp doesnt matter (we dont care about overflow damage)  

The engine also handles allowing cards to be placed or sacrificed