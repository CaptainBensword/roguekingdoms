(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  // Mobile navigation
  const menuButton = $("#menu-toggle");
  const nav = $("#primary-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Gentle page entrance; content remains visible if the API is unavailable.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          current.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // The blue XP collection: four copies of each physical denomination.
  const xpValues = [10, 20, 35, 50];
  const xpCards = xpValues.flatMap(value =>
    Array.from({ length: 4 }, (_, copy) => ({
      value,
      copy: copy + 1,
      id: "XP-" + value + "-" + String(copy + 1).padStart(2, "0")
    }))
  );
  const xpGrid = $("#xp-card-grid");
  const xpSearch = $("#xp-search");
  const xpCount = $("#xp-count");
  const xpEmpty = $("#xp-empty");
  let xpFilter = "all";

  const backMarkup = `<span class="xp-face xp-back"><svg class="back-emblem" viewBox="0 0 256 256" aria-hidden="true"><use href="#rogue-kingdoms-emblem"></use></svg></span>`;

  function xpCardMarkup(card) {
    const label = card.value + " XP reward card " + card.id;
    return `<button class="xp-card" type="button" data-xp-value="${card.value}" data-xp-id="${card.id}" aria-label="${label}. Flip to view the back.">
      <span class="xp-card-inner">
        <span class="xp-face"><img src="assets/xp-${card.value}.webp" alt="${card.value} XP reward card" loading="lazy"></span>
        ${backMarkup}
      </span>
      <span class="xp-card-id"><span>${card.id}</span><span>Copy ${card.copy} / 4</span></span>
    </button>`;
  }

  function renderXpCards() {
    if (!xpGrid) return;
    const query = xpSearch ? xpSearch.value.trim().toLowerCase() : "";
    const visible = xpCards.filter(card => {
      const filterMatch = xpFilter === "all" || String(card.value) === xpFilter;
      const searchMatch = !query || (card.id + " " + card.value + " xp").toLowerCase().includes(query);
      return filterMatch && searchMatch;
    });
    xpGrid.innerHTML = visible.map(xpCardMarkup).join("");
    xpGrid.hidden = visible.length === 0;
    if (xpEmpty) xpEmpty.hidden = visible.length !== 0;
    if (xpCount) xpCount.textContent = visible.length === 16 ? "Showing all 16 cards" : "Showing " + visible.length + " of 16 cards";
  }

  $$("[data-xp-filter]").forEach(button => {
    button.addEventListener("click", () => {
      xpFilter = button.dataset.xpFilter;
      $$("[data-xp-filter]").forEach(option => {
        const active = option === button;
        option.classList.toggle("active", active);
        option.setAttribute("aria-pressed", String(active));
      });
      renderXpCards();
    });
  });
  if (xpSearch) xpSearch.addEventListener("input", renderXpCards);
  if (xpGrid) {
    xpGrid.addEventListener("click", event => {
      const card = event.target.closest(".xp-card");
      if (!card) return;
      const flipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-label", flipped
        ? card.dataset.xpId + " reverse side. Flip to see the XP value."
        : card.dataset.xpId + " front. Flip to view the back.");
    });
  }
  renderXpCards();

  // Practice deck simulator. It uses a fresh, shuffled copy and never changes the physical deck.
  const drawButton = $("#draw-xp");
  const resetButton = $("#reset-xp");
  const simCard = $("#sim-card");
  const simImage = $("#sim-card-image");
  const simValue = $("#sim-card-value");
  const simLabel = $("#sim-card-label");
  const simResult = $("#sim-result");
  const remainingText = $("#xp-remaining");
  const remainingFill = $("#xp-progress-fill");
  let practiceDeck = [];

  function shuffledXpDeck() {
    const deck = xpCards.map(card => ({ ...card }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function updatePracticeCount() {
    if (remainingText) remainingText.textContent = practiceDeck.length + " card" + (practiceDeck.length === 1 ? "" : "s") + " remaining";
    if (remainingFill) remainingFill.style.width = (practiceDeck.length / 16 * 100) + "%";
    if (drawButton) {
      drawButton.disabled = practiceDeck.length === 0;
      if (practiceDeck.length === 0) drawButton.textContent = "Deck empty";
    }
  }

  function resetPracticeDeck() {
    practiceDeck = shuffledXpDeck();
    if (simCard) simCard.classList.remove("revealed");
    if (simImage) {
      simImage.hidden = true;
      simImage.removeAttribute("src");
    }
    if (simValue) {
      simValue.hidden = false;
      simValue.textContent = "?";
    }
    if (simLabel) {
      simLabel.hidden = false;
      simLabel.textContent = "READY TO DRAW";
    }
    if (simResult) simResult.textContent = "The next reward is face down.";
    if (drawButton) {
      drawButton.disabled = false;
      drawButton.innerHTML = "Draw a reward <span>✦</span>";
    }
    updatePracticeCount();
  }

  function drawPracticeCard() {
    if (!practiceDeck.length) return;
    const card = practiceDeck.pop();
    if (simImage) {
      simImage.src = "assets/xp-" + card.value + ".webp";
      simImage.alt = card.value + " XP reward card";
      simImage.hidden = false;
    }
    if (simValue) simValue.hidden = true;
    if (simLabel) simLabel.hidden = true;
    if (simCard) {
      simCard.classList.remove("revealed");
      void simCard.offsetWidth;
      simCard.classList.add("revealed");
      simCard.setAttribute("aria-label", card.value + " XP revealed. Draw the next reward.");
    }
    if (simResult) simResult.textContent = "You drew " + card.value + " XP · " + card.id;
    if (drawButton) {
      drawButton.disabled = practiceDeck.length === 0;
      if (practiceDeck.length === 0) drawButton.textContent = "Deck empty";
    }
    updatePracticeCount();
  }
  if (drawButton) drawButton.addEventListener("click", drawPracticeCard);
  if (simCard) simCard.addEventListener("click", drawPracticeCard);
  if (resetButton) resetButton.addEventListener("click", resetPracticeDeck);
  if (drawButton || simCard) resetPracticeDeck();

  // Clickable Shattered Isles map.
  const mapData = {
    "crimson-port": ["Crimson Home Port", "Home port", "The starting port for the Crimson (Red) Kingdom.", "Your captain begins here. Muster an available army group here when the hex is empty. Rival armies cannot occupy this port.", "⚓"],
    "north-isle": ["North Isle", "Ordinary hex", "An open neutral space on the northern edge.", "An army group occupying this hex at the end controls it for 2 points.", "✦"],
    "blue-port": ["Blue Home Port", "Home port", "The starting port for the Blue Kingdom.", "Your captain begins here. Muster available groups here when the hex is empty. Rival armies cannot occupy this port.", "⚓"],
    "west-channel": ["West Channel", "Ordinary hex", "A route between the outer waters and the central isles.", "Move through this space when it is adjacent and empty. Control it at the end for 2 points.", "✧"],
    "northwatch": ["Northwatch Outpost", "Outpost", "A neutral lookout with a clear view of the north passage.", "Occupy the hex and spend a Claim order to capture it. The first capture by each player earns 2 Skill Cards. Control is worth 10 points at the end.", "⌖"],
    "windward": ["Windward Reach", "Ordinary hex", "An open stretch of the chain between both northern ports.", "An army group occupying this hex at the end controls it for 2 points.", "✧"],
    "eastwatch": ["Eastwatch Outpost", "Outpost", "A neutral lookout on the eastern route.", "Occupy the hex and spend a Claim order to capture it. The first capture by each player earns 2 Skill Cards. Control is worth 10 points at the end.", "⌖"],
    "reef-edge": ["Reef Edge", "Ordinary hex", "Open ground beside the western monster lair.", "An army group occupying this hex at the end controls it for 2 points.", "✦"],
    "reef-lair": ["Reef Beast Lair", "Monster lair", "The Reef Beast nests among broken reefs. Proposed starting HP: 30.", "Challenge it from an adjacent hex. It counterattacks with a D10 if it survives. Defeat it to draw one XP card.", "♜"],
    "iron-lair": ["Iron Troll Lair", "Monster lair", "The Iron Troll guards the central caves. Proposed starting HP: 45.", "Challenge it from an adjacent hex. It counterattacks with a D10 if it survives. Defeat it to draw one XP card.", "♜"],
    "drake-lair": ["Storm Drake Lair", "Monster lair", "The Storm Drake rules the high ridge. Proposed starting HP: 60.", "Challenge it from an adjacent hex. It counterattacks with a D10 if it survives. Defeat it to draw one XP card.", "♜"],
    "outer-east": ["Outer East", "Ordinary hex", "An open space beside the eastern lair.", "An army group occupying this hex at the end controls it for 2 points.", "✧"],
    "southwatch": ["Southwatch Outpost", "Outpost", "A neutral lookout guarding the southern crossing.", "Occupy the hex and spend a Claim order to capture it. The first capture by each player earns 2 Skill Cards. Control is worth 10 points at the end.", "⌖"],
    "shoal": ["Shoal Crossing", "Ordinary hex", "A shallow passage through the southern waters.", "An army group occupying this hex at the end controls it for 2 points.", "✧"],
    "south-isle": ["South Isle", "Ordinary hex", "Open ground between the southern outposts.", "An army group occupying this hex at the end controls it for 2 points.", "✦"],
    "goldwatch": ["Goldwatch Outpost", "Outpost", "A neutral lookout on the route to the Gold home port.", "Occupy the hex and spend a Claim order to capture it. The first capture by each player earns 2 Skill Cards. Control is worth 10 points at the end.", "⌖"],
    "emerald-port": ["Emerald Home Port", "Home port", "The starting port for the Emerald (Green) Kingdom.", "Your captain begins here. Muster available groups here when the hex is empty. Rival armies cannot occupy this port.", "⚓"],
    "far-isle": ["Far Isle", "Ordinary hex", "A neutral space on the southern edge of the chain.", "An army group occupying this hex at the end controls it for 2 points.", "✦"],
    "gold-port": ["Gold Home Port", "Home port", "The starting port for the Gold (Yellow) Kingdom.", "Your captain begins here. Muster available groups here when the hex is empty. Rival armies cannot occupy this port.", "⚓"]
  };
  const mapTiles = $$(".map-hex");
  const detailTitle = $("#detail-title");
  const detailType = $("#detail-type");
  const detailDescription = $("#detail-description");
  const detailRule = $("#detail-rule");
  const detailIcon = $("#detail-icon");

  function selectMapTile(tile) {
    const data = mapData[tile.dataset.location];
    if (!data) return;
    mapTiles.forEach(item => item.classList.toggle("selected", item === tile));
    if (detailTitle) detailTitle.textContent = data[0];
    if (detailType) detailType.textContent = data[1].toUpperCase();
    if (detailDescription) detailDescription.textContent = data[2];
    if (detailRule) detailRule.textContent = data[3];
    if (detailIcon) detailIcon.textContent = data[4];
  }
  mapTiles.forEach(tile => {
    tile.addEventListener("click", () => selectMapTile(tile));
    tile.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectMapTile(tile);
      }
    });
  });

  // Search within the rulebook. Section links disappear when their section has no match.
  const ruleSearch = $("#rule-search");
  if (ruleSearch) {
    const ruleSections = $$("[data-rule-section]");
    const ruleLinks = $$(".rules-sidebar a");
    ruleSearch.addEventListener("input", () => {
      const query = ruleSearch.value.trim().toLowerCase();
      ruleSections.forEach(section => {
        section.hidden = query && !section.textContent.toLowerCase().includes(query);
      });
      ruleLinks.forEach(link => {
        const target = document.getElementById(link.getAttribute("href").slice(1));
        link.hidden = !!query && (!target || target.hidden);
      });
    });
  }

  // Guided ten-step introduction.
  const tutorialSteps = [
    ["Set up the board","Place the 19 hexes in the Shattered Isles layout. Put the three monsters at their lairs and leave all outposts neutral.","There are four home ports, four outposts, three lairs, and eight ordinary spaces.","⚓  ✦  ⚓<br>⌖  ♜  ⌖"],
    ["Choose a kingdom","Choose Crimson, Blue, Gold, or Emerald. Take that kingdom's captain, army pieces, and markers.","Every kingdom uses the same rules. Your color identifies your pieces and controlled outposts.","🔴  🔵  🟡  🟢"],
    ["Place your armies","Place the captain at its home port. For the starter setup, place a Swordsmen group on the port and an Archer group on an adjacent empty hex.","One army group occupies one hex. No two army groups can share a hex.","⚔  ➶  ♜"],
    ["Start your turn","Draw Skill Cards until you hold seven. Then choose two orders and resolve them one at a time.","Your orders are March, Attack, Muster, or Claim. Skill Cards can be played when their timing allows.","▰  ▰  ▰  ▰  ▰  ▰  ▰<br>ORDER 1  →  ORDER 2"],
    ["March across the map","A March order moves up to two different groups one connected hex each.","Groups cannot move twice in a turn, move through occupied spaces, or enter an enemy-held hex before it is challenged.","⬡  →  ⬡  →  ⬡"],
    ["Attack an enemy","Choose one eligible group and one adjacent rival group. Roll a D10 and apply its result as damage to the target's shared HP.","One normal attack is one damage roll. A group normally attacks once per turn.","D10  →  DAMAGE"],
    ["Challenge a monster","Attack a monster from an adjacent hex. Roll one D10 for damage. If it survives, it rolls one D10 back against your attacking group.","Monsters stay at their lairs. Defeat one to earn an XP reward.","⚔  ♜"],
    ["Collect XP","When a monster reaches zero HP, draw the top card from the blue XP deck. Reveal it and keep it with your collection.","The printed XP value counts in your final score. The monster returns at full HP at the start of the next round.","🎴  +  XP"],
    ["Claim an outpost","Occupy an outpost and use a Claim order. Place your banner and draw two Skill Cards if you are eligible for that outpost's reward.","Each outpost is worth ten points at the end. The first capture by each player earns the two-card reward.","⚑  +  ▰ ▰"],
    ["Finish and score","The game ends when the XP deck runs out or after eight complete rounds. Finish the current round, then add all points.","XP + 10 per controlled outpost + 2 per ordinary hex + 10 for a surviving captain. Highest score wins.","XP + TERRITORY + OUTPOSTS"]
  ];
  const progress = $("#tutorial-progress");
  const tutorialTitle = $("#tutorial-title");
  const tutorialCopy = $("#tutorial-copy");
  const tutorialTip = $("#tutorial-tip");
  const tutorialLabel = $("#tutorial-label");
  const tutorialVisual = $("#tutorial-visual");
  const tutorialCounter = $("#tutorial-counter");
  const tutorialBack = $("#tutorial-back");
  const tutorialNext = $("#tutorial-next");
  let tutorialIndex = 0;

  function renderTutorial() {
    if (!progress || !tutorialTitle) return;
    const step = tutorialSteps[tutorialIndex];
    progress.innerHTML = tutorialSteps.map((item, index) =>
      `<button type="button" class="${index === tutorialIndex ? "active" : ""}" data-tutorial-step="${index}" aria-current="${index === tutorialIndex ? "step" : "false"}"><span>${String(index + 1).padStart(2, "0")}</span>${item[0]}</button>`
    ).join("");
    $$("[data-tutorial-step]", progress).forEach(button => {
      button.addEventListener("click", () => {
        tutorialIndex = Number(button.dataset.tutorialStep);
        renderTutorial();
      });
    });
    tutorialTitle.textContent = step[0];
    tutorialCopy.textContent = step[1];
    tutorialTip.textContent = step[2];
    tutorialLabel.textContent = "STEP " + String(tutorialIndex + 1).padStart(2, "0");
    tutorialCounter.textContent = "STEP " + (tutorialIndex + 1) + " OF " + tutorialSteps.length;
    tutorialVisual.innerHTML = `<div class="tutorial-diagram">${step[3]}</div>`;
    tutorialBack.disabled = tutorialIndex === 0;
    tutorialNext.textContent = tutorialIndex === tutorialSteps.length - 1 ? "Start again ↻" : "Next step →";
  }
  if (progress) renderTutorial();
  if (tutorialBack) tutorialBack.addEventListener("click", () => {
    tutorialIndex = Math.max(0, tutorialIndex - 1);
    renderTutorial();
  });
  if (tutorialNext) tutorialNext.addEventListener("click", () => {
    tutorialIndex = tutorialIndex === tutorialSteps.length - 1 ? 0 : tutorialIndex + 1;
    renderTutorial();
  });

  // Dice roll used by the rulebook and quick-start guide.
  function bindDice(buttonId, resultId, noteId) {
    const button = $("#" + buttonId);
    const result = $("#" + resultId);
    const note = $("#" + noteId);
    if (!button || !result) return;
    button.addEventListener("click", () => {
      const roll = Math.floor(Math.random() * 10) + 1;
      result.textContent = roll;
      if (note) note.textContent = "That roll deals " + roll + " damage before other effects.";
    });
  }
  bindDice("roll-d10", "dice-result", "dice-note");
  bindDice("learn-roll-d10", "learn-dice-result", "learn-dice-note");

  // "/" focuses the most relevant search field without interrupting another input.
  document.addEventListener("keydown", event => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(tag) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const target = $("#xp-search") || $("#rule-search");
      if (target) {
        event.preventDefault();
        target.focus();
      }
    }
  });
})();