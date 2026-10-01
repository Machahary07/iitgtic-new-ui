// Gravity pit: every [data-physics-pit] on the page gets a Matter.js world
// whose bodies mirror its .physics-shape children. The shapes wait above the
// pit (it clips them) and drop in when it scrolls into view; after that they
// can be dragged and thrown; scrolling alone never moves them. Matter steps on
// the GSAP ticker and each frame copies body positions onto the DOM. Without
// the libraries, or with reduced motion, the shapes simply sit in a wrapped
// row (base.css).
import { loadGsap } from './gsap.js';

const MATTER = 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/build/matter.min.js';
const WALL = 200; // thickness of the invisible floor and side walls
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

let loading;
const loadMatter = () =>
  (loading ??= new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = MATTER;
    el.onload = () => resolve(window.Matter);
    el.onerror = () => {
      loading = undefined;
      reject(new Error(`Failed to load ${MATTER}`));
    };
    document.head.append(el);
  }));

async function createPit(pit) {
  const [Matter, { gsap }] = await Promise.all([loadMatter(), loadGsap()]);
  if (!pit.isConnected) return;
  const { Engine, Bodies, Body, Composite, Constraint, Vertices, Sleeping } = Matter;
  const box = (w, h) => Vertices.fromPath(`0 0 ${w} 0 ${w} ${h} 0 ${h}`);

  // Settled shapes sleep, so they stay perfectly still until touched.
  const engine = Engine.create({ gravity: { y: 1.2 }, enableSleeping: true });
  const shapes = [...pit.querySelectorAll('.physics-shape')];
  // Measure in the static layout, then switch to absolute positioning.
  const sizes = shapes.map((el) => [el.offsetWidth, el.offsetHeight]);
  pit.setAttribute('data-physics-ready', '');

  let width = pit.clientWidth;
  let height = pit.clientHeight;
  const bodies = shapes.map((el, i) => {
    const [w, h] = sizes[i];
    const x = w / 2 + Math.random() * Math.max(width - w, 0);
    const y = -h - i * 70 - Math.random() * 40; // stacked up above the pit, out of sight
    const options = { restitution: 0.35, friction: 0.25, frictionAir: 0.012, density: 0.002, angle: (Math.random() - 0.5) * 0.8 };
    const shape = el.dataset.shape;
    return shape === 'circle'
      ? Bodies.circle(x, y, w / 2, options)
      : Bodies.rectangle(x, y, w, h, { ...options, chamfer: { radius: shape === 'pill' ? h / 2 - 0.5 : Math.min(w, h) * 0.22 } });
  });

  // Floor and two tall walls; no ceiling, so a hard throw arcs up and falls back.
  const walls = [0, 1, 2].map(() => Bodies.rectangle(0, 0, WALL, WALL, { isStatic: true }));
  const placeWalls = () => {
    const tall = height * 6;
    Body.setVertices(walls[0], box(width + WALL * 2, WALL));
    Body.setPosition(walls[0], { x: width / 2, y: height + WALL / 2 });
    for (const [wall, x] of [[walls[1], -WALL / 2], [walls[2], width + WALL / 2]]) {
      Body.setVertices(wall, box(WALL, tall));
      Body.setPosition(wall, { x, y: height - tall / 2 });
    }
  };
  placeWalls();
  Composite.add(engine.world, [...walls, ...bodies]);

  const draw = () => {
    bodies.forEach((body, i) => {
      const [w, h] = sizes[i];
      shapes[i].style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    });
  };
  draw();

  // Dragging: a springy constraint from the pointer to the grabbed point.
  let drag;
  const local = (event) => {
    const r = pit.getBoundingClientRect();
    return { x: Math.min(Math.max(event.clientX - r.left, 0), width), y: Math.min(event.clientY - r.top, height) };
  };
  const onDown = (event) => {
    const i = shapes.indexOf(event.target.closest('.physics-shape'));
    if (i < 0 || drag) return;
    event.preventDefault();
    const point = local(event);
    const body = bodies[i];
    Sleeping.set(body, false);
    const constraint = Constraint.create({
      pointA: point,
      bodyB: body,
      pointB: { x: point.x - body.position.x, y: point.y - body.position.y },
      stiffness: 0.2,
      damping: 0.1,
      length: 0,
    });
    Composite.add(engine.world, constraint);
    drag = { id: event.pointerId, el: shapes[i], constraint };
    drag.el.setPointerCapture(event.pointerId);
    drag.el.setAttribute('data-dragging', '');
    pit.setAttribute('data-dragging', '');
  };
  const onMove = (event) => {
    if (drag?.id === event.pointerId) drag.constraint.pointA = local(event);
  };
  const onUp = (event) => {
    if (drag?.id !== event.pointerId) return;
    Composite.remove(engine.world, drag.constraint);
    drag.el.removeAttribute('data-dragging');
    pit.removeAttribute('data-dragging');
    drag = undefined;
  };
  pit.addEventListener('pointerdown', onDown);
  pit.addEventListener('pointermove', onMove);
  pit.addEventListener('pointerup', onUp);
  pit.addEventListener('pointercancel', onUp);

  // The simulation runs on GSAP's ticker, once dropped and only while on screen.
  let running = false;
  const tick = (time, deltaMs) => {
    if (!pit.isConnected) return destroy();
    if (!running) return;
    Engine.update(engine, Math.min(deltaMs, 1000 / 30));
    draw();
  };
  gsap.ticker.add(tick);

  // Observe the actual pit instead of cached scroll coordinates: event images
  // above this CTA may load later and move it after the page has rendered.
  let dropped = false;
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) dropped = true;
    running = dropped && entry.isIntersecting;
  });
  visibility.observe(pit);

  // Keep the walls on the pit's edges and pull stray shapes back inside.
  const resize = new ResizeObserver(() => {
    const w = pit.clientWidth;
    const h = pit.clientHeight;
    if (w === width && h === height) return;
    const sx = w / width;
    width = w;
    height = h;
    placeWalls();
    bodies.forEach((body, i) => {
      const [bw, bh] = sizes[i];
      Sleeping.set(body, false);
      Body.setPosition(body, { x: Math.min(Math.max(body.position.x * sx, bw / 2), width - bw / 2), y: Math.min(body.position.y, height - bh / 2) });
    });
    draw();
  });
  resize.observe(pit);

  function destroy() {
    gsap.ticker.remove(tick);
    visibility.disconnect();
    resize.disconnect();
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  }
}

// Pages render the CTA through the router, so watch for new pits.
const found = new WeakSet();
function scan() {
  if (still.matches) return;
  for (const pit of document.querySelectorAll('[data-physics-pit]')) {
    if (found.has(pit)) continue;
    found.add(pit);
    createPit(pit).catch((err) => console.error(err));
  }
}
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
scan();
