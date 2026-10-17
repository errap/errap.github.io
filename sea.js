// A calm sea drawn as thin wave lines, with an island on the horizon.
const canvas = document.querySelector(".sea");
const ctx = canvas.getContext("2d");
const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LINES = 46;
const HORIZON = 0.5; // fraction of the window height

let W, H, dpr;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Island profile: steep rise to a rounded peak, then a long rough slope.
function islandHeight(u) {
  const PEAK = 0.28;
  const shape = u < PEAK
    ? Math.sin((u / PEAK) * Math.PI / 2) ** 0.8
    : (1 - (u - PEAK) / (1 - PEAK)) ** 1.3;
  const rough = 1 + 0.04 * Math.sin(u * 19) + 0.015 * Math.sin(u * 47);
  return 48 * shape * rough;
}

function draw(t) {
  ctx.clearRect(0, 0, W, H);
  const horizon = Math.round(H * HORIZON);

  // Faint haze just above the horizon.
  const haze = ctx.createLinearGradient(0, horizon - 160, 0, horizon);
  haze.addColorStop(0, "rgba(150, 160, 165, 0)");
  haze.addColorStop(1, "rgba(150, 160, 165, 0.16)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, horizon - 160, W, 160);

  // Island on the horizon, in the space left of the page content.
  const room = document.querySelector("main").getBoundingClientRect().left;
  const iw = Math.min(240, room * 0.8);
  const ix = (room - iw) / 2;
  if (iw > 100) {
    ctx.beginPath();
    ctx.moveTo(ix, horizon);
    for (let x = 0; x <= iw; x += 2) {
      ctx.lineTo(ix + x, horizon - islandHeight(x / iw));
    }
    ctx.lineTo(ix + iw, horizon);
    ctx.closePath();
    ctx.fillStyle = "rgba(120, 128, 132, 0.4)";
    ctx.fill();
  }

  // Wave lines: tight and flat near the horizon, wider and taller up close.
  ctx.lineWidth = 1;
  for (let i = 0; i < LINES; i++) {
    const d = (i + 1) / LINES;
    const depth = d ** 1.9;
    const base = horizon + (H - horizon) * depth;
    const amp = 0.6 + 16 * depth;
    const k = 0.008 / (0.3 + depth);
    const speed = 0.00018 + 0.0004 * depth;

    ctx.strokeStyle = `rgba(175, 184, 188, ${0.2 + 0.45 * depth})`;
    ctx.beginPath();
    for (let x = -10; x <= W + 10; x += 6) {
      const y = base
        + Math.sin(x * k + t * speed + i * 0.9) * amp * 0.6
        + Math.sin(x * k * 2.3 - t * speed * 1.4 + i * 2.1) * amp * 0.3
        + Math.sin(x * k * 0.45 + t * speed * 0.6 + i * 0.4) * amp * 0.4;
      x === -10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // The horizon itself.
  ctx.fillStyle = "rgba(190, 196, 198, 0.65)";
  ctx.fillRect(0, horizon, W, 1);
}

function loop(t) {
  draw(t);
  requestAnimationFrame(loop);
}

resize();
window.addEventListener("resize", () => { resize(); if (still) draw(0); });
still ? draw(0) : requestAnimationFrame(loop);
