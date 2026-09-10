// layout.js — injects shared header/footer, marks active nav link,
// and wires up the easter-egg overlay markup once per page.

(function () {
  const path = window.location.pathname.split("/").pop() || "index.html";

  const nav = [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About" },
    { href: "project.html", label: "Project" },
    { href: "devlog.html", label: "Dev Log" },
  ];

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap">
      <a class="brand" href="index.html">ben<span>mccloskey</span>.dev</a>
      <nav class="main-nav" aria-label="Primary">
        <ul>
          ${nav
            .map(
              (item) =>
                `<li><a href="${item.href}"${
                  item.href === path ? ' class="active"' : ""
                }>${item.label}</a></li>`
            )
            .join("")}
        </ul>
      </nav>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <span>16.S893 &middot; AI Agents for Engineering Research &middot; Fall 2026</span>
      <span>Built with <a href="https://github.com/earendil-works/pi-coding-agent" target="_blank" rel="noopener">pi</a> and reviewed by hand. <span class="egg-dot" data-egg-trigger aria-hidden="true">·</span></span>
    </div>
  `;
  document.body.appendChild(footer);

  const eggOverlay = document.createElement("div");
  eggOverlay.id = "egg-overlay";
  document.body.appendChild(eggOverlay);

  const eggScript = document.createElement("script");
  eggScript.src = "js/egg.js";
  document.body.appendChild(eggScript);
})();
