import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCcw,
  Hand,
  MousePointer2,
  Sparkles,
  PackageOpen,
  Flame,
  Cookie,
} from "lucide-react";
const SNACKS = [
  {
    id: "cookie",
    name: "Chocolate chip cookie",
    short: "The classic cookie",
    texture: "Crisp edges. A soft centre.",
    category: "SWEET & CRUMBLY",
    color: "#ebd8bb",
    accent: "#b98a4c",
    bites: 5,
    calories: 190,
    protein: 2,
    carbs: 26,
    fats: 9,
    serving: "1 cookie · approx. 40 g",
  },
  {
    id: "chips",
    name: "Sea salt crisps",
    short: "A satisfying crunch",
    texture: "Golden. Light. Perfectly crisp.",
    category: "SALTY & CRUNCHY",
    color: "#ece4bd",
    accent: "#b49d4b",
    bites: 6,
    calories: 160,
    protein: 2,
    carbs: 15,
    fats: 10,
    serving: "1 small portion · approx. 28 g",
  },
  {
    id: "chocolate",
    name: "Dark chocolate",
    short: "A little dark chocolate",
    texture: "A clean snap. A slow melt.",
    category: "RICH & SMOOTH",
    color: "#dfcec8",
    accent: "#8b6255",
    bites: 6,
    calories: 170,
    protein: 2,
    carbs: 13,
    fats: 12,
    serving: "1 small bar · approx. 30 g",
  },
  {
    id: "donut",
    name: "Strawberry doughnut",
    short: "A soft little moment",
    texture: "Fluffy dough. Strawberry glaze.",
    category: "SOFT & SWEET",
    color: "#eed7db",
    accent: "#bf8695",
    bites: 5,
    calories: 260,
    protein: 4,
    carbs: 34,
    fats: 12,
    serving: "1 doughnut · approx. 70 g",
  },
];
export const DEFAULT_SIMULATION = {
  snack: "cookie",
  opened: false,
  bites: 0,
  completed: 0,
  totalBites: 0,
  sound: false,
};
export default function SnackSimulation({ value, onChange, onLog }) {
  const state = { ...DEFAULT_SIMULATION, ...value };
  const snack = SNACKS.find((s) => s.id === state.snack) || SNACKS[0],
    finished = state.bites >= snack.bites;
  const [particles, setParticles] = useState([]),
    [biting, setBiting] = useState(false),
    [stage, setStage] = useState("");
  const audioRef = useRef(null),
    lock = useRef(false),
    timers = useRef([]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      audioRef.current?.close().catch(() => {});
    },
    [],
  );
  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  const sound = () => {
    if (!state.sound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioRef.current || (audioRef.current = new AudioCtx());
      ctx.resume();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate),
        data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
      const source = ctx.createBufferSource(),
        filter = ctx.createBiquadFilter(),
        gain = ctx.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value =
        snack.id === "chocolate" ? 1400 : snack.id === "donut" ? 650 : 3500;
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch {
      /* Sound is optional. The simulation works without audio. */
    }
  };
  const choose = (id) => {
    if (lock.current) return;
    onChange({ ...state, snack: id, bites: 0, opened: false });
    setStage("");
    setParticles([]);
  };
  const unwrap = () => {
    onChange({ ...state, opened: true });
    setStage("unwrapped");
    sound();
  };
  const bite = () => {
    if (!state.opened) {
      unwrap();
      return;
    }
    if (finished || lock.current) return;
    lock.current = true;
    const next = state.bites + 1;
    onChange({
      ...state,
      bites: next,
      totalBites: state.totalBites + 1,
      completed: state.completed + (next === snack.bites ? 1 : 0),
    });
    sound();
    setBiting(true);
    setStage(
      next === snack.bites ? "complete" : next % 2 ? "crunch" : "savour",
    );
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        x: (Math.random() - 0.5) * 260,
        y: Math.random() * 130 + 30,
        rotate: Math.random() * 360,
        size: Math.random() * 5 + 3,
      })),
    );
    later(() => {
      setBiting(false);
      lock.current = false;
    }, 360);
    later(() => setParticles([]), 1000);
  };
  const reset = () => {
    if (lock.current) return;
    onChange({ ...state, bites: 0, opened: false });
    setStage("");
    setParticles([]);
  };
  return (
    <>
      <section className="snack-intro">
        <div>
          <span className="eyebrow">
            <Sparkles size={12} /> A LITTLE JOY, JUST FOR YOU
          </span>
          <h2>
            Big cravings.
            <br />
            <em>Little moments.</em>
          </h2>
          <p>
            Pick something you love. Unwrap, take a bite,
            <br />
            and enjoy a small, playful pause.
          </p>
        </div>
        <div className="break-summary">
          <span className="coach-icon">
            <Cookie size={23} />
          </span>
          <div>
            <strong>{state.completed}</strong>
            <small>little breaks enjoyed</small>
          </div>
          <span className="summary-line-art" />
        </div>
      </section>
      <div className="simulation-layout">
        <section className="snack-menu panel">
          <div className="card-top">
            <h3>What sounds good?</h3>
            <span className="subtle">04 LITTLE JOYS</span>
          </div>
          <div className="snack-options">
            {SNACKS.map((s) => (
              <button
                key={s.id}
                className={
                  "snack-option " + (snack.id === s.id ? "selected" : "")
                }
                onClick={() => choose(s.id)}
                aria-pressed={snack.id === s.id}
              >
                <span
                  className="snack-thumb"
                  style={{ background: "#f2f2f2" }}
                >
                  <FoodArt id={s.id} bites={0} total={s.bites} miniature />
                </span>
                <span>
                  <small>{s.category}</small>
                  <strong>{s.short}</strong>
                  <span>{s.texture}</span>
                </span>
                {snack.id === s.id ? (
                  <span className="selection-check">
                    <Check size={12} />
                  </span>
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            ))}
          </div>
          <div className="virtual-note">
            <span>
              <Sparkles size={15} />
            </span>
            <p>
              A virtual treat. A real moment to pause.
              <small>No calories are added to your food journal.</small>
            </p>
          </div>
        </section>
        <section
          className={"snack-stage " + (finished ? "finished" : "")}
          style={{
            "--snack-color": "#e5e5e5",
            "--snack-accent": "#707070",
          }}
        >
          <div className="stage-top">
            <span className="stage-badge">
              <span />
              THE LITTLE BREAK ROOM
            </span>
            <div>
              <button
                className="icon-button"
                aria-label={
                  state.sound ? "Mute snack sounds" : "Enable snack sounds"
                }
                aria-pressed={state.sound}
                onClick={() => onChange({ ...state, sound: !state.sound })}
              >
                {state.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
              <button
                className="icon-button"
                aria-label="Restart snack"
                onClick={reset}
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
          <div className="stage-title">
            <span>{snack.category}</span>
            <h3>{finished ? "A little moment, well spent." : snack.name}</h3>
            <p>
              {finished
                ? "No score to chase. Just a little joy."
                : state.opened
                  ? "Click the snack, or press Space, to take a bite."
                  : "A small pause is always a good idea."}
            </p>
          </div>
          <div className="snack-scene">
            <div className="scene-orbit" />
            <div className="scene-orbit second" />
            <div className="snack-plate" />
            <button
              className={
                "food-interaction " +
                (biting ? "biting" : "") +
                " " +
                (state.opened ? "opened" : "wrapped")
              }
              onClick={bite}
              disabled={finished}
              aria-label={
                state.opened
                  ? "Take a bite of " + snack.name
                  : "Unwrap " + snack.name
              }
            >
              {!state.opened ? (
                <div className="snack-package">
                  <div className="package-crimp top" />
                  <div className="package-brand">
                    GO<span>THE LITTLE BREAK CO.</span>
                  </div>
                  <div className="package-snack">
                    <FoodArt
                      id={snack.id}
                      bites={0}
                      total={snack.bites}
                      miniature
                    />
                  </div>
                  <div className="package-caption">
                    <strong>{snack.name}</strong>
                    <span>A LITTLE SOMETHING GOOD.</span>
                  </div>
                  <div className="package-crimp bottom" />
                </div>
              ) : (
                <div className="food-art-wrap">
                  <FoodArt
                    id={snack.id}
                    bites={state.bites}
                    total={snack.bites}
                  />
                </div>
              )}
            </button>
            {particles.map((c) => (
              <i
                className="snack-crumb"
                key={c.id}
                style={{
                  "--dx": c.x + "px",
                  "--dy": c.y + "px",
                  "--rotation": c.rotate + "deg",
                  width: c.size,
                  height: c.size * 0.7,
                }}
              />
            ))}
            {finished && (
              <div className="snack-complete">
                <span>
                  <Check size={28} />
                </span>
                <small>THAT WAS A GOOD LITTLE BREAK.</small>
              </div>
            )}
            {state.opened && !finished && (
              <span className={"bite-caption " + (stage ? "show" : "")}>
                {stage === "crunch"
                  ? snack.id === "chocolate"
                    ? "Snap. A little happiness."
                    : "Crunch. That’s the moment."
                  : stage === "savour"
                    ? "No rush. Savour the little things."
                    : "Your little break starts here."}
              </span>
            )}
          </div>
          <div className="stage-controls">
            <div className="bite-progress">
              <span>
                {state.opened
                  ? `${Math.min(state.bites, snack.bites)} / ${snack.bites} bites`
                  : "YOUR LITTLE PAUSE, READY TO UNWRAP"}
              </span>
              <div>
                {Array.from({ length: snack.bites }, (_, i) => (
                  <i key={i} className={i < state.bites ? "done" : ""} />
                ))}
              </div>
            </div>
            {finished ? (
              <button className="primary-button" onClick={reset}>
                Enjoy another moment <RotateCcw size={14} />
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={state.opened ? bite : unwrap}
              >
                {state.opened ? "Take a bite" : "Unwrap your snack"}
                {state.opened ? (
                  <Cookie size={16} />
                ) : (
                  <PackageOpen size={16} />
                )}
              </button>
            )}
          </div>
          <div className="stage-footer">
            <MousePointer2 size={12} />{" "}
            {state.opened
              ? "Click the snack or use the button. Space works too."
              : "Tap the package to open your little break."}
            <span>SOUND {state.sound ? "ON" : "OFF"}</span>
          </div>
        </section>
      </div>
      <section className="snack-reality panel">
        <div className="snack-reality-icon">
          <UtensilsIcon />
        </div>
        <div>
          <h3>Enjoying the real thing too?</h3>
          <p>
            This simulation is just for play. Only log a serving if you actually
            ate it.
          </p>
          <span>
            {snack.serving} · estimated {snack.calories} kcal
          </span>
        </div>
        <button
          className="secondary-button"
          onClick={() =>
            onLog({
              name: snack.name,
              category: "Snack",
              calories: snack.calories,
              protein: snack.protein,
              carbs: snack.carbs,
              fats: snack.fats,
            })
          }
        >
          Log a real serving <ArrowUpRight size={15} />
        </button>
      </section>
      <div className="snack-bottom-note">
        <Sparkles size={13} />
        <span>
          Food can be joyful. This playful simulation makes no claims about
          reducing hunger or replacing a meal.
        </span>
      </div>
    </>
  );
}
function UtensilsIcon() {
  return <Cookie size={21} />;
}
function FoodArt({ id, bites, total, miniature = false }) {
  const mask = `bite-mask-${id}-${miniature ? "mini" : "full"}`,
    gradient = `food-${id}-${miniature ? "mini" : "full"}`,
    full = bites >= total;
  const positions = [
    [245, 45],
    [270, 125],
    [225, 210],
    [112, 255],
    [35, 175],
    [30, 65],
  ];
  return (
    <svg className={"food-svg " + id} viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <radialGradient id={gradient} cx="38%" cy="28%" r="78%">
          {id === "chocolate" ? (
            <>
              <stop stopColor="#845647" />
              <stop offset=".65" stopColor="#4e3029" />
              <stop offset="1" stopColor="#301d1a" />
            </>
          ) : (
            <>
              <stop stopColor="#f3d99d" />
              <stop offset=".6" stopColor="#dcae66" />
              <stop offset="1" stopColor="#ad7537" />
            </>
          )}
        </radialGradient>
        <mask id={mask}>
          <rect width="300" height="300" fill={full ? "black" : "white"} />
          {!full &&
            positions.slice(0, bites).map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="66" fill="black" />
                {Array.from({ length: 7 }, (_, j) => {
                  const angle = (j / 7) * Math.PI * 2;
                  return (
                    <circle
                      key={j}
                      cx={x + Math.cos(angle) * 61}
                      cy={y + Math.sin(angle) * 61}
                      r="11"
                      fill="black"
                    />
                  );
                })}
              </g>
            ))}
        </mask>
      </defs>
      <g mask={`url(#${mask})`}>
        {id === "cookie" ? (
          <g>
            <ellipse cx="151" cy="158" rx="118" ry="115" fill="#8c582a" />
            <circle
              cx="149"
              cy="148"
              r="116"
              fill={`url(#${gradient})`}
              stroke="#bd8746"
              strokeWidth="3"
            />
            <circle
              cx="147"
              cy="144"
              r="103"
              fill="none"
              stroke="#f5d997"
              strokeOpacity=".35"
              strokeWidth="4"
            />
            {Array.from({ length: 65 }, (_, i) => {
              const a = i * 2.39996,
                r = Math.sqrt(i / 65) * 104;
              return (
                <circle
                  key={i}
                  cx={148 + Math.cos(a) * r}
                  cy={148 + Math.sin(a) * r}
                  r={(i % 3) + 1}
                  fill={i % 2 ? "#c58d49" : "#f6dfa8"}
                  opacity=".6"
                />
              );
            })}
            {[
              [102, 72, 13],
              [168, 68, 10],
              [208, 107, 14],
              [76, 124, 11],
              [133, 123, 16],
              [174, 157, 12],
              [103, 192, 15],
              [204, 201, 11],
              [151, 231, 10],
              [65, 189, 8],
              [231, 153, 9],
            ].map(([x, y, r], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
                <path
                  d={`M${-r} ${-r * 0.5} Q${-r * 0.7} ${-r} 0 ${-r} L${r * 0.8} ${-r * 0.6} L${r} ${r * 0.5} Q${r * 0.2} ${r} ${-r * 0.8} ${r * 0.6}Z`}
                  fill="#51352b"
                />
                <path
                  d={`M${-r * 0.7} ${-r * 0.5}L0 ${-r * 0.8}L${r * 0.6} ${-r * 0.4}`}
                  fill="none"
                  stroke="#89614a"
                  strokeWidth="2"
                />
              </g>
            ))}
          </g>
        ) : id === "chocolate" ? (
          <g transform="rotate(-10 150 150)">
            <rect
              x="55"
              y="35"
              width="195"
              height="240"
              rx="8"
              fill="#38221e"
            />
            {Array.from({ length: 6 }, (_, i) => {
              const x = 61 + (i % 2) * 93,
                y = 41 + Math.floor(i / 2) * 75;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width="87"
                    height="69"
                    rx="5"
                    fill={`url(#${gradient})`}
                    stroke="#2e1b18"
                    strokeWidth="3"
                  />
                  <path
                    d={`M${x + 4} ${y + 58}V${y + 6}h76`}
                    fill="none"
                    stroke="#b38167"
                    strokeOpacity=".4"
                    strokeWidth="3"
                  />
                  <rect
                    x={x + 12}
                    y={y + 12}
                    width="63"
                    height="44"
                    rx="3"
                    fill="none"
                    stroke="#4b2e26"
                    strokeWidth="2"
                  />
                  <text
                    x={x + 43}
                    y={y + 39}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#b38971"
                    opacity=".55"
                    fontFamily="sans-serif"
                    fontWeight="700"
                  >
                    GO
                  </text>
                </g>
              );
            })}
          </g>
        ) : id === "chips" ? (
          <g>
            {[
              [98, 91, -25],
              [187, 90, 28],
              [150, 139, 6],
              [87, 183, -35],
              [202, 183, 30],
              [151, 221, -8],
            ].map(([x, y, rot], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
                <path
                  d="M-53 13C-65-31-41-62 1-58S63-24 55 14C48 50 16 68-20 55S-53 34-53 13Z"
                  fill="#9d7834"
                  opacity=".25"
                  transform="translate(4 7)"
                />
                <path
                  d="M-53 13C-65-31-41-62 1-58S63-24 55 14C48 50 16 68-20 55S-53 34-53 13Z"
                  fill={`url(#${gradient})`}
                  stroke="#c49a4d"
                  strokeWidth="1.5"
                />
                {Array.from({ length: 8 }, (_, j) => (
                  <path
                    key={j}
                    d={`M${-39 + j * 11} -35 Q${-50 + j * 12} 5 ${-36 + j * 10} 42`}
                    stroke="#a77831"
                    opacity=".23"
                    fill="none"
                    strokeWidth="2"
                  />
                ))}
                {Array.from({ length: 12 }, (_, j) => (
                  <circle
                    key={j}
                    cx={Math.sin(j * 3.8 + i) * 38}
                    cy={Math.cos(j * 2.2) * 40}
                    r="1.7"
                    fill="#fff2c3"
                    opacity=".7"
                  />
                ))}
              </g>
            ))}
          </g>
        ) : (
          <g>
            <ellipse cx="151" cy="161" rx="116" ry="107" fill="#b98349" />
            <ellipse
              cx="149"
              cy="146"
              rx="116"
              ry="107"
              fill={`url(#${gradient})`}
            />
            <path
              d="M41 139C39 99 75 51 126 43S235 67 253 111C268 146 254 185 229 213C215 225 209 208 197 217C177 236 158 221 142 231C122 239 118 219 100 221C75 220 78 199 63 198C42 194 47 170 41 139ZM116 145C116 126 128 114 146 113S185 126 185 145S168 178 149 177S116 163 116 145Z"
              fill="#da9cab"
              stroke="#d18c9d"
              strokeWidth="2"
              fillRule="evenodd"
            />
            <path
              d="M55 123C62 82 102 56 140 54"
              fill="none"
              stroke="#f4cbd2"
              strokeWidth="6"
              strokeLinecap="round"
              opacity=".55"
            />
            {Array.from({ length: 27 }, (_, i) => {
              const a = i * 2.39996,
                r = 59 + (i % 3) * 16,
                x = 149 + Math.cos(a) * r,
                y = 143 + Math.sin(a) * r * 0.9;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="9"
                  height="3"
                  rx="1.5"
                  fill={["#faf0ce", "#94724b", "#faf7ee", "#b8ca83"][i % 4]}
                  transform={`rotate(${i * 41} ${x} ${y})`}
                />
              );
            })}
            <ellipse cx="149" cy="145" rx="33" ry="29" fill="#c89454" />
            <ellipse cx="149" cy="149" rx="26" ry="22" fill="#f0dfc0" />
            <path
              d="M126 151Q149 129 174 151Q168 171 149 173Q131 170 126 151"
              fill="#e9dbbf"
            />
          </g>
        )}
      </g>
    </svg>
  );
}
