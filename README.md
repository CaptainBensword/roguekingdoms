# Talon — Rogue Kingdoms

The official website for **Rogue Kingdoms**, a pirate-fantasy territory-control strategy board game published by Talon.

## Website sections

- **Home:** game introduction, kingdom colors, board preview, and links to the main guides.
- **The Game:** objective, turn flow, kingdoms, and core systems.
- **Rulebook:** a searchable fifteen-section first-edition rules reference.
- **Collections:** clear separation between the blue XP Reward deck and the red Skill Card system.
- **XP Cards:** all sixteen physical XP reward cards, with value filters, ID search, card flipping, and a practice draw pile.
- **Skill Cards:** hand limit, reward rules, ability categories, and development status. The future physical cards are not represented as finished.
- **Armies:** Swordsmen, Archers, and Giants with the specified shared health pools.
- **Monsters:** Reef Beast, Iron Troll, and Storm Drake entries with clearly marked playtest HP.
- **Map:** selectable 19-hex Shattered Isles guide.
- **Learn to Play:** a ten-step interactive quick start and a D10 practice roll.

## Rules represented on the site

- 2–4 players; approximately 30–45 minutes.
- Two orders per turn.
- D10 normal attacks: one roll, applied as damage.
- Army group shared HP: Swordsmen 40, Archers 45, Giants 20.
- Outpost captures and defeated rival army groups reward two Skill Cards.
- Monster defeats reward one XP card.
- XP deck: four each of 10, 20, 35, and 50 XP.
- End after the XP deck runs out or eight complete rounds; finish the current round.
- Final score: XP + 10 per controlled outpost + 2 per controlled ordinary hex + 10 for a surviving captain.

## Playtest decisions

The game brief did not define the number of army groups in each kingdom's supply or the monsters' starting HP. The site uses a clearly labeled playtest recommendation of two Swordsmen groups, two Archer groups, and one Giant group per kingdom. Proposed monster HP is Reef Beast 30, Iron Troll 45, and Storm Drake 60. These values should be reviewed after physical games.

The outpost reward is limited to each player's first capture of each specific outpost during a game, to prevent repeated capture farming. The base rules do not include player elimination.

## Artwork and implementation

- The crowned-skull emblem is a reusable inline SVG symbol in the page markup, with a standalone SVG asset for the favicon.
- The XP card faces use individual crops prepared from the supplied card sheet.
- XP backs use the crowned-skull emblem in a blue card design.
- The Skill Card deck is deliberately presented as in development; no unfinished physical card designs are shown as complete.
- All pages are static HTML, CSS, and JavaScript and are compatible with GitHub Pages.

## Publish

In repository Settings → Pages, publish from the `main` branch and `/ (root)`. Keep the HTML pages, `styles.css`, `script.js`, and `assets/` at the repository root.
