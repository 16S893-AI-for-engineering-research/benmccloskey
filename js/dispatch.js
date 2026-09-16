// dispatch.js — small canvas animation for the hero.
//
// Stylized MEDEVAC dispatch loop (not a model, just motion):
//   BASE --> Point of Injury (POI) --> Medical Treatment Facility (MTF) --> BASE
//
// - Between 1 and 3 POIs on the map at any time (count drifts over time).
// - A POI disappears the moment a helicopter reaches it (picked up).
// - Every pickup routes through an MTF before heading home: POI --> MTF --> BASE.
//   The helicopter changes color while carrying a casualty aboard that leg.
// - Two MTFs sit at fixed, distinct locations on the map.
// See the legend under the animation for the marker key.
(function () {
  const canvas = document.getElementById("dispatch-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w, h, dpr;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  const COLORS = {
    empty: "#e6edf3", // no casualty aboard / idle
    casualty: "#ff4d4f", // carrying a casualty
    poi: "#ff6a3d",
    poiDim: "rgba(255,106,61,0.8)",
    mtf: "#5aa9ff",
    base: "#3ddc97",
    grid: "rgba(147,161,176,0.08)",
    muted: "#93a1b0",
  };

  const base = { x: 40, y: null, label: "BASE" };

  // Medical Treatment Facilities — fixed nodes at two distinct map locations
  // (not stacked on the same side), so routes to each look different.
  const mtfs = [
    { x: null, y: null, fracX: 0.6, fracY: 0.18, label: "MTF-1" },
    { x: null, y: null, fracX: 0.88, fracY: 0.8, label: "MTF-2" },
  ];

  const MIN_POI = 1;
  const MAX_POI = 3;
  const pois = [];
  const POI_MAX_AGE = 9000; // ms — untaken POIs eventually resolve/expire

  // Target POI count drifts between 1 and 3 every few seconds so the map
  // sometimes shows a single incident, sometimes a cluster of three.
  let targetPOICount = 2;
  function rerollTarget() {
    targetPOICount = MIN_POI + Math.floor(Math.random() * (MAX_POI - MIN_POI + 1));
  }
  rerollTarget();
  setInterval(rerollTarget, 5000);

  function layout() {
    base.y = h / 2;
    mtfs.forEach((m) => {
      m.x = 60 + m.fracX * (w - 100);
      m.y = 20 + m.fracY * (h - 40);
    });
  }
  layout();
  window.addEventListener("resize", layout);

  function spawnPOI() {
    if (pois.length >= MAX_POI) return;
    pois.push({
      x: 90 + Math.random() * (w - 180),
      y: 20 + Math.random() * (h - 40),
      born: performance.now(),
      hasCasualty: true,
      taken: false,
    });
  }
  for (let i = 0; i < targetPOICount; i++) spawnPOI();

  // Every tick, nudge the live POI count toward the current target: spawn
  // if we're under target, or let the oldest untaken POI expire if we're
  // over target (simulating a resolved / false-alarm incident).
  setInterval(() => {
    const untaken = pois.filter((p) => !p.taken);
    if (pois.length < targetPOICount && pois.length < MAX_POI) {
      spawnPOI();
    } else if (untaken.length > 0 && pois.length > targetPOICount) {
      const oldest = untaken.reduce((a, b) => (a.born < b.born ? a : b));
      const idx = pois.indexOf(oldest);
      if (idx !== -1) pois.splice(idx, 1);
    }
  }, 2200);

  // Untaken POIs that linger too long quietly resolve on their own, which
  // also helps the visible count breathe between 1 and 3 over time.
  setInterval(() => {
    const now = performance.now();
    for (let i = pois.length - 1; i >= 0; i--) {
      const p = pois[i];
      if (!p.taken && now - p.born > POI_MAX_AGE && pois.length > MIN_POI) {
        pois.splice(i, 1);
      }
    }
  }, 1000);

  const helis = [
    { t: 0, speed: 0.4, leg: "home", target: null, carrying: false, poi: null },
    { t: 0, speed: 0.3, leg: "home", target: null, carrying: false, poi: null },
  ];

  function pickPOI() {
    const open = pois.filter((p) => !p.taken);
    if (!open.length) return null;
    const poi = open[Math.floor(Math.random() * open.length)];
    poi.taken = true;
    return poi;
  }

  function nearestMTF(from) {
    return mtfs.reduce((best, m) => {
      const d = Math.hypot(m.x - from.x, m.y - from.y);
      if (!best || d < best.d) return { m, d };
      return best;
    }, null).m;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawBase() {
    ctx.fillStyle = COLORS.base;
    ctx.beginPath();
    ctx.arc(base.x, base.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "10px monospace";
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(base.label, base.x - 16, base.y + 20);
  }

  function drawMTFs() {
    mtfs.forEach((m) => {
      ctx.strokeStyle = COLORS.mtf;
      ctx.lineWidth = 1.5;
      const s = 6;
      // square marker
      ctx.strokeRect(m.x - s, m.y - s, s * 2, s * 2);
      // cross (medical) inside
      ctx.beginPath();
      ctx.moveTo(m.x - 3, m.y);
      ctx.lineTo(m.x + 3, m.y);
      ctx.moveTo(m.x, m.y - 3);
      ctx.lineTo(m.x, m.y + 3);
      ctx.stroke();
      ctx.font = "10px monospace";
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(m.label, m.x - 20, m.y + 18);
    });
  }

  function drawPOIs(now) {
    pois.forEach((poi) => {
      const age = (now - poi.born) / 1000;
      const pulse = 3 + Math.sin(age * 3) * 1.5;
      ctx.strokeStyle = COLORS.poiDim;
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, 5 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = COLORS.poi;
      ctx.beginPath();
      ctx.arc(poi.x, poi.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw a small helicopter icon: fuselage, tail boom, main rotor, tail rotor.
  function drawHeli(x, y, angle, color, now) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // tail boom
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-2, 0);
    ctx.stroke();

    // fuselage
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(2, 0, 6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // tail rotor (small spin)
    const spin = (now / 60) % (Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-11, -3);
    ctx.lineTo(-11, 3);
    ctx.stroke();

    // main rotor (spinning line above fuselage)
    ctx.save();
    ctx.translate(1, -1);
    ctx.rotate(spin);
    ctx.strokeStyle = "rgba(230,237,243,0.7)";
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function advanceHeli(heli, now) {
    // Idle: find a new POI to service.
    if (heli.leg === "home" && !heli.target) {
      const poi = pickPOI();
      if (poi) {
        heli.poi = poi;
        heli.target = poi;
        heli.from = base;
        heli.leg = "toPOI";
        heli.t = 0;
        heli.carrying = false;
      } else {
        return; // nothing to do, sit at base
      }
    }
    if (!heli.target) return;

    heli.t += heli.speed * 0.016;
    const t = Math.min(heli.t, 1);
    const x = lerp(heli.from.x, heli.target.x, t);
    const y = lerp(heli.from.y, heli.target.y, t);
    const angle = Math.atan2(
      heli.target.y - heli.from.y,
      heli.target.x - heli.from.x
    );

    const color = heli.carrying ? COLORS.casualty : COLORS.empty;
    drawHeli(x, y, angle, color, now);

    if (t >= 1) {
      if (heli.leg === "toPOI") {
        // POI reached: it disappears now.
        const idx = pois.indexOf(heli.poi);
        if (idx !== -1) pois.splice(idx, 1);

        // Every pickup carries a casualty through an MTF before heading home.
        heli.carrying = true;
        const mtf = nearestMTF(heli.poi);
        heli.from = heli.poi;
        heli.target = mtf;
        heli.leg = "toMTF";
        heli.t = 0;
      } else if (heli.leg === "toMTF") {
        heli.carrying = false; // handed off at the MTF
        heli.from = heli.target;
        heli.target = base;
        heli.leg = "toBase";
        heli.t = 0;
      } else if (heli.leg === "toBase") {
        heli.leg = "home";
        heli.target = null;
        heli.poi = null;
        heli.t = 0;
      }
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    drawMTFs();
    drawBase();
    drawPOIs(now);
    helis.forEach((heli) => advanceHeli(heli, now));
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
