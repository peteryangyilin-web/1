import React, { useEffect, useId, useRef, useState, useMemo } from "react";
import { Pause, Play, ChevronDown, ChevronUp, Cat } from "lucide-react";
import { getExerciseDemo, sampleDemoFrames } from "../exerciseDemos";
import "./exerciseDemo.css";

export default function ExerciseDemo({ name, compact = false }) {
  const demo = getExerciseDemo(name),
    ref = useRef(null);
  const [playing, setPlaying] = useState(
      () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [visible, setVisible] = useState(false),
    [expanded, setExpanded] = useState(false),
    [failed, setFailed] = useState(false);
  const detailsId = useId();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "70px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  if (!demo)
    return (
      <div className="custom-demo-note">
        <Cat size={16} />
        <span>Custom exercise — a matching demo isn’t available yet.</span>
      </div>
    );
  const animating = playing && visible;
  return (
    <div
      ref={ref}
      className={
        "exercise-demo " +
        (compact ? "compact " : "") +
        (expanded ? "expanded" : "")
      }
      data-exercise-demo={demo.id}
    >
      <div className="exercise-demo-preview">
        <div className="demo-visual">
          {failed ? (
            <CatAnimation demo={demo} paused={!animating} />
          ) : (
            <img
              src={`/exercises/${demo.id}${animating ? ".gif" : ".png"}`}
              alt={`Cat coach demonstrating ${demo.title}`}
              loading="lazy"
              width="300"
              height="220"
              onError={() => setFailed(true)}
            />
          )}
          <span className="cat-coach-label">
            <Cat size={10} />
            GO CAT COACH
          </span>
          <button
            className="demo-play"
            aria-label={`${playing ? "Pause" : "Play"} ${name} demo`}
            aria-pressed={playing}
            onClick={() => setPlaying((v) => !v)}
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
        <div className="demo-summary">
          <span className="demo-eyebrow">A LITTLE COACHING, EVERY REP</span>
          <strong>{demo.title}</strong>
          <div className="demo-phases">
            {demo.phases.map((phase, i) => (
              <span key={phase}>
                <i>{i + 1}</i>
                {phase}
              </span>
            ))}
          </div>
          <button
            className="demo-details"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide form tips" : "How to do it"}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="demo-instructions" id={detailsId}>
          <h4>Move with a little more confidence.</h4>
          <ol>
            {demo.cues.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <p>
            One loop shows the movement, not a prescribed tempo. Use a
            comfortable range and stop if it hurts.
          </p>
        </div>
      )}
    </div>
  );
}

