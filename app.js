const letters = ["S", "O", "R", "T", "I", "C", "E", "A", "E", "R", "I", "L", null, "V", "E", null];

// The four solutions from words_grid.png. Edit only these paths if the source puzzle is corrected.
const solutions = [
    { word: "SORCIERE", path: [0, 1, 2, 5, 4, 8, 9, 6], color: "#f3c84b" },
    { word: "TROIS", path: [3, 2, 1, 4, 0], color: "#e87b68" },
    { word: "ATELIER", path: [7, 3, 6, 11, 10, 14, 9], color: "#72b9a5" },
    { word: "LIVRE", path: [11, 10, 13, 9, 14], color: "#71a9d7" }
];

const board = document.querySelector("#board");
const hintGroups = document.querySelector("#hintGroups");
const status = document.querySelector("#status");
const foundCount = document.querySelector("#foundCount");
const revealsRemaining = document.querySelector("#revealsRemaining");
const revealCountsButton = document.querySelector("#revealCountsButton");
let selection = [];
let found = new Set();
let revealedHints = new Set();
let dragging = false;
let reveals = 2;
let countsVisible = false;

letters.forEach((letter, index) => {
    const tile = document.createElement("button");
    tile.className = `tile${letter ? "" : " blocked"}`;
    tile.type = "button";
    tile.dataset.index = index;
    tile.innerHTML = `<span class="tile-letter">${letter || ""}</span><span class="tile-count tile-start-count"></span><span class="tile-count tile-usage-count"></span>`;
    tile.setAttribute("role", "gridcell");
    board.append(tile);
});

function renderHints() {
    const lengths = [...new Set(solutions.map((solution) => solution.word.length))].sort((a, b) => a - b);
    hintGroups.innerHTML = lengths.map((length) => {
        const foundWords = solutions.filter((solution, index) => solution.word.length === length && found.has(index));
        const hintedWords = solutions.filter((solution, index) => solution.word.length === length && !found.has(index) && revealedHints.has(index));
        const remaining = solutions.filter((solution, index) => solution.word.length === length && !found.has(index)).length;
        const canReveal = solutions.some((solution, index) => solution.word.length === length && !found.has(index) && !revealedHints.has(index));
        const foundMarkup = foundWords.length ? `<ul class="found-words">${foundWords.map((solution) => `<li>${solution.word}</li>`).join("")}</ul>` : "";
        const hintedMarkup = hintedWords.length ? `<ul class="hint-words">${hintedWords.map((solution) => `<li>${solution.word[0]}${"*".repeat(solution.word.length - 1)} (${solution.word.length} letters)</li>`).join("")}</ul>` : "";
        return `<section class="hint-group${remaining ? "" : " complete"}"><h3>${length} letters</h3>${foundMarkup}${hintedMarkup}<p><em>+${remaining} mots restant</em> - ${canReveal && reveals ? `<button class="reveal-link" type="button" data-length="${length}">Révéler un mot</button>` : remaining ? "Aucun indices restants" : "Tous les mots trouvés"}</p></section>`;
    }).join("");
    revealsRemaining.textContent = reveals;
    revealCountsButton.disabled = countsVisible || !reveals;
}

function adjacent(first, second) {
    const rowA = Math.floor(first / 4), colA = first % 4;
    const rowB = Math.floor(second / 4), colB = second % 4;
    return Math.max(Math.abs(rowA - rowB), Math.abs(colA - colB)) <= 1;
}

function paintSelection() {
    document.querySelectorAll(".tile").forEach((tile) => tile.classList.toggle("selected", selection.includes(Number(tile.dataset.index))));
}

function updateTileVisibility() {
    document.querySelectorAll(".tile:not(.blocked)").forEach((tile) => {
        const index = Number(tile.dataset.index);
        const neededByRemainingWord = solutions.some((solution, solutionIndex) => !found.has(solutionIndex) && solution.path.includes(index));
        tile.classList.toggle("exhausted", !neededByRemainingWord);
    });
}

