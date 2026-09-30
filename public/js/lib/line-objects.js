// Technical 3D line-art objects (home hero background, About "Inside IITG-TIC"
// cards), drawn with Three.js (loaded from the CDN on first use). Each object
// renders into its own <canvas>, any aspect ratio, with a transparent
// background, and only animates while started.
//
//   const obj = await createLineObject(canvas, 'phone'); obj.start(); obj.stop(); obj.dispose();
//
// Kinds: 'phone' (exploded smartphone that comes apart and back together),
// 'gyroscope' (nested rings on different axes), 'gears' (a meshing pair),
// 'lattice' (geodesic shell with nodes orbiting it), 'drone' (exploded
// quadcopter, rotors spinning), 'chip' (exploded processor: pins, substrate,
// die, lid), 'dna' (double helix), 'satellite' (solar wings fold and deploy),
// and for the About cards: 'bulb' (idea: glass, filament, screw base),
// 'compass' (mission: layered dial, swinging needle), 'building' (infra:
// floors with a bench and rack), 'coins' (funding: coin stack + bar chart),
// 'pillars' (governance: steps, columns, pediment). These five explode and
// reassemble on a slow loop, or, with { interactive: true }, stay assembled
// and are driven by hover: explode(true/false) and tilt(x, y) (-1..1).
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/+esm';

let threeLoading;
const loadThree = () => (threeLoading ??= import(THREE_URL).catch((err) => ((threeLoading = undefined), Promise.reject(err))));

const INK = 0xffffff;
const GREEN = 0x19d36b;
const BLUE = 0x5b8cff;

