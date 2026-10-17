import React, { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, ChevronDown, ChevronUp, Cat } from "lucide-react";
import { getExerciseDemo } from "../exerciseDemos";
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
    frames = demo.frames;
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
      calcMode="spline"
      keyTimes="0;0.42;0.58;1"
      keySplines="0.4 0 0.3 1;0 0 1 1;0.4 0 0.3 1"
    />
  );
  const shoulder = (p, side) =>
    p[side + "Shoulder"] || [
      p.shoulder[0] + (side === "left" ? -12 : 12),
      p.shoulder[1] + 2,
    ];
  const line = (a, b) => `M${a.join(",")} L${b.join(",")}`;
  const limb = (p, side, type) => {
    const a =
        type === "arm"
          ? shoulder(p, side)
          : [p.hip[0] + (side === "left" ? -8 : 8), p.hip[1]],
      b = p[side + (type === "arm" ? "Elbow" : "Knee")],
      c = p[side + (type === "arm" ? "Wrist" : "Ankle")];
    return `M${a.join(",")} L${b.join(",")} L${c.join(",")}`;
  };
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
        calcMode="spline"
        keyTimes="0;0.42;0.58;1"
        keySplines="0.4 0 0.3 1;0 0 1 1;0.4 0 0.3 1"
      />
      {content}
    </g>
  );
  const dumbbell = (
    <g fill="#53644b">
      <rect x="-15" y="-3" width="30" height="6" rx="2" fill="#88977e" />
      <rect x="-17" y="-9" width="7" height="18" rx="2.5" />
      <rect x="10" y="-9" width="7" height="18" rx="2.5" />
      <path d="M-14-6V5M13-6V5" stroke="#a5b39a" strokeWidth="1.5" />
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
      <rect width="300" height="220" rx="12" fill="#f6f8f1" />
      <path d="M20 194H280" stroke="#dce4d1" strokeWidth="1" />
      <ellipse cx="152" cy="197" rx="91" ry="5" fill="#e6ecdc" />
      {demo.mat && (
        <path
          d="M42 190H273"
          stroke="#c5d5b1"
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      {demo.bench && (
        <g strokeLinecap="round">
          {demo.bench === "flat" ? (
            <>
              <path d="M57 154H190" stroke="#718064" strokeWidth="10" />
              <path
                d="M77 158V191M177 158V191"
                stroke="#a2ae97"
                strokeWidth="5"
              />
            </>
          ) : demo.bench === "incline" ? (
            <>
              <path d="M81 101L182 151H201" stroke="#718064" strokeWidth="10" />
              <path
                d="M126 132V191M184 154V191"
                stroke="#a2ae97"
                strokeWidth="5"
              />
            </>
          ) : demo.bench === "support" ? (
            <>
              <path d="M65 167H140" stroke="#718064" strokeWidth="8" />
              <path
                d="M78 171V191M130 171V191"
                stroke="#a2ae97"
                strokeWidth="4"
              />
            </>
          ) : demo.bench === "row" ? (
            <>
              <path d="M120 151H170" stroke="#718064" strokeWidth="8" />
              <path
                d="M137 155V191M223 173L237 190"
                stroke="#a2ae97"
                strokeWidth="4"
              />
            </>
          ) : (
            <>
              <path d="M123 151H178" stroke="#718064" strokeWidth="9" />
              <path
                d="M133 156V192M167 156V192"
                stroke="#a2ae97"
                strokeWidth="4"
              />
            </>
          )}
        </g>
      )}
      {["pulldown", "rope"].includes(demo.equipment) && (
        <g stroke="#b1bda6" fill="none">
          <path d="M251 192V11H150" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="12" r="5" fill="#e3ead8" />
          {motionPath(
            (p) => line([150, 13], [wristCenter(p)[0], wristCenter(p)[1] - 9]),
            { stroke: "#98aa82", strokeWidth: 2 },
          )}
        </g>
      )}
      {["cable", "face-cable"].includes(demo.equipment) && (
        <g fill="none">
          <path
            d="M270 193V35"
            stroke="#b1bda6"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="268"
            cy={demo.equipment === "cable" ? 133 : 76}
            r="6"
            fill="#dbe5cf"
            stroke="#acb99d"
          />
          {motionPath(
            (p) =>
              line(
                [268, demo.equipment === "cable" ? 133 : 76],
                wristCenter(p),
              ),
            { stroke: "#9fb28a", strokeWidth: 2 },
          )}
        </g>
      )}
      {motionPath(
        (p) =>
          `M${p.hip.join(",")} Q${p.hip[0] + 37},${p.hip[1] + 22} ${p.hip[0] + 43},${p.hip[1] - 3}`,
        {
          fill: "none",
          stroke: "#756957",
          strokeWidth: 7,
          strokeLinecap: "round",
        },
      )}
      {motionPath((p) => limb(p, "right", "leg"), {
        fill: "none",
        stroke: "#c5beb0",
        strokeWidth: 11,
        strokeLinejoin: "round",
        strokeLinecap: "round",
      })}
      {motionPath((p) => limb(p, "right", "arm"), {
        fill: "none",
        stroke: "#c5beb0",
        strokeWidth: 8,
        strokeLinejoin: "round",
        strokeLinecap: "round",
      })}
      {motionPath((p) => line(p.shoulder, p.hip), {
        fill: "none",
        stroke: "#9d8b72",
        strokeWidth: 26,
        strokeLinecap: "round",
      })}
      {motionPath((p) => line(p.shoulder, [p.hip[0], p.hip[1] - 8]), {
        fill: "none",
        stroke: "#a9c284",
        strokeWidth: 24,
        strokeLinecap: "round",
      })}
      {motionPath(
        (p) =>
          line(
            [p.shoulder[0], p.shoulder[1] - 3],
            [p.shoulder[0], p.shoulder[1] + 15],
          ),
        {
          fill: "none",
          stroke: "#f6f3eb",
          strokeWidth: 12,
          strokeLinecap: "round",
        },
      )}
      {motionPath((p) => line(p.shoulder, [p.head[0], p.head[1] + 12]), {
        stroke: "#f0ede4",
        strokeWidth: 12,
        strokeLinecap: "round",
      })}
      {motionPath((p) => limb(p, "left", "leg"), {
        fill: "none",
        stroke: "#efede5",
        strokeWidth: 11,
        strokeLinejoin: "round",
        strokeLinecap: "round",
      })}
      {motionPath((p) => limb(p, "left", "arm"), {
        fill: "none",
        stroke: "#b6a48a",
        strokeWidth: 8,
        strokeLinejoin: "round",
        strokeLinecap: "round",
      })}
      {["left", "right"].map((side) => (
        <React.Fragment key={side}>
          {motionPath(
            (p) => {
              const a = p[side + "Ankle"];
              return demo.toeContact
                ? `M${a[0] - 3},${a[1]} L${a[0] + 7},193 L${a[0] + 13},193`
                : `M${a[0] - 5},${a[1] + 3} L${a[0] + 9},${a[1] + 3}`;
            },
            {
              fill: "none",
              stroke: "#e8e5dc",
              strokeWidth: 7,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
          )}
        </React.Fragment>
      ))}
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
            { stroke: "#8a997d", strokeWidth: 4, strokeLinecap: "round" },
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
                  fill="#56694a"
                />
                <path d="M0-11V11" stroke="#94a581" strokeWidth="2" />
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
            stroke: "#687e53",
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
            stroke: "#667e50",
            strokeWidth: 4,
            strokeLinecap: "round",
          },
        )}
      {["leftWrist", "rightWrist"].map((key) =>
        movable(
          key,
          <ellipse
            rx="5"
            ry="4.5"
            fill="#f6f3eb"
            stroke="#c9c3b5"
            strokeWidth=".6"
          />,
        ),
      )}
      {movable(
        "head",
        <g transform={`rotate(${frames[0].rotation || 0})`}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={values((p) => p.rotation || 0)}
            dur={`${demo.duration}s`}
            repeatCount="indefinite"
          />
          <image
            href="/cat-coach/portrait.png"
            x="-32"
            y="-29"
            width="64"
            height="58"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>,
      )}
    </svg>
  );
}