export function CatAnimation({ demo, paused = false }) {
  const ref = useRef(null),
    frames = useMemo(() => sampleDemoFrames(demo), [demo]);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    paused ? svg.pauseAnimations() : svg.unpauseAnimations();
  }, [paused]);
  const values = (fn) => frames.map(fn).join(";");
  const animation = (attribute, fn) => (
    <animate
      attributeName={attribute}
      values={values(fn)}
      dur={`${demo.duration}s`}
      repeatCount="indefinite"
      calcMode="linear"
    />
  );
  const shoulder = (p, side) =>
    p[side + "Shoulder"] || [
      p.shoulder[0] + (side === "left" ? -12 : 12),
      p.shoulder[1] + 2,
    ];
  const line = (a, b) => `M${a.join(",")} L${b.join(",")}`;
  const motionPath = (fn, props = {}) => (
    <path d={fn(frames[0])} {...props}>
      {animation("d", fn)}
    </path>
  );
  const wristCenter = (p) => [
    (p.leftWrist[0] + p.rightWrist[0]) / 2,
    (p.leftWrist[1] + p.rightWrist[1]) / 2,
  ];
  const translate = (p, key) => p[key].join(" ");
  const movable = (key, content) => (
    <g key={key} transform={`translate(${translate(frames[0], key)})`}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={values((p) => translate(p, key))}
        dur={`${demo.duration}s`}
        repeatCount="indefinite"
        calcMode="linear"
      />
      {content}
    </g>
  );
  const bone = (from, to, part, width, extra = 14) => {
    const length = (p) =>
      Math.hypot(to(p)[0] - from(p)[0], to(p)[1] - from(p)[1]);
    const angle = (p) =>
      (Math.atan2(to(p)[1] - from(p)[1], to(p)[0] - from(p)[0]) * 180) /
        Math.PI -
      90;
    const rotations = frames.map(angle);
    for (let i = 1; i < rotations.length; i++) {
      while (rotations[i] - rotations[i - 1] > 180) rotations[i] -= 360;
      while (rotations[i] - rotations[i - 1] < -180) rotations[i] += 360;
    }
    return (
      <g transform={`translate(${from(frames[0]).join(" ")})`}>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={values((p) => from(p).join(" "))}
          dur={`${demo.duration}s`}
          repeatCount="indefinite"
        />
        <g transform={`rotate(${angle(frames[0])})`}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={rotations.join(";")}
            dur={`${demo.duration}s`}
            repeatCount="indefinite"
          />
          <FurSprite
            part={part}
            x={-width / 2}
            y={-extra / 2}
            width={width}
            height={length(frames[0]) + extra}
          >
            {animation("height", (p) => length(p) + extra)}
          </FurSprite>
        </g>
      </g>
    );
  };
  const furryLimb = (side, type) => (
    <g key={side + type}>
      {bone(
        (p) =>
          type === "arm"
            ? shoulder(p, side)
            : [p.hip[0] + (side === "left" ? -8 : 8), p.hip[1]],
        (p) => p[side + (type === "arm" ? "Elbow" : "Knee")],
        "upper",
        type === "arm" ? 31 : 36,
      )}
      {bone(
        (p) => p[side + (type === "arm" ? "Elbow" : "Knee")],
        (p) => p[side + (type === "arm" ? "Wrist" : "Ankle")],
        "lower",
        type === "arm" ? 28 : 32,
      )}
    </g>
  );
  const dumbbell = (
    <g fill="#4d5b62">
      <rect x="-15" y="-3" width="30" height="6" rx="2" fill="#7d8f98" />
      <rect x="-17" y="-9" width="7" height="18" rx="2.5" />
      <rect x="10" y="-9" width="7" height="18" rx="2.5" />
      <path d="M-14-6V5M13-6V5" stroke="#9caab1" strokeWidth="1.5" />
    </g>
  );
  return (
    <svg
      ref={ref}
      className="cat-animation"
      viewBox="0 0 300 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Animated cat demonstration of ${demo.title}`}
    >
      <rect width="300" height="220" rx="12" fill="#f0f6f9" />
      <path d="M20 194H280" stroke="#d2dde3" strokeWidth="1" />
      <ellipse cx="152" cy="197" rx="91" ry="5" fill="#d9e7ef" />
      {demo.mat && (
        <path
          d="M42 190H273"
          stroke="#aacadc"
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      {demo.bench && (
        <g strokeLinecap="round">
          {demo.bench === "flat" ? (
            <>
              <path d="M57 154H190" stroke="#647680" strokeWidth="10" />
              <path
                d="M77 158V191M177 158V191"
                stroke="#97a6ae"
                strokeWidth="5"
              />
            </>
          ) : demo.bench === "incline" ? (
            <>
              <path d="M81 101L182 151H201" stroke="#647680" strokeWidth="10" />
              <path
                d="M126 132V191M184 154V191"
                stroke="#97a6ae"
                strokeWidth="5"
              />
            </>
          ) : demo.bench === "support" ? (
            <>
              <path d="M65 167H140" stroke="#647680" strokeWidth="8" />
              <path
                d="M78 171V191M130 171V191"
                stroke="#97a6ae"
                strokeWidth="4"
              />
            </>
          ) : demo.bench === "row" ? (
            <>
              <path d="M120 151H170" stroke="#647680" strokeWidth="8" />
              <path
                d="M137 155V191M223 173L237 190"
                stroke="#97a6ae"
                strokeWidth="4"
              />
            </>
          ) : (
            <>
              <path d="M123 151H178" stroke="#647680" strokeWidth="9" />
              <path
                d="M133 156V192M167 156V192"
                stroke="#97a6ae"
                strokeWidth="4"
              />
            </>
          )}
        </g>
      )}
      {["pulldown", "rope"].includes(demo.equipment) && (
        <g stroke="#a8b4bb" fill="none">
          <path d="M251 192V11H150" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="12" r="5" fill="#d5e5ed" />
          {motionPath(
            (p) => line([150, 13], [wristCenter(p)[0], wristCenter(p)[1] - 9]),
            { stroke: "#859ba7", strokeWidth: 2 },
          )}
        </g>
      )}
      {["cable", "face-cable"].includes(demo.equipment) && (
        <g fill="none">
          <path
            d="M270 193V35"
            stroke="#a8b4bb"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="268"
            cy={demo.equipment === "cable" ? 133 : 76}
            r="6"
            fill="#cbdfe9"
            stroke="#9fafb7"
          />
          {motionPath(
            (p) =>
              line(
                [268, demo.equipment === "cable" ? 133 : 76],
                wristCenter(p),
              ),
            { stroke: "#8da3af", strokeWidth: 2 },
          )}
        </g>
      )}
      {movable(
        "hip",
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={frames
              .map(
                (_, i) => Math.sin((i / (frames.length - 1)) * Math.PI * 2) * 9,
              )
              .join(";")}
            dur={`${demo.duration}s`}
            repeatCount="indefinite"
          />
          <FurSprite part="tail" x="5" y="-52" width="61" height="72" />
        </g>,
      )}
      {furryLimb("right", "leg")}
      {furryLimb("right", "arm")}
      {bone(
        (p) => p.shoulder,
        (p) => p.hip,
        "torso",
        68,
        38,
      )}
      {furryLimb("left", "leg")}
      {furryLimb("left", "arm")}
      {["leftAnkle", "rightAnkle"].map((key) =>
        movable(
          key,
          <FurSprite part="paw" x="-14" y="-10" width="28" height="23" />,
        ),
      )}
      {demo.equipment === "dumbbells" && (
        <>
          {movable("leftWrist", dumbbell)}
          {movable("rightWrist", dumbbell)}
        </>
      )}
      {demo.equipment === "single-dumbbell" && movable("rightWrist", dumbbell)}
      {demo.equipment === "goblet" &&
        movable(
          "leftWrist",
          <g transform="translate(7 -4) rotate(90)">{dumbbell}</g>,
        )}
      {demo.equipment === "barbell" && (
        <g>
          {motionPath(
            (p) =>
              `M${p.leftWrist[0] - 29},${p.leftWrist[1]} L${p.rightWrist[0] + 29},${p.rightWrist[1]}`,
            { stroke: "#7d8f99", strokeWidth: 4, strokeLinecap: "round" },
          )}
          {["left", "right"].map((side) =>
            movable(
              side + "Wrist",
              <g transform={`translate(${side === "left" ? -23 : 23} 0)`}>
                <rect
                  x="-5"
                  y="-15"
                  width="10"
                  height="30"
                  rx="3"
                  fill="#4c5d67"
                />
                <path d="M0-11V11" stroke="#8498a2" strokeWidth="2" />
              </g>,
            ),
          )}
        </g>
      )}
      {demo.equipment === "pulldown" &&
        motionPath(
          (p) =>
            `M${p.leftWrist[0] - 10},${p.leftWrist[1] + 3} L${p.leftWrist[0]},${p.leftWrist[1]} L${p.rightWrist[0]},${p.rightWrist[1]} L${p.rightWrist[0] + 10},${p.rightWrist[1] + 3}`,
          {
            fill: "none",
            stroke: "#566e7b",
            strokeWidth: 4,
            strokeLinecap: "round",
          },
        )}
      {["rope", "face-cable", "cable"].includes(demo.equipment) &&
        motionPath(
          (p) =>
            `M${p.leftWrist.join(",")} L${wristCenter(p)[0]},${wristCenter(p)[1] - 9} L${p.rightWrist.join(",")}`,
          {
            fill: "none",
            stroke: "#536d7b",
            strokeWidth: 4,
            strokeLinecap: "round",
          },
        )}
      {["leftWrist", "rightWrist"].map((key) =>
        movable(
          key,
          <FurSprite part="paw" x="-11" y="-9" width="22" height="18" />,
        ),
      )}
      {movable(
        "head",
        <g transform={`rotate(${frames[0].rotation || 0})`}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={values(
              (p) =>
                (p.rotation || 0) +
                Math.sin((p.head[1] - demo.frames[0].head[1]) * 0.04) * 3,
            )}
            dur={`${demo.duration}s`}
            repeatCount="indefinite"
          />
          <FurSprite part="head" x="-35" y="-36" width="70" height="70" />
        </g>,
      )}
    </svg>
  );
}

const RIG_CELLS = {
  head: [0, 0],
  torso: [1, 0],
  upper: [0, 1],
  lower: [1, 1],
  paw: [0, 2],
  tail: [1, 2],
};
function FurSprite({ part, children, ...props }) {
  const [col, row] = RIG_CELLS[part];
  return (
    <svg
      {...props}
      viewBox={`${col} ${row} 1 1`}
      preserveAspectRatio="none"
      overflow="hidden"
    >
      {children}
      <image
        href="/cat-coach/character-rig.png"
        width="2"
        height="3"
        preserveAspectRatio="none"
      />
    </svg>
  );
}
