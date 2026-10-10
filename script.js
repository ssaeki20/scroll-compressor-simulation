const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

const state = {
  orbitRadius: 150,
  scrollAngle: 0,
  bladePhase: 0,
  pulse: 0,
  time: 0
};

function resizeCanvas() {
  const container = canvas.parentElement;
  const ratio = window.devicePixelRatio || 1;

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawBackground(width, height) {
  const grad = ctx.createRadialGradient(width * 0.5, height * 0.42, 40, width * 0.5, height * 0.5, width * 0.7);
  grad.addColorStop(0, '#0e243d');
  grad.addColorStop(0.6, '#0a1828');
  grad.addColorStop(1, '#050d17');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(112, 187, 255, 0.18)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const y = (i / 12) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawOuterShell(cx, cy, radius) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.strokeStyle = 'rgba(128, 200, 255, 0.85)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawScrollBlades(cx, cy, radius, angle) {
  const blades = 5;

  for (let i = 0; i < blades; i++) {
    const base = (Math.PI * 2 * i) / blades + angle;

    const p1x = cx + Math.cos(base) * radius * 0.3;
    const p1y = cy + Math.sin(base) * radius * 0.3;

    const p2x = cx + Math.cos(base + 0.7) * radius * 0.76;
    const p2y = cy + Math.sin(base + 0.7) * radius * 0.76;

    const p3x = cx + Math.cos(base + 1.45) * radius * 0.84;
    const p3y = cy + Math.sin(base + 1.45) * radius * 0.84;

    const p4x = cx + Math.cos(base + 2.2) * radius * 0.62;
    const p4y = cy + Math.sin(base + 2.2) * radius * 0.62;

    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.quadraticCurveTo(
      cx + Math.cos(base + 0.15) * radius * 0.95,
      cy + Math.sin(base + 0.15) * radius * 0.95,
      p2x,
      p2y
    );
    ctx.lineTo(p3x, p3y);
    ctx.quadraticCurveTo(
      cx + Math.cos(base + 1.1) * radius * 0.96,
      cy + Math.sin(base + 1.1) * radius * 0.96,
      p4x,
      p4y
    );
    ctx.closePath();

    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(80, 255, 220, 0.8)');
    gradient.addColorStop(0.5, 'rgba(72, 180, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(72, 180, 255, 0.08)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(120, 220, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawFlowParticles(cx, cy, radius, angle) {
  const count = 40;
  for (let i = 0; i < count; i++) {
    const t = (state.time * 0.7 + i / count) % 1;
    const a = angle + t * Math.PI * 2 * 0.8 + i * 0.33;

    const r = radius * (0.22 + 0.8 * t);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;

    const glow = 0.25 + 0.75 * ((Math.sin(state.time * 2 + i) + 1) / 2);

    ctx.beginPath();
    ctx.fillStyle = `rgba(120, 220, 255, ${0.3 + glow * 0.7})`;
    ctx.arc(x, y, 2.5 + glow * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCompressionChamber(cx, cy, radius, angle) {
  const chamberX = cx + 190;
  const chamberY = cy + 5;

  ctx.save();
  ctx.translate(chamberX, chamberY);

  ctx.fillStyle = 'rgba(30, 50, 70, 0.85)';
  ctx.strokeStyle = 'rgba(125, 208, 255, 0.9)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-120, 0);
  ctx.bezierCurveTo(-80, -85, 80, -85, 120, 0);
  ctx.bezierCurveTo(80, 85, -80, 85, -120, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const pulse = 0.5 + Math.sin(state.time * 4) * 0.5;
  ctx.fillStyle = `rgba(90, 200, 255, ${0.18 + pulse * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.bezierCurveTo(-60, -55, 60, -55, 100, 0);
  ctx.bezierCurveTo(60, 55, -60, 55, -100, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#d9f6ff';
  ctx.font = '16px sans-serif';
  ctx.fillText('Compression chamber', -62, -95);

  ctx.restore();
}

function drawArrow(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 12;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - headLen * Math.cos(angle - Math.PI / 6),
    y2 - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    x2 - headLen * Math.cos(angle + Math.PI / 6),
    y2 - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function drawLabels(cx, cy) {
  ctx.fillStyle = '#d7f0ff';
  ctx.font = '18px sans-serif';

  ctx.fillText('Fixed scroll', cx - 90, cy - 180);
  ctx.fillText('Orbiting scroll', cx + 190, cy - 180);

  ctx.fillStyle = '#9be7ff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Inlet', cx - 223, cy + 100);
  ctx.fillText('Outlet', cx + 265, cy + 100);

  drawArrow(cx - 185, cy + 98, cx - 120, cy + 98, '#7ed8ff');
  drawArrow(cx + 185, cy + 98, cx + 250, cy + 98, '#7ed8ff');
}

function animate() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);

  drawBackground(width, height);

  const cx = width * 0.38;
  const cy = height * 0.52;

  state.time += 0.016;
  state.scrollAngle += 0.015;
  state.bladePhase += 0.022;

  drawOuterShell(cx, cy, 180);
  drawScrollBlades(cx, cy, 170, state.scrollAngle);
  drawFlowParticles(cx, cy, 145, state.scrollAngle);

  drawCompressionChamber(cx, cy, 170, state.scrollAngle);
  drawLabels(cx, cy);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
