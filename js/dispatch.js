// dispatch.js — small canvas animation for the hero.
// Simulates a MEDEVAC dispatch: helicopters flying from a base to
// incident markers on a stylized map grid. Not a model, just motion.

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

  const base = { x: 40, y: null };

  const incidents = [];
  function spawnIncident() {
    incidents.push({
      x: 80 + Math.random() * (w - 140),
      y: 20 + Math.random() * (h - 40),
      born: performance.now(),
      served: false,
    });
  }
  for (let i = 0; i < 3; i++) spawnIncident();
  setInterval(() => {
    if (incidents.filter((i) => !i.served).length < 4) spawnIncident();
  }, 2200);

  const helis = [
    { t: 0, target: null, speed: 0.35 },
    { t: 0, target: null, speed: 0.28 },
  ];

  function pickTarget() {
    const open = incidents.filter((i) => !i.served && !i.taken);
    if (!open.length) return null;
    const inc = open[Math.floor(Math.random() * open.length)];
    inc.taken = true;
    return inc;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    base.y = h / 2;

    // grid
    ctx.strokeStyle = "rgba(147,161,176,0.08)";
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

    // base
    ctx.fillStyle = "#3ddc97";
    ctx.beginPath();
    ctx.arc(base.x, base.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "10px monospace";
    ctx.fillStyle = "#93a1b0";
    ctx.fillText("BASE", base.x - 12, base.y + 20);

    // incidents
    incidents.forEach((inc) => {
      if (inc.served) return;
      const age = (now - inc.born) / 1000;
      const pulse = 3 + Math.sin(age * 3) * 1.5;
      ctx.strokeStyle = "rgba(255,106,61,0.8)";
      ctx.beginPath();
      ctx.arc(inc.x, inc.y, 5 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ff6a3d";
      ctx.beginPath();
      ctx.arc(inc.x, inc.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // helicopters
    helis.forEach((heli) => {
      if (!heli.target || heli.target.served) {
        heli.target = pickTarget();
        heli.t = 0;
        heli.leg = "out";
      }
      if (!heli.target) return;

      const dest = heli.leg === "out" ? heli.target : base;
      const from = heli.leg === "out" ? base : heli.target;

      heli.t += heli.speed * 0.016;
      const t = Math.min(heli.t, 1);
      const x = lerp(from.x, dest.x, t);
      const y = lerp(from.y, dest.y, t);

      ctx.save();
      ctx.translate(x, y);
      const angle = Math.atan2(dest.y - from.y, dest.x - from.x);
      ctx.rotate(angle);
      ctx.fillStyle = "#e6edf3";
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, -3);
      ctx.lineTo(6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(230,237,243,0.6)";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.restore();

      if (t >= 1) {
        if (heli.leg === "out") {
          heli.target.served = true;
          heli.leg = "back";
          heli.t = 0;
        } else {
          heli.target = null;
        }
      }
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
