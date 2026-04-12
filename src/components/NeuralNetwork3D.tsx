import { useRef, useEffect } from "react";

interface Node {
  x: number; y: number; vx: number; vy: number;
  type: "A" | "B" | "C"; radius: number; opacity: number;
  maxSpeed: number; pulseOffset: number; connections: number[];
  baseOpacity: number; brightnessBoost: number; hoverScale: number;
}

interface Signal {
  fromIdx: number; toIdx: number; progress: number; speed: number;
  trail: { x: number; y: number }[];
  burst: { x: number; y: number; vx: number; vy: number; opacity: number }[] | null;
}

interface ClickRipple {
  x: number; y: number; radius: number; opacity: number;
}

interface TempConnection {
  i: number; j: number; opacity: number; fading: boolean;
}

const A_COUNT = 15;
const B_COUNT = 60;
const AB_COUNT = A_COUNT + B_COUNT;

const NeuralNetwork3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const signalsRef = useRef<Signal[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const lastSignalRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const ripplesRef = useRef<ClickRipple[]>([]);
  const tempConnsRef = useRef<TempConnection[]>([]);
  const lastMouseMoveRef = useRef(0);
  const stationarySinceRef = useRef(0);
  const tempConnsFormedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createNodes = () => {
      const { w, h } = sizeRef.current;
      const nodes: Node[] = [];

      const cols = 5, rows = 3;
      for (let i = 0; i < A_COUNT; i++) {
        const gi = i % (cols * rows);
        const col = gi % cols, row = Math.floor(gi / cols);
        const cellW = w / cols, cellH = h / rows;
        const opacity = 1;
        nodes.push({
          x: cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.6,
          y: cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.6,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          type: "A", radius: 4, opacity, baseOpacity: opacity, maxSpeed: 0.15,
          pulseOffset: Math.random() * 6, connections: [],
          brightnessBoost: 0, hoverScale: 1,
        });
      }

      for (let i = 0; i < B_COUNT; i++) {
        const opacity = 0.9;
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          type: "B", radius: 2, opacity, baseOpacity: opacity, maxSpeed: 0.2,
          pulseOffset: 0, connections: [],
          brightnessBoost: 0, hoverScale: 1,
        });
      }

      for (let i = 0; i < 120; i++) {
        const opacity = 0.4;
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
          type: "C", radius: 1, opacity, baseOpacity: opacity, maxSpeed: 0.08,
          pulseOffset: 0, connections: [],
          brightnessBoost: 0, hoverScale: 1,
        });
      }

      nodesRef.current = nodes;
    };

    resize();
    createNodes();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      lastMouseMoveRef.current = performance.now();

      // If cursor moved, fade out temp connections
      if (tempConnsFormedRef.current) {
        for (const tc of tempConnsRef.current) {
          tc.fading = true;
        }
        tempConnsFormedRef.current = false;
      }
      stationarySinceRef.current = performance.now();
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      for (const tc of tempConnsRef.current) tc.fading = true;
      tempConnsFormedRef.current = false;
    };

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 1 });
      // Brightness boost for nearby nodes
      const nodes = nodesRef.current;
      for (const n of nodes) {
        const dx = n.x - e.clientX, dy = n.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          n.brightnessBoost = 0.4 * (1 - dist / 120);
        }
      }
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);

    let hidden = false;
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) { lastFrame = 0; animRef.current = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    const onResize = () => {
      const oldW = sizeRef.current.w, oldH = sizeRef.current.h;
      resize();
      const { w, h } = sizeRef.current;
      if (oldW && oldH) {
        for (const n of nodesRef.current) {
          n.x = (n.x / oldW) * w;
          n.y = (n.y / oldH) * h;
        }
      }
    };
    window.addEventListener("resize", onResize);

    let lastFrame = 0;

    const loop = (time: number) => {
      if (hidden) return;

      if (lastFrame && time - lastFrame > 20) {
        lastFrame = time;
        animRef.current = requestAnimationFrame(loop);
        return;
      }
      lastFrame = time;

      const nodes = nodesRef.current;
      const { w, h } = sizeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Update positions + attraction effect
      for (const n of nodes) {
        n.vx += (Math.random() - 0.5) * 0.01;
        n.vy += (Math.random() - 0.5) * 0.01;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > n.maxSpeed) {
          n.vx = (n.vx / speed) * n.maxSpeed;
          n.vy = (n.vy / speed) * n.maxSpeed;
        }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; }
        if (n.x > w) { n.x = w; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; }
        if (n.y > h) { n.y = h; n.vy *= -1; }

        // Mouse repulsion
        const dx = n.x - mx, dy = n.y - my;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 180 && md > 0) {
          const force = 0.6 * (1 - md / 180);
          n.vx += (dx / md) * force;
          n.vy += (dy / md) * force;
        }

        // Decay brightness boost
        if (n.brightnessBoost > 0) {
          n.brightnessBoost = Math.max(0, n.brightnessBoost - 0.008);
        }

        // Decay hover scale
        if (n.type === "A") {
          const adx = n.x - mx, ady = n.y - my;
          const aDist = Math.sqrt(adx * adx + ady * ady);
          const targetScale = aDist < 30 ? 1.8 : 1;
          n.hoverScale += (targetScale - n.hoverScale) * 0.15;
        }

        // Current opacity = base + boost
        n.opacity = Math.min(1, n.baseOpacity + n.brightnessBoost);
      }

      // Attraction: nodes within 150px of cursor pull toward neighbors
      if (mx > -1000) {
        for (let i = 0; i < AB_COUNT; i++) {
          const n = nodes[i];
          const dx = n.x - mx, dy = n.y - my;
          const distToCursor = Math.sqrt(dx * dx + dy * dy);
          if (distToCursor < 150) {
            const strength = 0.02 * (1 - distToCursor / 150);
            for (const ji of n.connections) {
              const neighbor = nodes[ji];
              const ndx = neighbor.x - n.x, ndy = neighbor.y - n.y;
              const nDist = Math.sqrt(ndx * ndx + ndy * ndy);
              if (nDist > 20) {
                n.vx += (ndx / nDist) * strength;
                n.vy += (ndy / nDist) * strength;
              }
            }
          }
        }
      }

      // Stationary cursor → temp connections to nearest Type A neurons
      const now = performance.now();
      if (mx > -1000 && !tempConnsFormedRef.current && now - stationarySinceRef.current > 500) {
        // Find 4 nearest Type A neurons
        const dists: { idx: number; dist: number }[] = [];
        for (let i = 0; i < A_COUNT; i++) {
          const dx = nodes[i].x - mx, dy = nodes[i].y - my;
          dists.push({ idx: i, dist: Math.sqrt(dx * dx + dy * dy) });
        }
        dists.sort((a, b) => a.dist - b.dist);
        const nearest = dists.slice(0, 4);
        // Connect them pairwise
        tempConnsRef.current = [];
        for (let a = 0; a < nearest.length; a++) {
          for (let b = a + 1; b < nearest.length; b++) {
            tempConnsRef.current.push({ i: nearest[a].idx, j: nearest[b].idx, opacity: 0, fading: false });
          }
        }
        tempConnsFormedRef.current = true;
      }

      // Update temp connections
      for (let t = tempConnsRef.current.length - 1; t >= 0; t--) {
        const tc = tempConnsRef.current[t];
        if (tc.fading) {
          tc.opacity = Math.max(0, tc.opacity - 0.016);
          if (tc.opacity <= 0) { tempConnsRef.current.splice(t, 1); }
        } else {
          tc.opacity = Math.min(0.6, tc.opacity + 0.025);
        }
      }

      // Rebuild connections among A+B nodes
      for (let i = 0; i < AB_COUNT; i++) nodes[i].connections = [];
      const candidates: [number, number, number][] = [];
      for (let i = 0; i < AB_COUNT; i++) {
        for (let j = i + 1; j < AB_COUNT; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) candidates.push([i, j, dist]);
        }
      }
      candidates.sort((a, b) => a[2] - b[2]);

      const connCount = new Array(AB_COUNT).fill(0);
      const connections: [number, number][] = [];
      for (const [i, j] of candidates) {
        if (connections.length >= 300) break;
        const iMax = nodes[i].type === "A" ? 8 : 4;
        const jMax = nodes[j].type === "A" ? 8 : 4;
        if (connCount[i] < iMax && connCount[j] < jMax) {
          connections.push([i, j]);
          connCount[i]++;
          connCount[j]++;
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }

      // Draw connections
      for (const [i, j] of connections) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNN = a.type === "A" && b.type === "A";

        const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
        const mDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
        const boost = mDist < 180 ? 0.08 : 0;

        if (isNN) {
          ctx.strokeStyle = `rgba(124,111,224,${0.4 + boost})`;
          ctx.lineWidth = 0.8;
        } else {
          const baseOp = 0.15 - (dist / 250) * 0.13;
          ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.02, baseOp) + boost})`;
          ctx.lineWidth = 0.4;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw temp connections (synapse effect)
      for (const tc of tempConnsRef.current) {
        if (tc.opacity <= 0) continue;
        const a = nodes[tc.i], b = nodes[tc.j];
        ctx.strokeStyle = `rgba(91,63,166,${tc.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw nodes
      const tSec = time / 1000;
      for (const n of nodes) {
        const scale = n.type === "A" ? n.hoverScale : 1;
        const r = n.radius * scale;

        if (n.type === "A") {
          // Pulse ring
          const phase = ((tSec + n.pulseOffset) % 2) / 2;
          const ringR = (10 + phase * 20) * scale;
          const ringOp = (scale > 1.3 ? 1 : 0.7) * (1 - phase);
          ctx.beginPath();
          ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(91,63,166,${ringOp})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${n.opacity})`;
        ctx.fill();
      }

      // Click ripples
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rip = ripplesRef.current[r];
        rip.radius += 2;
        rip.opacity -= 0.025;
        if (rip.opacity <= 0) { ripplesRef.current.splice(r, 1); continue; }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(91,63,166,${rip.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Signals
      const signals = signalsRef.current;
      if (time - lastSignalRef.current > 1500 && signals.length < 8) {
        const neuronsWithConns: number[] = [];
        for (let i = 0; i < A_COUNT; i++) {
          if (nodes[i].connections.length > 0) neuronsWithConns.push(i);
        }
        if (neuronsWithConns.length > 0) {
          const fi = neuronsWithConns[Math.floor(Math.random() * neuronsWithConns.length)];
          const ti = nodes[fi].connections[Math.floor(Math.random() * nodes[fi].connections.length)];
          signals.push({ fromIdx: fi, toIdx: ti, progress: 0, speed: 1.5, trail: [], burst: null });
          lastSignalRef.current = time;
        }
      }

      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        const from = nodes[sig.fromIdx], to = nodes[sig.toIdx];
        const dx = to.x - from.x, dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (sig.burst) {
          let allDead = true;
          for (const b of sig.burst) {
            b.x += b.vx; b.y += b.vy; b.opacity -= 0.03;
            if (b.opacity > 0) {
              allDead = false;
              ctx.beginPath();
              ctx.arc(b.x, b.y, 1, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(124,111,224,${b.opacity})`;
              ctx.fill();
            }
          }
          if (allDead) signals.splice(s, 1);
          continue;
        }

        sig.progress += sig.speed / dist;
        const cx = from.x + dx * sig.progress;
        const cy = from.y + dy * sig.progress;

        sig.trail.unshift({ x: cx, y: cy });
        if (sig.trail.length > 5) sig.trail.pop();

        for (let ti = 1; ti < sig.trail.length; ti++) {
          const tr = sig.trail[ti];
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124,111,224,${0.6 - (ti / 5) * 0.5})`;
          ctx.fill();
        }

        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
        grd.addColorStop(0, "rgba(91,63,166,0.5)");
        grd.addColorStop(1, "rgba(91,63,166,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(cx - 10, cy - 10, 20, 20);

        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fill();

        if (sig.progress >= 1) {
          sig.burst = Array.from({ length: 3 }, () => {
            const angle = Math.random() * Math.PI * 2;
            return { x: to.x, y: to.y, vx: Math.cos(angle) * 1.5, vy: Math.sin(angle) * 1.5, opacity: 0.8 };
          });
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    stationarySinceRef.current = performance.now();
    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: "#000000", zIndex: -1 }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
};

export default NeuralNetwork3D;
