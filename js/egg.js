// egg.js — hidden easter egg.
// Type "medevac" anywhere on the page (no input focus needed) to trigger
// a helicopter flyby and a note. Also triggerable via the hidden dot
// in the footer (aria-hidden, but clickable) for anyone who finds it by mouse.

(function () {
  const overlay = document.getElementById("egg-overlay");
  if (!overlay) return;

  let buffer = "";
  const CODE = "medevac";

  function fire() {
    overlay.classList.add("active");
    overlay.innerHTML = "";

    const heli = document.createElement("div");
    heli.className = "heli";
    heli.textContent = "🚁";
    overlay.appendChild(heli);

    const note = document.createElement("div");
    note.className = "egg-note";
    note.textContent =
      "Dispatch confirmed. You found the easter egg — type it anywhere: medevac.";
    overlay.appendChild(note);
    requestAnimationFrame(() => note.classList.add("show"));

    setTimeout(() => note.classList.remove("show"), 3600);
    setTimeout(() => {
      overlay.classList.remove("active");
      overlay.innerHTML = "";
    }, 4200);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key.length > 1) return; // ignore modifier/arrow keys
    buffer = (buffer + e.key.toLowerCase()).slice(-CODE.length);
    if (buffer === CODE) fire();
  });

  const dot = document.querySelector("[data-egg-trigger]");
  if (dot) dot.addEventListener("click", fire);
})();
