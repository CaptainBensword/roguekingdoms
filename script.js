(() => {
  "use strict";
  const values = [10, 20, 35, 50];
  const cards = values.flatMap((value) => Array.from({ length: 4 }, (_, index) => ({
    value,
    copy: index + 1,
    id: "EXP-" + value + "-" + String(index + 1).padStart(2, "0")
  })));
  const grid = document.getElementById("card-grid");
  const search = document.getElementById("card-search");
  const count = document.getElementById("visible-count");
  const empty = document.getElementById("empty-state");
  const filters = Array.from(document.querySelectorAll(".filter-button"));
  let activeFilter = "all";

  const compass = '<svg class="compass-icon" viewBox="0 0 180 180" role="img" aria-label="Compass emblem"><circle cx="90" cy="90" r="56" fill="none" stroke="#c83d35" stroke-width="5"/><circle cx="90" cy="90" r="45" fill="none" stroke="#9f302d" stroke-width="2"/><path d="M90 15 L103 77 L165 90 L103 103 L90 165 L77 103 L15 90 L77 77 Z" fill="#b7b4ad" stroke="#25282b" stroke-width="4" stroke-linejoin="round"/><path d="M90 15 L90 90 L77 77 Z" fill="#ece7dc"/><path d="M165 90 L90 90 L103 77 Z" fill="#777b7b"/><path d="M90 165 L90 90 L103 103 Z" fill="#d4cfc5"/><path d="M15 90 L90 90 L77 103 Z" fill="#555b5d"/><path d="M90 15 L90 165 M15 90 L165 90" fill="none" stroke="#34383b" stroke-width="2" opacity=".85"/><circle cx="90" cy="90" r="6" fill="#24282b" stroke="#ddd6c9" stroke-width="2"/></svg>';

  function cardMarkup(card, index) {
    const serial = String(index + 1).padStart(3, "0");
    return '<button class="playing-card" type="button" data-value="' + card.value + '" data-id="' + card.id + '" aria-label="Card ' + serial + ', ' + card.value + ' XP. Show reverse.">' +
      '<span class="card-inner">' +
        '<span class="card-face card-front">' +
          '<span class="card-paper">' +
            '<span class="card-top-flourish">✦</span>' +
            '<strong class="card-value">' + card.value + '</strong>' +
            '<b class="card-unit">XP</b>' +
            '<span class="card-edition">TALON • EXPERIENCE</span>' +
            '<span class="card-bottom-flourish">✦</span>' +
          '</span>' +
        '</span>' +
        '<span class="card-face card-back"><span class="back-frame">' + compass + '</span></span>' +
      '</span>' +
      '<span class="card-id"><span>' + card.id + '</span><span>Copy ' + card.copy + ' / 4</span></span>' +
    '</button>';
  }

  function render() {
    const term = search.value.trim().toLowerCase();
    const visible = cards.filter((card) => {
      const matchesFilter = activeFilter === "all" || String(card.value) === activeFilter;
      const matchesSearch = !term || (card.id + " " + card.value + " xp copy " + card.copy).toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
    grid.innerHTML = visible.map((card) => cardMarkup(card, cards.indexOf(card))).join("");
    count.textContent = visible.length === 16 ? "Showing all 16 cards" : "Showing " + visible.length + " of 16 cards";
    empty.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });
  search.addEventListener("input", render);
  grid.addEventListener("click", (event) => {
    const card = event.target.closest(".playing-card");
    if (!card) return;
    const flipped = card.classList.toggle("is-flipped");
    const id = card.dataset.id;
    card.setAttribute("aria-label", flipped ? "Card " + id + ", reverse side. Show XP face." : "Card " + id + ", " + card.dataset.value + " XP. Show reverse.");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== search && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      search.focus();
    }
  });
  render();
})();