function updateTileCounts() {
    const remainingSolutions = solutions.filter((solution, solutionIndex) => !found.has(solutionIndex));
    document.querySelectorAll(".tile:not(.blocked)").forEach((tile) => {
        const index = Number(tile.dataset.index);
        const starts = remainingSolutions.filter((solution) => solution.path[0] === index).length;
        const uses = remainingSolutions.filter((solution) => solution.path.includes(index)).length;
        tile.querySelector(".tile-start-count").textContent = countsVisible && starts ? starts : "";
        tile.querySelector(".tile-usage-count").textContent = countsVisible && uses ? uses : "";
        tile.classList.toggle("counts-visible", countsVisible);
    });
}

function addTile(index) {
    if (!letters[index] || selection.includes(index) || document.querySelector(`[data-index="${index}"]`).classList.contains("exhausted")) return;
    if (selection.length && !adjacent(selection.at(-1), index)) return;
    selection.push(index);
    paintSelection();
}

function markSolutionFound(match, message) {
    if (found.has(match)) return;
    found.add(match);
    document.querySelectorAll(".tile").forEach((tile) => { if (solutions[match].path.includes(Number(tile.dataset.index))) tile.classList.add("found"); });
    updateTileVisibility();
    status.textContent = message || `${solutions[match].word} trouvé`;
    foundCount.textContent = found.size;
    updateTileCounts();
    renderHints();
    if (found.size === solutions.length) status.textContent = "Puzzle terminé ! Bravo !";
}

function finishSelection() {
    if (!selection.length) return;
    const match = solutions.findIndex((solution) => solution.path.join(",") === selection.join(",") || solution.path.slice().reverse().join(",") === selection.join(","));
    if (match >= 0 && !found.has(match)) {
        markSolutionFound(match);
    } else if (match < 0) {
        status.textContent = "Ce mot n'est pas correct. Le mot peut être bon mais avec les mauvaises tuiles.";
    }
    selection = [];
    paintSelection();
}

hintGroups.addEventListener("click", (event) => {
    const button = event.target.closest(".reveal-link");
    if (!button || !reveals) return;
    const match = solutions.findIndex((solution, index) => solution.word.length === Number(button.dataset.length) && !found.has(index) && !revealedHints.has(index));
    if (match < 0) return;
    reveals -= 1;
    revealedHints.add(match);
    renderHints();
    status.textContent = `${solutions[match].word[0]}... indices révélés.`;
});

revealCountsButton.addEventListener("click", () => {
    if (!reveals || countsVisible) return;
    reveals -= 1;
    countsVisible = true;
    updateTileCounts();
    renderHints();
    status.textContent = "Indices de tuiles révélés.";
});

function tileAtPoint(clientX, clientY) {
    return document.elementFromPoint(clientX, clientY)?.closest(".tile:not(.blocked)");
}

function finishDrag(pointerId) {
    if (!dragging) return;
    dragging = false;
    if (board.hasPointerCapture(pointerId)) board.releasePointerCapture(pointerId);
    finishSelection();
}

board.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const tile = event.target.closest(".tile:not(.blocked)");
    if (tile) {
        dragging = true;
        selection = [];
        board.setPointerCapture(event.pointerId);
        addTile(Number(tile.dataset.index));
    }
});
board.addEventListener("pointermove", (event) => {
    event.preventDefault();
    const tile = tileAtPoint(event.clientX, event.clientY);
    if (dragging && tile) addTile(Number(tile.dataset.index));
});
board.addEventListener("pointerup", (event) => finishDrag(event.pointerId));
board.addEventListener("pointercancel", (event) => finishDrag(event.pointerId));
window.addEventListener("pointerup", (event) => finishDrag(event.pointerId));
document.querySelector("#resetButton").addEventListener("click", () => { found.clear(); revealedHints.clear(); countsVisible = false; selection = []; reveals = 2; document.querySelectorAll(".found").forEach((element) => element.classList.remove("found")); updateTileVisibility(); updateTileCounts(); foundCount.textContent = "0"; status.textContent = "Commence par une lettre."; renderHints(); });

updateTileVisibility();
updateTileCounts();
renderHints();