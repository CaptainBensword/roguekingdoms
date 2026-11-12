(() => {
  "use strict";

  const cardValues = [10, 20, 35, 50];
  const cards = cardValues.flatMap((value) => Array.from({ length: 4 }, (_, copy) => ({
    value,
    copy: copy + 1,
    id: `RK-${value}-${String(copy + 1).padStart(2, "0")}`
  })));

  const grid = document.getElementById("card-grid");
  const search = document.getElementById("card-search");
  const count = document.getElementById("visible-count");
  const empty = document.getElementById("empty-state");
  const filters = [...document.querySelectorAll(".filter-button")];
  let activeFilter = "all";

  const imageFor = (value) => `assets/xp-${value}.webp`;

  function cardMarkup(card) {
    const frontLabel = `${card.value} XP reward card ${card.id}`;
    return `
      <button class="playing-card" type="button" data-value="${card.value}" data-id="${card.id}" aria-label="${frontLabel}. Flip to view the reverse.">
        <span class="card-inner">
          <span class="card-face card-front"><img src="${imageFor(card.value)}" alt="${frontLabel}" loading="lazy" draggable="false"></span>
          <span class="card-face card-back"><img src="assets/card-back.webp" alt="Compass card reverse" loading="lazy" draggable="false"></span>
        </span>
        <span class="card-id"><span>${card.id}</span><span>Copy ${card.copy} / 4</span></span>
      </button>`;
  }

  function renderCards() {
    const query = search.value.trim().toLowerCase();
    const visible = cards.filter((card) => {
      const filterMatch = activeFilter === "all" || String(card.value) === activeFilter;
      const searchMatch = !query || `${card.id} ${card.value} xp copy ${card.copy}`.toLowerCase().includes(query);
      return filterMatch && searchMatch;
    });
    grid.innerHTML = visible.map(cardMarkup).join("");
    grid.hidden = visible.length === 0;
    empty.hidden = visible.length !== 0;
    count.textContent = visible.length === cards.length ? "Showing all 16 cards" : `Showing ${visible.length} of 16 cards`;
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderCards();
    });
  });

  search.addEventListener("input", renderCards);
  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".playing-card");
    if (!button) return;
    const flipped = button.classList.toggle("is-flipped");
    button.setAttribute("aria-label", flipped
      ? `Card ${button.dataset.id}, compass reverse. Flip to see ${button.dataset.value} XP.`
      : `Card ${button.dataset.id}, ${button.dataset.value} XP. Flip to view the reverse.`);
  });

  // The practice draw is separate from a real tabletop match; resetting restores the demo deck.
  const drawButton = document.getElementById("draw-button");
  const resetButton = document.getElementById("reset-deck");
  const drawImage = document.getElementById("draw-image");
  const drawCard = document.getElementById("draw-card");
  const drawResult = document.getElementById("draw-result");
  const remainingCount = document.getElementById("remaining-count");
  const remainingFill = document.getElementById("remaining-fill");
  let demoDeck = [];

  function shuffledDeck() {
    const deck = cards.map((card) => ({ ...card }));
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function updateRemaining() {
    remainingCount.textContent = `${demoDeck.length} card${demoDeck.length === 1 ? "" : "s"} remaining`;
    remainingFill.style.width = `${(demoDeck.length / cards.length) * 100}%`;
  }

  function resetDemoDeck() {
    demoDeck = shuffledDeck();
    drawImage.src = "assets/card-back.webp";
    drawImage.alt = "Face-down XP card";
    drawCard.classList.remove("revealed");
    drawResult.innerHTML = "<span>THE NEXT REWARD</span><strong>?</strong><small>Draw to reveal your XP</small>";
    drawButton.disabled = false;
    drawButton.innerHTML = "Draw a card <span>✦</span>";
    updateRemaining();
  }

  drawButton.addEventListener("click", () => {
    if (demoDeck.length === 0) return;
    const card = demoDeck.pop();
    drawCard.classList.remove("revealed");
    // Force a layout pass so the shine animation can replay on consecutive draws.
    void drawCard.offsetWidth;
    drawImage.src = imageFor(card.value);
    drawImage.alt = `${card.value} XP reward card`;
    drawCard.classList.add("revealed");
    drawResult.innerHTML = `<span>YOU FOUND</span><strong>${card.value} XP</strong><small>${card.id} · Copy ${card.copy} of 4</small>`;
    updateRemaining();
    if (demoDeck.length === 0) {
      drawButton.disabled = true;
      drawButton.textContent = "Deck empty";
    }
  });
  resetButton.addEventListener("click", resetDemoDeck);

  // Keyboard shortcut for card search, without stealing '/' from another input.
  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName;
    if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      search.focus();
    }
  });

  // Reveal sections as they enter view; content remains visible if the API is unavailable.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  renderCards();
  resetDemoDeck();
})();
