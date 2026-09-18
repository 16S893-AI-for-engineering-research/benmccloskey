// transition.js — fade between pages.
// The page starts invisible (see css/style.css), then this script fades it
// in on load, and fades it out before navigating to another same-site page,
// so the four static pages read as transitions within one app instead of
// hard page reloads.

(function () {
  const DURATION = 450; // ms, keep in sync with css/style.css

  // Entry transition: fade the page in from its initial opacity:0 state.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("page-ready");
    });
  });

  function isSameOriginHtmlLink(link) {
    if (!link || link.target === "_blank") return false;
    if (link.hasAttribute("download")) return false;
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return false;
    }
    try {
      const url = new URL(href, window.location.href);
      return url.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const link = event.target.closest("a[href]");
    if (!isSameOriginHtmlLink(link)) return;

    const destination = link.href;
    if (destination === window.location.href) return;

    event.preventDefault();
    document.body.classList.remove("page-ready");
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = destination;
    }, DURATION);
  });
})();