export async function createLineObject(canvas, kind, { interactive = false } = {}) {
  const THREE = await loadThree();
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12.5);

  // --- line-art helpers ------------------------------------------------------
  const lineMat = (color = INK, opacity = 0.9) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  const edges = (geometry, color, opacity, angle = 20) => new THREE.LineSegments(new THREE.EdgesGeometry(geometry, angle), lineMat(color, opacity));
  const fill = (geometry, color, opacity = 0.08) =>
    new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  const solid = (geometry, color, lineOpacity = 0.9, fillOpacity = 0.06) => {
    const g = new THREE.Group();
    g.add(fill(geometry, color, fillOpacity), edges(geometry, color, lineOpacity));
    return g;
  };
  const roundedPlate = (w, h, r, depth) => {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  // Explode helper: part(obj, dir) adds obj and remembers its rest position
  // and the direction it moves out along; animate(t, extra) eases all parts
  // out and back on a loop, then runs extra(open) for per-object motion.
  const exploder = (speed) => {
    const root = new THREE.Group();
    const parts = [];
    const part = (obj, dir) => {
      const g = new THREE.Group();
      g.add(obj);
      g.userData.dir = new THREE.Vector3(...dir);
      root.add(g);
      parts.push(g);
      return obj;
    };
    const animate = (t, extra, forced) => {
      const cycle = (Math.sin(t * speed) + 1) / 2;
      const open = forced ?? cycle * cycle * (3 - 2 * cycle);
      for (const g of parts) g.position.copy(g.userData.dir).multiplyScalar(open * 0.7);
      extra?.(open);
    };
    return { root, part, animate };
  };

  // --- builders: each returns { root, update(t) } -----------------------------
  const builders = {
    phone() {
      const root = new THREE.Group();
      const layers = [];
      const layer = (obj, spread) => {
        const g = new THREE.Group();
        g.add(obj);
        g.userData.spread = spread;
        root.add(g);
        layers.push(g);
        return g;
      };

      layer(solid(roundedPlate(3, 6, 0.45, 0.08), INK, 0.55, 0.05), -3); // back glass
      const lenses = new THREE.Group(); // camera bump on the back
      for (const [x, y] of [[-0.75, 2.3], [-0.2, 2.3], [-0.48, 1.8]]) {
        const lens = solid(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 20).rotateX(Math.PI / 2), BLUE, 0.9, 0.15);
        lens.position.set(x, y, 0);
        lenses.add(lens);
      }
      layer(lenses, -2.1);
      layer(solid(new THREE.BoxGeometry(2.3, 3.2, 0.22), GREEN, 0.9, 0.1), -1.2); // battery
      const board = new THREE.Group(); // logic board with chips
      board.add(solid(new THREE.BoxGeometry(2.6, 1.9, 0.06), INK, 0.7, 0.04));
      for (const [x, y, w, h] of [[-0.6, 0.3, 0.8, 0.8], [0.55, 0.45, 0.6, 0.4], [0.55, -0.35, 0.5, 0.5], [-0.7, -0.6, 0.5, 0.3]]) {
        const chip = solid(new THREE.BoxGeometry(w, h, 0.12), BLUE, 0.95, 0.12);
        chip.position.set(x, y, 0.09);
        board.add(chip);
      }
      board.position.y = 1.7;
      layer(board, -0.1);
      layer(edges(roundedPlate(3.05, 6.05, 0.47, 0.34), INK, 0.8), 0.9); // frame
      const screen = new THREE.Group(); // display with a pixel grid
      screen.add(solid(roundedPlate(2.9, 5.9, 0.42, 0.05), INK, 0.8, 0.07));
      const grid = new THREE.GridHelper(2.6, 10, INK, INK);
      grid.rotation.x = Math.PI / 2;
      grid.scale.y = 5.4 / 2.6;
      grid.material.transparent = true;
      grid.material.opacity = 0.15;
      screen.add(grid);
      layer(screen, 2);

      root.rotation.set(-0.45, 0.6, 0.15);
      return {
        root,
        update(t) {
          // Apart, hold, back together, hold: an eased 0 -> 1 -> 0 cycle.
          const cycle = (Math.sin(t * 0.7) + 1) / 2;
          const open = cycle * cycle * (3 - 2 * cycle);
          for (const g of layers) g.position.z = g.userData.spread * (0.12 + open * 0.55);
          root.rotation.y = 0.6 + Math.sin(t * 0.35) * 0.55;
          root.rotation.x = -0.45 + Math.sin(t * 0.25) * 0.12;
        },
      };
    },

    gyroscope() {
      const root = new THREE.Group();
      const rings = [2.9, 2.35, 1.8].map((r, i) => {
        const ring = edges(new THREE.TorusGeometry(r, 0.07, 6, 64), i === 1 ? GREEN : INK, 0.85, 30);
        root.add(ring);
        return ring;
      });
      const core = solid(new THREE.IcosahedronGeometry(0.95, 1), BLUE, 0.9, 0.12);
      root.add(core);
      const axle = edges(new THREE.CylinderGeometry(0.05, 0.05, 7.2, 8), INK, 0.4);
      root.add(axle);
      for (const y of [3.6, -3.6]) {
        const cap = solid(new THREE.ConeGeometry(0.22, 0.4, 12), INK, 0.7, 0.05);
        cap.position.y = y;
        cap.rotation.x = y > 0 ? 0 : Math.PI;
        root.add(cap);
      }
      root.rotation.set(0.35, 0, 0.2);
      return {
        root,
        update(t) {
          rings[0].rotation.set(t * 0.35, 0, 0);
          rings[1].rotation.set(0, t * 0.5, Math.PI / 2);
          rings[2].rotation.set(t * 0.7, t * 0.3, 0);
          core.rotation.set(t * 0.4, t * 0.9, 0);
          root.rotation.y = t * 0.15;
        },
      };
    },

    gears() {
      const root = new THREE.Group();
      const gearGeometry = (teeth, radius, depth) => {
        const s = new THREE.Shape();
        const toothDepth = 0.32;
        const steps = teeth * 4;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const r = i % 4 === 1 || i % 4 === 2 ? radius + toothDepth : radius;
          const p = [Math.cos(a) * r, Math.sin(a) * r];
          if (i === 0) s.moveTo(...p);
          else s.lineTo(...p);
        }
        const hole = new THREE.Path();
        hole.absarc(0, 0, radius * 0.28, 0, Math.PI * 2, true);
        s.holes.push(hole);
        const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 16 });
        geo.translate(0, 0, -depth / 2);
        return geo;
      };
      // Pitch radii sum to the centre distance so the teeth mesh; the small
      // gear turns faster by the teeth ratio.
      const big = solid(gearGeometry(18, 2.1, 0.5), INK, 0.85, 0.06);
      const small = solid(gearGeometry(10, 1.1, 0.5), GREEN, 0.9, 0.1);
      big.position.x = -1.2;
      small.position.x = 2.35;
      root.add(big, small);
      for (const g of [big, small]) {
        const shaft = edges(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 12).rotateX(Math.PI / 2), BLUE, 0.9);
        shaft.position.copy(g.position);
        root.add(shaft);
      }
      root.rotation.set(-0.5, 0.45, 0);
      return {
        root,
        update(t) {
          big.rotation.z = t * 0.4;
          small.rotation.z = -t * 0.4 * (18 / 10) + Math.PI / 10;
          root.rotation.y = 0.45 + Math.sin(t * 0.3) * 0.35;
        },
      };
    },

    lattice() {
      const root = new THREE.Group();
      const shell = edges(new THREE.IcosahedronGeometry(2.4, 1), INK, 0.7, 1);
      const inner = solid(new THREE.OctahedronGeometry(1.1), BLUE, 0.9, 0.1);
      root.add(shell, inner);
      // Vertex nodes on the shell.
      const nodeGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const nodeMat = new THREE.MeshBasicMaterial({ color: INK });
      const positions = new THREE.IcosahedronGeometry(2.4, 1).getAttribute('position');
      const seen = new Set();
      for (let i = 0; i < positions.count; i++) {
        const key = [positions.getX(i), positions.getY(i), positions.getZ(i)].map((v) => v.toFixed(2)).join();
        if (seen.has(key)) continue;
        seen.add(key);
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.fromBufferAttribute(positions, i);
        shell.add(node);
      }
      // Tilted orbits with a satellite each.
      const orbits = [0, 1, 2].map((i) => {
        const orbit = new THREE.Group();
        const path = new THREE.EllipseCurve(0, 0, 3.3, 3.3).getPoints(80);
        orbit.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(path), lineMat(i === 0 ? GREEN : INK, 0.35)));
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: i === 0 ? GREEN : INK }));
        orbit.add(sat);
        orbit.rotation.set(1.2 + i * 0.5, i * 1.1, 0);
        orbit.userData.sat = sat;
        root.add(orbit);
        return orbit;
      });
      return {
        root,
        update(t) {
          shell.rotation.set(t * 0.12, t * 0.2, 0);
          inner.rotation.set(-t * 0.3, -t * 0.4, 0);
          orbits.forEach((orbit, i) => {
            const a = t * (0.6 + i * 0.25) + i * 2;
            orbit.userData.sat.position.set(Math.cos(a) * 3.3, Math.sin(a) * 3.3, 0);
          });
        },
      };
    },

    drone() {
      const root = new THREE.Group();
      const parts = [];
      const part = (obj, dir) => {
        const g = new THREE.Group();
        g.add(obj);
        g.userData.dir = new THREE.Vector3(...dir);
        root.add(g);
        parts.push(g);
        return g;
      };
      part(solid(new THREE.BoxGeometry(1.6, 0.45, 1.6), INK, 0.85, 0.06), [0, 0, 0]); // body
      part(solid(new THREE.BoxGeometry(0.9, 0.25, 1.2), GREEN, 0.9, 0.1), [0, 1.3, 0]); // battery on top
      const gimbal = new THREE.Group(); // camera under the body
      gimbal.add(solid(new THREE.SphereGeometry(0.35, 12, 8), BLUE, 0.9, 0.12));
      const lens = edges(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 14).rotateX(Math.PI / 2), INK, 0.9);
      lens.position.z = 0.35;
      gimbal.add(lens);
      gimbal.position.y = -0.55;
      part(gimbal, [0, -1.1, 0]);
      const rotors = [];
      for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const arm = new THREE.Group();
        const beam = edges(new THREE.BoxGeometry(0.16, 0.12, 2.1), INK, 0.8);
        beam.rotation.y = Math.atan2(x, z);
        beam.position.set(x * 0.75, 0, z * 0.75);
        const motor = solid(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 14), INK, 0.85, 0.06);
        motor.position.set(x * 1.5, 0.15, z * 1.5);
        const rotor = new THREE.Group();
        rotor.add(edges(new THREE.BoxGeometry(1.7, 0.02, 0.16), GREEN, 0.9));
        rotor.add(edges(new THREE.RingGeometry(0.84, 0.86, 36).rotateX(-Math.PI / 2), INK, 0.25, 1));
        rotor.position.set(x * 1.5, 0.35, z * 1.5);
        rotors.push(rotor);
        arm.add(beam, motor, rotor);
        part(arm, [x * 0.9, 0.2, z * 0.9]);
      }
      root.rotation.set(0.45, 0.4, 0);
      return {
        root,
        update(t) {
          const cycle = (Math.sin(t * 0.6) + 1) / 2;
          const open = cycle * cycle * (3 - 2 * cycle);
          for (const g of parts) g.position.copy(g.userData.dir).multiplyScalar(open * 0.8);
          rotors.forEach((r, i) => (r.rotation.y = t * (i % 2 ? -14 : 14)));
          root.rotation.y = 0.4 + t * 0.2;
          root.position.y = Math.sin(t * 1.2) * 0.15;
        },
      };
    },

    chip() {
      const root = new THREE.Group();
      const layers = [];
      const layer = (obj, spread) => {
        const g = new THREE.Group();
        g.add(obj);
        g.userData.spread = spread;
        root.add(g);
        layers.push(g);
      };
      // Pin grid under the package.
      const pins = new THREE.Group();
      const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.3, 6);
      const pinMat = lineMat(INK, 0.5);
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          if (Math.abs(i) < 2 && Math.abs(j) < 2) continue;
          const pin = new THREE.LineSegments(new THREE.EdgesGeometry(pinGeo), pinMat);
          pin.position.set(i * 0.34, 0, j * 0.34);
          pins.add(pin);
        }
      }
      layer(pins, -1.6);
      layer(solid(new THREE.BoxGeometry(4, 0.16, 4), GREEN, 0.9, 0.08), -0.6); // substrate
      const die = new THREE.Group(); // silicon die with a circuit grid
      die.add(solid(new THREE.BoxGeometry(1.8, 0.1, 1.8), BLUE, 0.95, 0.15));
      const grid = new THREE.GridHelper(1.6, 8, BLUE, BLUE);
      grid.position.y = 0.06;
      grid.material.transparent = true;
      grid.material.opacity = 0.5;
      die.add(grid);
      layer(die, 0.4);
      layer(solid(new THREE.BoxGeometry(3.2, 0.3, 3.2), INK, 0.85, 0.05), 1.6); // heat spreader lid
      root.rotation.set(0.55, 0.6, 0);
      return {
        root,
        update(t) {
          const cycle = (Math.sin(t * 0.65) + 1) / 2;
          const open = cycle * cycle * (3 - 2 * cycle);
          for (const g of layers) g.position.y = g.userData.spread * (0.15 + open * 0.75);
          root.rotation.y = 0.6 + t * 0.25;
        },
      };
    },

    dna() {
      const root = new THREE.Group();
      const helix = new THREE.Group();
      const turns = 2.2;
      const height = 7;
      const radius = 1.3;
      const steps = 120;
      const strand = (phase, color) => {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const k = i / steps;
          const a = k * turns * Math.PI * 2 + phase;
          pts.push(new THREE.Vector3(Math.cos(a) * radius, (k - 0.5) * height, Math.sin(a) * radius));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(color, 0.95));
      };
      helix.add(strand(0, INK), strand(Math.PI, GREEN));
      // Base-pair rungs with a node at each end.
      const nodeGeo = new THREE.SphereGeometry(0.09, 8, 8);
      for (let i = 0; i <= 22; i++) {
        const k = i / 22;
        const a = k * turns * Math.PI * 2;
        const y = (k - 0.5) * height;
        const p1 = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
        const p2 = new THREE.Vector3(Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius);
        helix.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), lineMat(i % 2 ? BLUE : INK, 0.45)));
        for (const [p, c] of [[p1, INK], [p2, GREEN]]) {
          const node = new THREE.Mesh(nodeGeo, new THREE.MeshBasicMaterial({ color: c }));
          node.position.copy(p);
          helix.add(node);
        }
      }
      root.add(helix);
      root.rotation.set(0.2, 0, -0.45);
      return {
        root,
        update(t) {
          helix.rotation.y = t * 0.6;
          root.rotation.z = -0.45 + Math.sin(t * 0.3) * 0.1;
        },
      };
    },

    satellite() {
      const root = new THREE.Group();
      root.add(solid(new THREE.BoxGeometry(1.4, 1.4, 1.8), INK, 0.85, 0.06)); // bus
      const dish = new THREE.Group(); // antenna dish on top
      dish.add(edges(new THREE.SphereGeometry(0.9, 18, 6, 0, Math.PI * 2, 0, Math.PI / 3.2).rotateX(Math.PI), BLUE, 0.8, 1));
      dish.add(edges(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), INK, 0.8));
      dish.position.y = 1.35;
      root.add(dish);
      // Solar wings: panels hinge open/closed like a fan.
      const wings = [-1, 1].map((side) => {
        const wing = new THREE.Group();
        wing.add(edges(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6).rotateZ(Math.PI / 2).translate(side * 0.35, 0, 0), INK, 0.7));
        const panels = [];
        for (let i = 0; i < 3; i++) {
          const hinge = new THREE.Group();
          const panel = new THREE.Group();
          panel.add(solid(new THREE.BoxGeometry(1.1, 0.04, 1.5), GREEN, 0.9, 0.12));
          const grid = new THREE.GridHelper(1.1, 4, GREEN, GREEN);
          grid.scale.z = 1.5 / 1.1;
          grid.position.y = 0.03;
          grid.material.transparent = true;
          grid.material.opacity = 0.4;
          panel.add(grid);
          panel.position.x = side * 0.55;
          hinge.add(panel);
          hinge.position.x = side * (0.7 + i * 1.12);
          panels.push(hinge);
          wing.add(hinge);
        }
        wing.position.x = side * 0.7;
        root.add(wing);
        return { side, panels };
      });
      root.rotation.set(0.5, 0.5, 0.15);
      root.scale.setScalar(0.62); // fully deployed wings are wide; keep them in frame
      return {
        root,
        update(t) {
          // Panels fold (accordion) and deploy on a slow cycle.
          const cycle = (Math.sin(t * 0.5) + 1) / 2;
          const open = cycle * cycle * (3 - 2 * cycle);
          for (const { side, panels } of wings) {
            panels.forEach((hinge, i) => {
              const fold = (1 - open) * (Math.PI / 2.2);
              hinge.rotation.z = side * (i % 2 ? -fold : fold);
              hinge.position.x = side * (0.7 + i * 1.12 * (0.35 + open * 0.65));
            });
          }
          dish.rotation.y = t * 0.8;
          root.rotation.y = 0.5 + t * 0.18;
        },
      };
    },

    // --- About "Inside IITG-TIC" doodles ----------------------------------
    // Shared shape: parts that move out along their own direction on an
    // eased 0 -> 1 -> 0 loop while the whole piece turns slowly.
    bulb() {
      const { root, part, animate } = exploder(0.55);
      const glass = new THREE.LatheGeometry(
        [[0.45, -0.9], [0.55, -0.6], [1.1, 0.1], [1.35, 0.7], [1.2, 1.35], [0.7, 1.8], [0, 1.95]].map(([x, y]) => new THREE.Vector2(x, y)),
        24,
      );
      part(edges(glass, INK, 0.55, 8), [0, 1.3, 0]);
      const filament = new THREE.Group();
      const coil = [];
      for (let i = 0; i <= 60; i++) {
        const k = i / 60;
        coil.push(new THREE.Vector3(-0.45 + k * 0.9, 0.7 + Math.sin(k * Math.PI * 8) * 0.12, Math.cos(k * Math.PI * 8) * 0.12));
      }
      filament.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(coil), lineMat(GREEN, 1)));
      for (const x of [-0.45, 0.45]) {
        filament.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x * 0.6, -0.7, 0), new THREE.Vector3(x, 0.7, 0)]), lineMat(INK, 0.7)));
      }
      part(filament, [0, 0.5, 0]);
      const base = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const ring = edges(new THREE.TorusGeometry(0.5, 0.06, 6, 28), INK, 0.85, 30);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -1 - i * 0.2;
        base.add(ring);
      }
      base.add(solid(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 16).translate(0, -1.85, 0), BLUE, 0.9, 0.15));
      part(base, [0, -1.1, 0]);
      // Rays: little dashes around the glass, pushed further out when open.
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const ray = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * 1.8, 0.7 + Math.sin(a) * 1.8, 0), new THREE.Vector3(Math.cos(a) * 2.2, 0.7 + Math.sin(a) * 2.2, 0)]),
          lineMat(GREEN, 0.8),
        );
        part(ray, [Math.cos(a) * 0.6, Math.sin(a) * 0.6, 0]);
      }
      root.position.y = -0.2;
      return { root, update: (t, open) => animate(t, () => (root.rotation.y = Math.sin(t * 0.4) * 0.6), open) };
    },

    compass() {
      const { root, part, animate } = exploder(0.5);
      part(solid(new THREE.CylinderGeometry(2.2, 2.2, 0.25, 48), INK, 0.7, 0.04), [0, -1.1, 0]); // base
      const dial = new THREE.Group();
      dial.add(edges(new THREE.TorusGeometry(2, 0.08, 6, 64).rotateX(Math.PI / 2), INK, 0.9, 30));
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const len = i % 9 === 0 ? 0.4 : 0.18;
        dial.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * 1.85, 0, Math.sin(a) * 1.85), new THREE.Vector3(Math.cos(a) * (1.85 - len), 0, Math.sin(a) * (1.85 - len))]), lineMat(i % 9 === 0 ? GREEN : INK, 0.8)));
      }
      part(dial, [0, 0, 0]);
      const needle = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(0, 1.5);
      shape.lineTo(0.22, 0);
      shape.lineTo(0, -1.5);
      shape.lineTo(-0.22, 0);
      shape.closePath();
      const blade = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false }).rotateX(-Math.PI / 2);
      needle.add(solid(blade, BLUE, 0.95, 0.15));
      needle.add(solid(new THREE.SphereGeometry(0.16, 12, 8), GREEN, 0.9, 0.15));
      part(needle, [0, 1, 0]);
      part(edges(new THREE.CylinderGeometry(2.05, 2.05, 0.05, 48), INK, 0.35), [0, 2, 0]); // glass cover
      root.rotation.x = 0.7;
      return {
        root,
        update: (t, open) =>
          animate(
            t,
            (o) => {
              needle.rotation.y = Math.sin(t * 0.9) * 0.6 + Math.sin(t * 2.3) * 0.12 + o * 0.8;
              root.rotation.y = t * 0.15;
            },
            open,
          ),
      };
    },

    building() {
      const { root, part, animate } = exploder(0.5);
      part(solid(new THREE.BoxGeometry(4, 0.2, 2.8), INK, 0.8, 0.04), [0, -1.2, 0]); // ground slab
      for (let i = 0; i < 3; i++) {
        const floor = new THREE.Group();
        floor.add(solid(new THREE.BoxGeometry(3.4, 0.12, 2.3), i === 1 ? GREEN : INK, 0.85, 0.05));
        for (const x of [-1.6, 1.6]) for (const z of [-1.05, 1.05]) floor.add(edges(new THREE.BoxGeometry(0.1, 0.8, 0.1).translate(x, 0.45, z), INK, 0.6));
        const rack = edges(new THREE.BoxGeometry(0.6, 0.65, 0.5).translate(-1, 0.4, 0.3), BLUE, 0.9);
        const bench = edges(new THREE.BoxGeometry(1.1, 0.08, 0.5).translate(0.7, 0.4, -0.4), INK, 0.8);
        floor.add(rack, bench);
        floor.position.y = -0.7 + i * 0.95;
        part(floor, [0, (i - 1) * 0.9 + 0.3, 0]);
      }
      part(solid(new THREE.BoxGeometry(3.6, 0.14, 2.5), INK, 0.8, 0.04), [0, 1.8, 0]).position.y = 2.2; // roof
      root.rotation.set(0.35, 0.6, 0);
      root.scale.setScalar(0.78); // exploded floors run tall; keep the roof in frame
      return { root, update: (t, open) => animate(t, () => (root.rotation.y = 0.6 + Math.sin(t * 0.35) * 0.5), open) };
    },

    coins() {
      const { root, part, animate } = exploder(0.5);
      for (let i = 0; i < 6; i++) {
        const coin = new THREE.Group();
        coin.add(solid(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 32), i % 2 ? GREEN : INK, 0.9, 0.08));
        coin.add(edges(new THREE.TorusGeometry(0.62, 0.02, 4, 32).rotateX(Math.PI / 2).translate(0, 0.11, 0), INK, 0.5, 30));
        coin.position.set(-1.1, -1.2 + i * 0.24, 0);
        part(coin, [Math.sin(i) * 0.3, i * 0.22, Math.cos(i * 1.3) * 0.25]);
      }
      // Bar chart rising next to the stack.
      const bars = [0.6, 1.1, 1.6, 2.3].map((h, i) => {
        const bar = solid(new THREE.BoxGeometry(0.34, h, 0.34).translate(0, h / 2, 0), i === 3 ? BLUE : INK, 0.85, 0.08);
        bar.position.set(0.5 + i * 0.5, -1.3, 0);
        root.add(bar);
        return bar;
      });
      const arrow = new THREE.Line(new THREE.BufferGeometry().setFromPoints([[0.3, -0.2], [0.9, 0.3], [1.4, 0.1], [2.3, 1.4]].map(([x, y]) => new THREE.Vector3(x, y, 0.4))), lineMat(GREEN, 1));
      root.add(arrow);
      root.rotation.set(0.3, 0.45, 0);
      return {
        root,
        update: (t, open) =>
          animate(
            t,
            (o) => {
              bars.forEach((bar, i) => (bar.scale.y = 0.55 + 0.45 * Math.min(1, o * 1.5 + i * 0.1)));
              root.rotation.y = 0.45 + Math.sin(t * 0.3) * 0.45;
            },
            open,
          ),
      };
    },

    pillars() {
      const { root, part, animate } = exploder(0.5);
      for (let i = 0; i < 3; i++) {
        part(solid(new THREE.BoxGeometry(4 - i * 0.35, 0.18, 2.4 - i * 0.3), INK, 0.8, 0.04), [0, -0.5 + i * 0.1, 0]).position.y = -1.4 + i * 0.18;
      }
      const columns = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const x = -1.4 + i * 0.7;
        columns.add(edges(new THREE.CylinderGeometry(0.16, 0.18, 2, 12).translate(x, -0.1, 0.5), i === 2 ? GREEN : INK, 0.85, 20));
        columns.add(edges(new THREE.CylinderGeometry(0.16, 0.18, 2, 12).translate(x, -0.1, -0.5), INK, 0.4, 20));
      }
      part(columns, [0, 0, 0]);
      part(solid(new THREE.BoxGeometry(3.7, 0.2, 1.7), INK, 0.85, 0.04), [0, 0.6, 0]).position.y = 1;
      const roof = new THREE.Shape();
      roof.moveTo(-1.95, 0);
      roof.lineTo(1.95, 0);
      roof.lineTo(0, 0.8);
      roof.closePath();
      const pediment = solid(new THREE.ExtrudeGeometry(roof, { depth: 1.7, bevelEnabled: false }).translate(0, 0, -0.85), BLUE, 0.9, 0.1);
      part(pediment, [0, 1.2, 0]).position.y = 1.1;
      root.rotation.set(0.25, 0.55, 0);
      return { root, update: (t, open) => animate(t, () => (root.rotation.y = 0.55 + Math.sin(t * 0.3) * 0.5), open) };
    },
  };

  const { root, update } = builders[kind]();
  const tiltGroup = new THREE.Group(); // pointer tilt, on top of the object's own pose
  tiltGroup.add(root);
  scene.add(tiltGroup);

  // Keep the drawing buffer and camera matched to the canvas's displayed size.
  const fit = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  const resize = new ResizeObserver(fit);
  resize.observe(canvas);

  let frame;
  const t0 = performance.now();
  const loop = () => {
    update((performance.now() - t0) / 1000);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };

  const REST = 2; // time of the resting pose used for the first/static frame
  update(REST, interactive ? 0 : undefined);
  fit();

  if (interactive) {
    // Hover-driven: ease openness and tilt toward their targets, rendering
    // only while something is still moving.
    const now = { open: 0, x: 0, y: 0 };
    const goal = { open: 0, x: 0, y: 0 };
    const step = () => {
      let moving = false;
      for (const k of ['open', 'x', 'y']) {
        now[k] += (goal[k] - now[k]) * 0.08;
        if (Math.abs(goal[k] - now[k]) > 0.001) moving = true;
        else now[k] = goal[k];
      }
      update(REST, now.open);
      tiltGroup.rotation.set(now.y * 0.25, now.x * 0.45, 0);
      renderer.render(scene, camera);
      frame = moving ? requestAnimationFrame(step) : undefined;
    };
    const kick = () => (frame ??= requestAnimationFrame(step));
    return {
      explode(on) {
        goal.open = on ? 1 : 0;
        kick();
      },
      tilt(x, y) {
        goal.x = x;
        goal.y = y;
        kick();
      },
      dispose() {
        cancelAnimationFrame(frame);
        resize.disconnect();
        renderer.dispose();
        renderer.forceContextLoss();
      },
    };
  }

  return {
    start() {
      if (still || frame) return;
      frame = requestAnimationFrame(loop);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = undefined;
    },
    dispose() {
      this.stop();
      resize.disconnect();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
