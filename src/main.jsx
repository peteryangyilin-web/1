import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Activity,
  Flame,
  Moon,
  Play,
  Pause,
  X,
  Bell,
  Sparkles,
  Clock,
  Target,
  Dumbbell,
  Utensils,
  Settings,
  LayoutGrid,
  CalendarDays,
  ChartNoAxesCombined,
  Cookie,
  Download,
  Trash2,
  Pencil,
  Droplets,
  CheckCheck,
  ArrowDown,
  TrendingUp,
  Info,
  Menu,
} from "lucide-react";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import {
  DEFAULT_PROFILE,
  dateKey,
  parseDate,
  weekDates,
  emptyDay,
  totalNutrition,
  getPlan,
  createSession,
  elapsedSeconds,
  completedSets,
  streak,
  formatDuration,
  weightProgress,
  coachInsights,
} from "./model";
import "./style.css";
import SnackSimulation from "./components/SnackSimulation";
import ExerciseDemo from "./components/ExerciseDemo";
import OverviewProfile from "./components/OverviewProfile";
import Entrance from "./components/Entrance";
import "./components/navigation.css";
const TABS = [
  [LayoutGrid, "Overview"],
  [Dumbbell, "Training"],
  [Utensils, "Nutrition"],
  [ChartNoAxesCombined, "Progress"],
  [Cookie, "Snack break"],
];
const PRESETS = [
  {
    name: "Chicken & quinoa bowl",
    calories: 450,
    protein: 38,
    carbs: 46,
    fats: 13,
  },
  {
    name: "Greek yogurt & berries",
    calories: 210,
    protein: 20,
    carbs: 25,
    fats: 4,
  },
  { name: "Oatmeal & banana", calories: 320, protein: 10, carbs: 56, fats: 7 },
];
const shortDate = (key) =>
  parseDate(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
const niceNumber = (n) =>
  Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem("forma-v2"));
    if (
      saved &&
      saved.version === 2 &&
      saved.records &&
      typeof saved.records === "object" &&
      !Array.isArray(saved.records)
    )
      return {
        version: 2,
        profile: { ...DEFAULT_PROFILE, ...saved.profile },
        records: saved.records,
        simulation: saved.simulation,
      };
    const old = JSON.parse(localStorage.getItem("forma-profile"));
    return {
      version: 2,
      profile: {
        ...DEFAULT_PROFILE,
        ...(old
          ? {
              name: old.name,
              days: Number(old.days) || 4,
              goal: ["muscle", "endurance", "wellbeing"].includes(old.goal)
                ? old.goal
                : "muscle",
            }
          : {}),
      },
      records: {},
    };
  } catch {
    return { version: 2, profile: DEFAULT_PROFILE, records: {} };
  }
}
function App() {
  const [store, setStore] = useState(loadStore),
    [selected, setSelected] = useState(() => dateKey(new Date())),
    [tab, setTab] = useState("Overview"),
    [modal, setModal] = useState(null),
    [notice, setNotice] = useState(false),
    [toast, setToast] = useState(""),
    [saveError, setSaveError] = useState(false),
    [clock, setClock] = useState(Date.now()),
    [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null),
    navToggleRef = useRef(null),
    drawerTimer = useRef(null);
  const openDrawer = () => {
    clearTimeout(drawerTimer.current);
    setDrawerOpen(true);
  };
  const closeDrawer = (restoreFocus = false) => {
    clearTimeout(drawerTimer.current);
    setDrawerOpen(false);
    if (restoreFocus) navToggleRef.current?.focus();
  };
  const leaveDrawer = (e) => {
    if (
      e.pointerType !== "mouse" ||
      drawerRef.current?.contains(document.activeElement)
    )
      return;
    clearTimeout(drawerTimer.current);
    drawerTimer.current = setTimeout(() => setDrawerOpen(false), 180);
  };
  useEffect(() => () => clearTimeout(drawerTimer.current), []);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeDrawer(true);
      }
    };
    const onOutside = (e) => {
      if (
        !drawerRef.current?.contains(e.target) &&
        !navToggleRef.current?.contains(e.target)
      )
        closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onOutside);
    };
  }, [drawerOpen]);
  const today = dateKey(new Date()),
    profile = store.profile,
    dates = weekDates(selected),
    record = { ...emptyDay(), ...store.records[selected] },
    totals = totalNutrition(record.meals),
    plan = getPlan(selected, profile, record),
    session = record.session,
    complete = !!session?.completedAt,
    isFuture = selected > today;
  const weekComplete = dates.filter(
    (d) => store.records[d]?.session?.completedAt,
  ).length;
  const allWeights = Object.entries(store.records)
    .filter(([d, r]) => r.weight != null && d <= selected)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const currentWeight = allWeights.at(-1)?.[1].weight,
    goalProgress = weightProgress(profile, currentWeight);
  useEffect(() => {
    try {
      localStorage.setItem("forma-v2", JSON.stringify(store));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [store]);
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const nodes = [
          ...document.querySelectorAll(
            ".modal button:not(:disabled),.modal input,.modal select,.modal textarea",
          ),
        ].filter((x) => x.offsetParent !== null);
        if (!nodes.length) return;
        if (e.shiftKey && document.activeElement === nodes[0]) {
          e.preventDefault();
          nodes.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const id = setTimeout(
      () => document.querySelector(".modal .close")?.focus(),
      20,
    );
    return () => {
      clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previous?.focus?.();
    };
  }, [modal?.type]);
  const updateDay = (change, key = selected) =>
    setStore((s) => {
      const old = { ...emptyDay(), ...s.records[key] };
      return {
        ...s,
        records: {
          ...s.records,
          [key]: {
            ...old,
            ...(typeof change === "function" ? change(old) : change),
          },
        },
      };
    });
  const notify = (text) => setToast(text);
  const navigate = (label) => {
    closeDrawer(drawerRef.current?.contains(document.activeElement));
    setTab(label);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openSession = () => {
    if (isFuture) {
      notify(
        "Future sessions can be planned. Training logs are available on the day.",
      );
      return;
    }
    if (!session) updateDay({ session: createSession(plan) });
    setModal({ type: "workout" });
  };
  const toggleTimer = () =>
    updateDay((r) => {
      const s = r.session;
      return {
        session: {
          ...s,
          elapsed: elapsedSeconds(s),
          runningSince: s.runningSince ? null : Date.now(),
        },
      };
    });
  const setWorkoutSet = (ei, si, field, value) =>
    updateDay((r) => ({
      session: {
        ...r.session,
        sets: r.session.sets.map((sets, i) =>
          i === ei
            ? sets.map((v, j) => (j === si ? { ...v, [field]: value } : v))
            : sets,
        ),
      },
    }));
  const finishWorkout = () => {
    if (!completedSets(session)) {
      notify("Check off at least one completed set to save this session.");
      return;
    }
    updateDay({
      session: {
        ...session,
        elapsed: elapsedSeconds(session),
        runningSince: null,
        completedAt: new Date().toISOString(),
      },
    });
    setModal(null);
    notify("Session saved. One more step forward.");
  };
  const addMeal = (meal) => {
    updateDay((r) => ({
      meals: [
        ...r.meals,
        {
          ...meal,
          id: crypto.randomUUID(),
          loggedAt: new Date().toISOString(),
        },
      ],
    }));
    setModal(null);
    notify("Meal added to your daily totals.");
  };
  const exportData = () => {
    const rows = [
      [
        "Date",
        "Workout",
        "Completed sets",
        "Workout seconds",
        "Calories",
        "Protein g",
        "Carbs g",
        "Fats g",
        "Steps",
        "Sleep hours",
        "Weight kg",
        "Water glasses",
      ],
      ...Object.entries(store.records)
        .sort()
        .map(([d, r]) => {
          const t = totalNutrition(r.meals);
          return [
            d,
            r.session?.completedAt ? r.session.plan.title : "",
            completedSets(r.session),
            elapsedSeconds(r.session),
            t.calories,
            t.protein,
            t.carbs,
            t.fats,
            r.steps ?? "",
            r.sleep ?? "",
            r.weight ?? "",
            r.water || 0,
          ];
        }),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (v) =>
              '"' +
              (typeof v === "string" && /^[=+@-]/.test(v)
                ? "'" + v
                : String(v)
              ).replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "go-progress.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify("Your progress has been exported.");
  };
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  const insights = coachInsights(record, profile, totals);
  const daysOptions = Array.from({ length: 7 }, (_, i) => {
    const d = parseDate(today);
    d.setDate(d.getDate() - 6 + i);
    return dateKey(d);
  });
  return (
    <div className={"app " + (drawerOpen ? "navigation-open" : "")}>
      <div
        className="navigation-edge"
        aria-hidden="true"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") openDrawer();
        }}
      />
      <aside
        id="go-navigation"
        ref={drawerRef}
        className="sidebar"
        aria-label="Main navigation"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
        onPointerEnter={openDrawer}
        onPointerLeave={leaveDrawer}
        onBlur={(e) => {
          if (
            e.relatedTarget &&
            !e.currentTarget.contains(e.relatedTarget) &&
            e.relatedTarget !== navToggleRef.current
          )
            closeDrawer();
        }}
      >
        <div className="drawer-heading">
          <span>YOUR SPACE</span>
          <button
            className="icon-button"
            aria-label="Close menu"
            onClick={() => closeDrawer(true)}
          >
            <ChevronLeft size={17} />
          </button>
        </div>
        <nav>
          {TABS.map(([Icon, label]) => (
            <button
              key={label}
              className={"nav-item " + (tab === label ? "active" : "")}
              onClick={() => navigate(label)}
              aria-current={tab === label ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => {
              closeDrawer(true);
              setModal({ type: "settings" });
            }}
          >
            <Settings size={18} />
            <span>Settings & goals</span>
          </button>
          <button
            className="profile-button"
            onClick={() => {
              closeDrawer(true);
              setModal({ type: "settings" });
            }}
          >
            <div className="avatar">{initials}</div>
            <div>
              <strong>{profile.name}</strong>
              <small>Be a little better.</small>
            </div>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header>
          <div className="header-navigation">
            <button
              ref={navToggleRef}
              className="icon-button nav-toggle"
              aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={drawerOpen}
              aria-controls="go-navigation"
              onClick={(e) => {
                if (drawerOpen) closeDrawer();
                else {
                  openDrawer();
                  if (e.detail === 0)
                    requestAnimationFrame(() =>
                      drawerRef.current?.querySelector("nav button")?.focus(),
                    );
                }
              }}
            >
              <Menu size={18} />
            </button>
            <a
              className="logo main-logo"
              href="#"
              aria-label="GO home"
              onClick={(e) => {
                e.preventDefault();
                navigate("Overview");
              }}
            >
              <span className="go-symbol">
                G<span>O</span>
              </span>
              <span className="registered">®</span>
            </a>
            <div className="breadcrumb">
              Your space <ChevronRight size={12} />
              <strong>{tab}</strong>
            </div>
          </div>
          <div className="header-actions">
            <span className={"saved-state " + (saveError ? "error" : "")}>
              <i />
              {saveError ? "Storage unavailable" : "Saved on this device"}
            </span>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotice(!notice)}
            >
              <Bell size={18} />
              {weekComplete > 0 && <i className="notification-dot" />}
            </button>
            <button
              className="avatar"
              aria-label="Profile settings"
              onClick={() => setModal({ type: "settings" })}
            >
              {initials}
            </button>
          </div>
          {notice && (
            <div className="notification-panel">
              <strong>Your space, up to date.</strong>
              <p>
                {weekComplete
                  ? `${weekComplete} session${weekComplete > 1 ? "s" : ""} completed this week. Keep building your rhythm.`
                  : "Your plan is ready. Log a session or your daily metrics to start seeing progress."}
              </p>
              <small>
                Data is stored in this browser. Export a copy from Progress.
              </small>
            </div>
          )}
        </header>
        <main>
          {saveError && (
            <div className="storage-warning">
              Changes cannot be saved in this browser. Export your data before
              leaving. <button onClick={exportData}>Export now</button>
            </div>
          )}
          <section className="greeting">
            <div>
              <div className="eyebrow">
                {tab === "Overview"
                  ? "YOUR PERSONAL SPACE"
                  : parseDate(selected)
                      .toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                      .toUpperCase()}{" "}
                <span>•</span> A LITTLE BETTER, EVERY DAY
              </div>
              <h1>
                {tab === "Overview" ? (
                  <>
                    Let’s make it yours<em>.</em>
                  </>
                ) : tab === "Training" ? (
                  <>
                    One rep closer<em>.</em>
                  </>
                ) : tab === "Nutrition" ? (
                  <>
                    Good fuel. Better days<em>.</em>
                  </>
                ) : tab === "Snack break" ? (
                  <>
                    A little break goes a long way<em>.</em>
                  </>
                ) : (
                  <>
                    Let your progress speak<em>.</em>
                  </>
                )}
              </h1>
              <p>
                {tab === "Overview"
                  ? "Choose your goal. Tell us a little about yourself. Build your own starting point."
                  : tab === "Training"
                    ? "Your sessions, your sets, your own kind of stronger."
                    : tab === "Nutrition"
                      ? "Every meal counts. Build a balanced day, one plate at a time."
                      : tab === "Snack break"
                        ? "Your own little space to pause, play, and enjoy."
                        : "A clear view of the work you’ve put in."}
              </p>
            </div>
            {tab !== "Overview" && (
              <button
                className="secondary-button date-button"
                onClick={() => setModal({ type: "date" })}
              >
                <CalendarDays size={15} />
                {shortDate(selected)}
                <ChevronRight size={14} />
              </button>
            )}
          </section>
          {tab === "Snack break" && (
            <SnackSimulation
              value={store.simulation}
              onChange={(simulation) => setStore((s) => ({ ...s, simulation }))}
              onLog={(snack) => {
                setSelected(today);
                setModal({ type: "meal", prefill: snack });
              }}
            />
          )}
          {tab === "Overview" && (
            <OverviewProfile
              profile={profile}
              onSave={(next) => {
                setStore((s) => ({ ...s, profile: next }));
                notify(
                  "Your profile is saved. Your training and targets are updated.",
                );
              }}
              onTraining={() => navigate("Training")}
            />
          )}
          {(tab === "Training" || tab === "Nutrition") && (
            <>
              <section className="section-heading">
                <div>
                  <h2>
                    {tab === "Nutrition"
                      ? "A balanced day starts here."
                      : tab === "Training"
                        ? "Your training, with intention."
                        : "Make room for progress."}
                  </h2>
                  <span>
                    {selected === today ? "Today’s plan" : shortDate(selected)}
                  </span>
                </div>
                <div className="week-navigation">
                  <button
                    className="icon-button"
                    aria-label="Previous week"
                    onClick={() =>
                      setSelected(
                        weekDates(selected, -1)[
                          (parseDate(selected).getDay() + 6) % 7
                        ],
                      )
                    }
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    {shortDate(dates[0])} – {shortDate(dates[6])}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Next week"
                    onClick={() =>
                      setSelected(
                        weekDates(selected, 1)[
                          (parseDate(selected).getDay() + 6) % 7
                        ],
                      )
                    }
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="today-button"
                    onClick={() => setSelected(today)}
                  >
                    Today
                  </button>
                </div>
              </section>
              <div className="week-strip">
                {dates.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelected(d)}
                    className={"week-day " + (d === selected ? "selected" : "")}
                    aria-pressed={d === selected}
                    aria-label={parseDate(d).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  >
                    <span>
                      {parseDate(d).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                    <strong>{parseDate(d).getDate()}</strong>
                    <i
                      className={
                        store.records[d]?.session?.completedAt ? "day-done" : ""
                      }
                    >
                      {store.records[d]?.session?.completedAt ? (
                        <Check size={11} />
                      ) : (
                        <span />
                      )}
                    </i>
                    {d === today && <small>TODAY</small>}
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === "Training" && (
            <div
              className={
                "dashboard-grid " +
                (tab === "Training"
                  ? "training-layout cat-training-layout"
                  : "")
              }
            >
              <section className="workout-card">
                <div className="card-top">
                  <span className="eyebrow">
                    <span className="green-dot" />
                    {complete ? "SESSION COMPLETE" : "YOUR NEXT MOVE"}
                  </span>
                  <button
                    className="tag"
                    onClick={() => setModal({ type: "plan" })}
                    disabled={!!session}
                  >
                    <Pencil size={10} />
                    {plan.type.toUpperCase()}
                  </button>
                </div>
                <div className="workout-main">
                  <div>
                    <h2>
                      {plan.title}
                      <em>.</em>
                    </h2>
                    <p>{plan.focus}</p>
                    <div className="workout-metrics">
                      <span>
                        <Clock size={14} />
                        {plan.duration} min
                      </span>
                      <span>
                        <Dumbbell size={14} />
                        {plan.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                  <div className="workout-art">
                    <Dumbbell size={78} strokeWidth={1} />
                    <i />
                  </div>
                </div>
                <div className="workout-bottom">
                  <div className="exercise-stack">
                    <span>01</span>
                    <span>02</span>
                    <span>03</span>
                    <div>
                      <strong>
                        {complete
                          ? `${completedSets(session)} sets completed`
                          : "Make it your own"}
                        <small>
                          {complete
                            ? `${formatDuration(elapsedSeconds(session))} training time`
                            : "A plan. A little purpose."}
                        </small>
                      </strong>
                    </div>
                  </div>
                  <button className="lime-button" onClick={openSession}>
                    {complete
                      ? "View session"
                      : session
                        ? "Resume session"
                        : isFuture
                          ? "Planned session"
                          : "Start session"}
                    {complete ? (
                      <Check size={15} />
                    ) : (
                      <ArrowUpRight size={15} />
                    )}
                  </button>
                </div>
              </section>
              {tab === "Training" ? (
                <section className="panel session-outline">
                  <div className="card-top">
                    <h3>Your session breakdown</h3>
                    <span className="subtle">{plan.duration} min</span>
                  </div>
                  <p className="demo-intro">
                    Meet your cat coach. Watch the movement, then open the form
                    tips.
                  </p>
                  {plan.exercises.map((e, i) => (
                    <div className="cat-outline-row" key={e.name + i}>
                      <div className="cat-outline-header">
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <strong>{e.name}</strong>
                        <small>
                          {e.sets} × {e.reps}
                        </small>
                      </div>
                      <ExerciseDemo name={e.name} compact />
                    </div>
                  ))}
                </section>
              ) : (
                <NutritionCard
                  totals={totals}
                  profile={profile}
                  onAdd={() => setModal({ type: "meal" })}
                  mealCount={record.meals.length}
                  isFuture={isFuture}
                />
              )}
            </div>
          )}
          {tab === "Nutrition" && (
            <>
              <div className="nutrition-page-grid">
                <NutritionCard
                  totals={totals}
                  profile={profile}
                  onAdd={() => setModal({ type: "meal" })}
                  mealCount={record.meals.length}
                  isFuture={isFuture}
                />
                <WaterCard
                  record={record}
                  profile={profile}
                  onChange={(delta) =>
                    updateDay((r) => ({
                      water: Math.max(0, Math.min(30, (r.water || 0) + delta)),
                    }))
                  }
                  disabled={isFuture}
                />
              </div>
              <section className="panel meal-panel">
                <div className="card-top">
                  <div>
                    <h3>Your food journal</h3>
                    <p className="subtle">
                      {record.meals.length} meals logged · {shortDate(selected)}
                    </p>
                  </div>
                  <button
                    className="primary-button"
                    disabled={isFuture}
                    onClick={() => setModal({ type: "meal" })}
                  >
                    <Plus size={15} /> Add meal
                  </button>
                </div>
                {!record.meals.length ? (
                  <Empty
                    icon={Utensils}
                    title="A fresh plate."
                    text="Log your first meal to see calories and macros come together."
                  />
                ) : (
                  <div className="meal-table">
                    <div className="meal-table-head">
                      <span>MEAL</span>
                      <span>CALORIES</span>
                      <span>PROTEIN</span>
                      <span>CARBS</span>
                      <span>FATS</span>
                      <span />
                    </div>
                    {record.meals.map((m) => (
                      <div className="meal-row" key={m.id}>
                        <div>
                          <span className="food-icon">
                            <Utensils size={17} />
                          </span>
                          <strong>
                            {m.name}
                            <small>{m.category || "Meal"}</small>
                          </strong>
                        </div>
                        <span>
                          {niceNumber(m.calories)}
                          <small> kcal</small>
                        </span>
                        <span>
                          {niceNumber(m.protein)}
                          <small> g</small>
                        </span>
                        <span>
                          {niceNumber(m.carbs)}
                          <small> g</small>
                        </span>
                        <span>
                          {niceNumber(m.fats)}
                          <small> g</small>
                        </span>
                        <div className="row-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${m.name}`}
                            onClick={() => setModal({ type: "meal", meal: m })}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="icon-button danger"
                            aria-label={`Delete ${m.name}`}
                            onClick={() => {
                              updateDay((r) => ({
                                meals: r.meals.filter((x) => x.id !== m.id),
                              }));
                              notify("Meal removed. Totals updated.");
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
          {tab === "Training" && (
            <section className="panel">
              <div className="card-top">
                <div>
                  <h3>Your training history</h3>
                  <p className="subtle">
                    Finished sessions. Effort you can come back to.
                  </p>
                </div>
                <button className="text-button" onClick={exportData}>
                  Export <Download size={14} />
                </button>
              </div>
              <SessionHistory
                records={store.records}
                onView={(d) => {
                  setSelected(d);
                  setModal({ type: "workout" });
                }}
              />
            </section>
          )}
          {tab === "Progress" && (
            <>
              <section className="progress-top">
                <div>
                  <span className="eyebrow">YOUR EFFORT, MADE VISIBLE</span>
                  <h2>Consistency compounds.</h2>
                  <p>Your own data. A clearer picture of what’s working.</p>
                </div>
                <button className="secondary-button" onClick={exportData}>
                  <Download size={15} />
                  Export data
                </button>
              </section>
              <div className="progress-stats">
                <Metric
                  icon={Dumbbell}
                  label="Sessions completed"
                  value={
                    Object.values(store.records).filter(
                      (r) => r.session?.completedAt,
                    ).length
                  }
                  unit="sessions"
                  detail="All-time training sessions"
                />
                <Metric
                  icon={Flame}
                  label="Current streak"
                  value={streak(store.records, today)}
                  unit="days"
                  detail="A little momentum, every day"
                />
                <Metric
                  icon={Target}
                  label="Latest weight"
                  value={
                    currentWeight == null ? "—" : niceNumber(currentWeight)
                  }
                  unit="kg"
                  detail={
                    currentWeight == null
                      ? "Log a weigh-in to get started"
                      : `Goal: ${profile.targetWeight} kg · ${goalProgress}% of the way`
                  }
                  onClick={() => setModal({ type: "metrics" })}
                />
              </div>
              <div className="progress-charts">
                <ProgressChart
                  title="Daily movement"
                  description="Last 7 days · steps"
                  dates={daysOptions}
                  records={store.records}
                  field="steps"
                  target={profile.steps}
                  unit="steps"
                />
                <ProgressChart
                  title="Sleep, in perspective"
                  description="Last 7 days · hours"
                  dates={daysOptions}
                  records={store.records}
                  field="sleep"
                  target={profile.sleep}
                  unit="h"
                />
              </div>
              <section className="panel weight-panel">
                <div className="card-top">
                  <div>
                    <h3>Your weight journey</h3>
                    <p className="subtle">
                      From {profile.startWeight} kg toward{" "}
                      {profile.targetWeight} kg. At your own pace.
                    </p>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => setModal({ type: "metrics" })}
                  >
                    <Plus size={14} />
                    Log metrics
                  </button>
                </div>
                <div className="weight-progress">
                  <strong>
                    {currentWeight ?? "—"}
                    <small> kg</small>
                  </strong>
                  <div>
                    <div className="progress-track">
                      <i style={{ width: goalProgress + "%" }} />
                    </div>
                    <span>{goalProgress}% toward your target</span>
                  </div>
                  <Target size={24} />
                </div>
                {allWeights.length > 0 && (
                  <div className="weight-log">
                    {allWeights.slice(-7).map(([d, r]) => (
                      <span key={d}>
                        {shortDate(d)}
                        <strong>{r.weight} kg</strong>
                      </span>
                    ))}
                  </div>
                )}
              </section>
              <section className="panel">
                <div className="card-top">
                  <h3>Work you can be proud of.</h3>
                  <span className="subtle">Completed sessions</span>
                </div>
                <SessionHistory
                  records={store.records}
                  onView={(d) => {
                    setSelected(d);
                    setModal({ type: "workout" });
                  }}
                />
              </section>
            </>
          )}
          <footer>
            <span className="footer-logo">
              GO<sup>®</sup>
            </span>
            <p>Built around you. Built for the long run.</p>
            <span>
              <span className="green-dot" /> ALL IN GOOD FORM
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            className={
              "modal " + (modal.type === "workout" ? "workout-modal" : "")
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close icon-button"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            {modal.type === "meal" ? (
              <MealForm
                meal={modal.meal || modal.prefill}
                editing={!!modal.meal}
                onSubmit={(m) => {
                  if (modal.meal) {
                    updateDay((r) => ({
                      meals: r.meals.map((v) =>
                        v.id === modal.meal.id ? { ...v, ...m } : v,
                      ),
                    }));
                    setModal(null);
                    notify("Meal updated. Your totals are in sync.");
                  } else addMeal(m);
                }}
                onPreset={addMeal}
              />
            ) : modal.type === "metrics" ? (
              <MetricsForm
                record={record}
                selected={selected}
                disabled={isFuture}
                onSubmit={(v) => {
                  updateDay(v);
                  setModal(null);
                  notify("Daily metrics saved.");
                }}
              />
            ) : modal.type === "settings" ? (
              <SettingsForm
                profile={profile}
                onSubmit={(v) => {
                  setStore((s) => ({ ...s, profile: v }));
                  setModal(null);
                  notify("Preferences saved. Your schedule has been updated.");
                }}
              />
            ) : modal.type === "plan" ? (
              <PlanForm
                plan={plan}
                disabled={!!session}
                onSubmit={(p) => {
                  updateDay({ customPlan: p });
                  setModal(null);
                  notify(
                    "Your plan is updated for " + shortDate(selected) + ".",
                  );
                }}
              />
            ) : modal.type === "workout" && session ? (
              <>
                <span className="eyebrow">
                  {complete ? "SESSION SAVED" : "YOUR TIME. YOUR PROGRESS."}
                </span>
                <h2 id="modal-title">
                  {session.plan.title}
                  <em>.</em>
                </h2>
                <p>
                  {shortDate(selected)} · {session.plan.focus}
                </p>
                <div className="session-timer">
                  <div>
                    <strong>
                      {formatDuration(elapsedSeconds(session, clock))}
                    </strong>
                    <span>
                      {complete
                        ? "TOTAL TRAINING TIME"
                        : session.runningSince
                          ? "SESSION IN PROGRESS"
                          : "READY WHEN YOU ARE"}
                    </span>
                  </div>
                  {!complete && (
                    <button className="secondary-button" onClick={toggleTimer}>
                      {session.runningSince ? (
                        <Pause size={15} />
                      ) : (
                        <Play size={15} />
                      )}{" "}
                      {session.runningSince ? "Pause" : "Start timer"}
                    </button>
                  )}
                </div>
                <div className="session-progress">
                  <span>
                    {completedSets(session)} of {session.sets.flat().length}{" "}
                    sets complete
                  </span>
                  <div className="progress-track">
                    <i
                      style={{
                        width:
                          (completedSets(session) /
                            session.sets.flat().length) *
                            100 +
                          "%",
                      }}
                    />
                  </div>
                </div>
                <div className="exercise-list">
                  {session.plan.exercises.map((e, ei) => (
                    <section key={ei}>
                      <h3>
                        <span>{String(ei + 1).padStart(2, "0")}</span>
                        {e.name}
                      </h3>
                      <ExerciseDemo name={e.name} />
                      <div className="set-header">
                        <span>SET</span>
                        <span>WEIGHT · KG</span>
                        <span>REPS</span>
                        <span>DONE</span>
                      </div>
                      {session.sets[ei].map((s, si) => (
                        <div
                          className={"set-row " + (s.done ? "checked" : "")}
                          key={si}
                        >
                          <span>{si + 1}</span>
                          <input
                            aria-label={`${e.name} set ${si + 1} weight`}
                            type="number"
                            min="0"
                            max="1000"
                            step="0.5"
                            value={s.weight}
                            disabled={complete}
                            onChange={(ev) => {
                              const v = ev.target.valueAsNumber;
                              if (Number.isFinite(v) && v >= 0 && v <= 1000)
                                setWorkoutSet(ei, si, "weight", v);
                            }}
                          />
                          <input
                            aria-label={`${e.name} set ${si + 1} reps`}
                            type="number"
                            min="1"
                            max="500"
                            value={s.reps}
                            disabled={complete}
                            onChange={(ev) => {
                              const v = ev.target.valueAsNumber;
                              if (Number.isInteger(v) && v > 0 && v <= 500)
                                setWorkoutSet(ei, si, "reps", v);
                            }}
                          />
                          <button
                            className={"set-check " + (s.done ? "done" : "")}
                            aria-label={`${e.name} set ${si + 1} complete`}
                            aria-pressed={s.done}
                            disabled={complete}
                            onClick={() =>
                              setWorkoutSet(ei, si, "done", !s.done)
                            }
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
                <div className="modal-actions">
                  {complete ? (
                    <>
                      <button
                        className="secondary-button"
                        onClick={() => {
                          updateDay({
                            session: { ...session, completedAt: null },
                          });
                          notify(
                            "Session reopened. Update your sets, then finish to save.",
                          );
                        }}
                      >
                        Edit session <Pencil size={14} />
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => setModal(null)}
                      >
                        All in good form <CheckCheck size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="secondary-button"
                        onClick={() => setModal(null)}
                      >
                        Save & close
                      </button>
                      <button
                        className="primary-button"
                        onClick={finishWorkout}
                      >
                        Finish session <Check size={16} />
                      </button>
                    </>
                  )}
                </div>
                <p className="form-hint">
                  Your sets and timer are saved automatically on this device.
                </p>
              </>
            ) : modal.type === "coach" || modal.type === "insights" ? (
              <>
                <span className="coach-icon">
                  <Sparkles size={23} />
                </span>
                <h2 id="modal-title">In your corner.</h2>
                <p>
                  Suggestions from your logged data for {shortDate(selected)}.
                </p>
                <span className="rule-label">
                  <Info size={13} />
                  Rule-based plan coach · not an AI service
                </span>
                {insights.map((i) => (
                  <div className="insight-box" key={i.title}>
                    <h3>{i.title}</h3>
                    <p>{i.text}</p>
                  </div>
                ))}
                <WaterCard
                  record={record}
                  profile={profile}
                  onChange={(delta) =>
                    updateDay((r) => ({
                      water: Math.max(0, Math.min(30, (r.water || 0) + delta)),
                    }))
                  }
                  disabled={isFuture}
                />
                <small className="form-hint">
                  General fitness guidance. Adjust activity to your ability and
                  follow your clinician’s advice where relevant.
                </small>
              </>
            ) : modal.type === "date" ? (
              <>
                <span className="eyebrow">YOUR TIME, YOUR PLAN</span>
                <h2 id="modal-title">Pick your day.</h2>
                <p>Review your history or plan a little further ahead.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSelected(new FormData(e.currentTarget).get("date"));
                    setModal(null);
                  }}
                >
                  <label className="field">
                    Date
                    <input
                      type="date"
                      name="date"
                      required
                      defaultValue={selected}
                      min="2000-01-01"
                      max="2100-12-31"
                    />
                  </label>
                  <button className="primary-button">
                    View day <ArrowRight size={16} />
                  </button>
                </form>
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
function Metric({ icon: Icon, label, value, unit, detail, children, onClick }) {
  return (
    <section className={"metric-card " + (onClick ? "clickable" : "")}>
      <div className="metric-label">
        <Icon size={16} />
        <span>{label}</span>
        {onClick && (
          <button
            className="icon-button"
            aria-label={`Edit or view ${label}`}
            onClick={onClick}
          >
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <p>{detail}</p>
      {children}
    </section>
  );
}
function NutritionCard({ totals, profile, onAdd, mealCount, isFuture }) {
  const fill = Math.min(1, totals.calories / profile.calories);
  return (
    <section className="nutrition-card panel">
      <div className="card-top">
        <h3>Fuel your day</h3>
        <button
          className="icon-button"
          aria-label="Log food"
          disabled={isFuture}
          onClick={onAdd}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="nutrition-main">
        <div className="calorie-ring">
          <svg
            viewBox="0 0 120 120"
            aria-label={`${Math.round(fill * 100)} percent of calorie target`}
          >
            <circle cx="60" cy="60" r="51" />
            <circle
              className="ring-progress"
              cx="60"
              cy="60"
              r="51"
              strokeDasharray={`${fill * 321} 321`}
            />
          </svg>
          <div>
            <Flame size={16} />
            <strong>{niceNumber(totals.calories)}</strong>
            <span>of {niceNumber(profile.calories)} kcal</span>
          </div>
        </div>
        <div className="macro-list">
          {[
            ["Protein", "protein"],
            ["Carbs", "carbs"],
            ["Fats", "fats"],
          ].map(([label, k]) => (
            <div className={"macro " + k} key={k}>
              <div>
                <span>
                  <i />
                  {label}
                </span>
                <strong>
                  {niceNumber(totals[k])}
                  <small> / {profile[k]} g</small>
                </strong>
              </div>
              <div className="macro-track">
                <i
                  style={{
                    width: Math.min(100, (totals[k] / profile[k]) * 100) + "%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="nutrition-footer">
        <Utensils size={13} />
        {mealCount
          ? `${mealCount} meal${mealCount === 1 ? "" : "s"} logged`
          : "A fresh day. Make it balanced."}
        <button disabled={isFuture} onClick={onAdd}>
          Log food <Plus size={13} />
        </button>
      </div>
    </section>
  );
}
function WaterCard({ record, profile, onChange, disabled }) {
  return (
    <section className="water-card panel">
      <div className="card-top">
        <h3>
          <Droplets size={17} />A little hydration
        </h3>
        <span className="subtle">250 ml / glass</span>
      </div>
      <div className="water-value">
        {record.water || 0}
        <span> / {profile.water} glasses</span>
      </div>
      <div className="water-glasses">
        {Array.from({ length: profile.water }, (_, i) => (
          <Droplets
            key={i}
            size={23}
            fill={i < (record.water || 0) ? "currentColor" : "none"}
            className={i < (record.water || 0) ? "filled" : ""}
          />
        ))}
      </div>
      <div className="water-bottom">
        <span>{((record.water || 0) * 0.25).toFixed(2)} L logged</span>
        <div>
          <button
            className="icon-button"
            aria-label="Remove glass of water"
            disabled={disabled || !record.water}
            onClick={() => onChange(-1)}
          >
            −
          </button>
          <button
            className="secondary-button"
            aria-label="Add glass of water"
            disabled={disabled || record.water >= 30}
            onClick={() => onChange(1)}
          >
            <Plus size={14} />
            Add water
          </button>
        </div>
      </div>
    </section>
  );
}
function Empty({ icon: Icon, title, text }) {
  return (
    <div className="empty-state">
      <span>
        <Icon size={23} />
      </span>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
function SessionHistory({ records, onView }) {
  const rows = Object.entries(records)
    .filter(([, r]) => r.session?.completedAt)
    .sort((a, b) => b[0].localeCompare(a[0]));
  return !rows.length ? (
    <Empty
      icon={Dumbbell}
      title="Your first chapter is waiting."
      text="Complete a session and your training history will appear here."
    />
  ) : (
    <div className="session-history">
      {rows.map(([d, r]) => (
        <button key={d} onClick={() => onView(d)}>
          <span className="history-icon">
            <Check size={18} />
          </span>
          <div>
            <strong>{r.session.plan.title}</strong>
            <small>
              {shortDate(d)} · {completedSets(r.session)} sets completed
            </small>
          </div>
          <span>{formatDuration(elapsedSeconds(r.session))}</span>
          <ArrowUpRight size={17} />
        </button>
      ))}
    </div>
  );
}
function ProgressChart({
  title,
  description,
  dates,
  records,
  field,
  target,
  unit,
}) {
  const values = dates.map((d) => records[d]?.[field]),
    max = Math.max(target, ...values.filter((v) => v != null)),
    logged = values.filter((v) => v != null),
    average = logged.length
      ? logged.reduce((a, b) => a + b, 0) / logged.length
      : null;
  return (
    <section className="panel chart-card">
      <div className="card-top">
        <div>
          <h3>{title}</h3>
          <p className="subtle">{description}</p>
        </div>
        <span className="chart-average">
          {average == null ? "—" : niceNumber(average)}
          <small>{unit} average</small>
        </span>
      </div>
      <div className="chart-area">
        <div className="chart-grid">
          <span>{niceNumber(max)}</span>
          <span>{niceNumber(max / 2)}</span>
          <span>0</span>
        </div>
        <div className="chart-bars">
          {dates.map((d, i) => (
            <div key={d} className="chart-column">
              <div className="chart-bar-space">
                <div
                  className={
                    "chart-bar " + (values[i] == null ? "missing" : "")
                  }
                  style={{
                    height:
                      values[i] == null
                        ? "3px"
                        : Math.max(2, (values[i] / max) * 100) + "%",
                  }}
                  tabIndex={0}
                  aria-label={`${shortDate(d)}: ${values[i] == null ? "not logged" : values[i] + " " + unit}`}
                >
                  <span>
                    {values[i] == null
                      ? "Not logged"
                      : niceNumber(values[i]) + " " + unit}
                  </span>
                </div>
              </div>
              <span>
                {parseDate(d).toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="chart-note">
        {logged.length
          ? `${logged.length} of 7 days logged. Averages use recorded days only.`
          : "No entries yet. Log your daily metrics to start your chart."}
      </p>
    </section>
  );
}
function Field({
  label,
  name,
  type = "number",
  value,
  min,
  max,
  step = "1",
  required = true,
  placeholder,
}) {
  return (
    <label className="field">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        min={min}
        max={max}
        step={type === "number" ? step : undefined}
        required={required}
        pattern={type === "text" ? ".*\\S.*" : undefined}
        maxLength={type === "text" ? 120 : undefined}
        placeholder={placeholder}
      />
    </label>
  );
}
function MealForm({ meal, onSubmit, onPreset, editing = !!meal }) {
  return (
    <>
      <span className="eyebrow">FUEL YOUR POTENTIAL</span>
      <h2 id="modal-title">
        {editing ? "Refine your plate." : "A little nourishment."}
      </h2>
      <p>Enter the nutrition values for your whole serving.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({
            name: f.get("name").trim(),
            category: f.get("category"),
            ...Object.fromEntries(
              ["calories", "protein", "carbs", "fats"].map((k) => [
                k,
                Number(f.get(k)),
              ]),
            ),
          });
        }}
      >
        <Field
          label="Meal name"
          name="name"
          type="text"
          value={meal?.name}
          placeholder="e.g. Chicken & quinoa bowl"
        />
        <label className="field">
          Meal type
          <select name="category" defaultValue={meal?.category || "Lunch"}>
            {["Breakfast", "Lunch", "Dinner", "Snack"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <Field
            label="Calories · kcal"
            name="calories"
            min="0"
            max="10000"
            value={meal?.calories}
          />
          <Field
            label="Protein · g"
            name="protein"
            min="0"
            max="1000"
            step="0.1"
            value={meal?.protein}
          />
          <Field
            label="Carbs · g"
            name="carbs"
            min="0"
            max="1000"
            step="0.1"
            value={meal?.carbs}
          />
          <Field
            label="Fats · g"
            name="fats"
            min="0"
            max="1000"
            step="0.1"
            value={meal?.fats}
          />
        </div>
        <button className="primary-button full-width">
          {editing ? "Save meal" : "Log meal"} <Check size={16} />
        </button>
      </form>
      {!editing && !meal && (
        <div className="quick-add">
          <span className="eyebrow">QUICK ADD · ESTIMATED SERVINGS</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => onPreset({ ...p, category: "Meal" })}
            >
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.calories} kcal · {p.protein} g protein
                </small>
              </div>
              <Plus size={17} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function MetricsForm({ record, selected, disabled, onSubmit }) {
  return (
    <>
      <span className="eyebrow">THE LITTLE THINGS ADD UP</span>
      <h2 id="modal-title">Check in with you.</h2>
      <p>
        Your metrics for {shortDate(selected)}. Leave unrecorded values blank.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit(
            Object.fromEntries(
              ["steps", "sleep", "weight"].map((k) => [
                k,
                f.get(k) === "" ? null : Number(f.get(k)),
              ]),
            ),
          );
        }}
      >
        <Field
          label="Steps"
          name="steps"
          value={record.steps}
          min="0"
          max="200000"
          required={false}
          placeholder="e.g. 8432"
        />
        <Field
          label="Sleep · hours"
          name="sleep"
          value={record.sleep}
          min="0"
          max="24"
          step="0.1"
          required={false}
          placeholder="e.g. 7.5"
        />
        <Field
          label="Weight · kg"
          name="weight"
          value={record.weight}
          min="20"
          max="500"
          step="0.1"
          required={false}
          placeholder="e.g. 74.5"
        />
        <p className="form-hint">
          Manual entries. Wearable devices are not connected.
        </p>
        <button className="primary-button full-width" disabled={disabled}>
          {disabled ? "Future entries aren’t available" : "Save daily metrics"}
          <Check size={16} />
        </button>
      </form>
    </>
  );
}
function SettingsForm({ profile, onSubmit }) {
  return (
    <>
      <span className="eyebrow">BUILT AROUND YOUR LIFE</span>
      <h2 id="modal-title">Your goals. Your way.</h2>
      <p>These preferences shape your plan and daily targets.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({
            ...profile,
            name: f.get("name").trim(),
            goal: f.get("goal"),
            ...Object.fromEntries(
              [
                "days",
                "calories",
                "protein",
                "carbs",
                "fats",
                "steps",
                "sleep",
                "water",
                "startWeight",
                "targetWeight",
              ].map((k) => [k, Number(f.get(k))]),
            ),
          });
        }}
      >
        <Field label="Your name" name="name" type="text" value={profile.name} />
        <div className="form-grid">
          <label className="field">
            Training goal
            <select name="goal" defaultValue={profile.goal}>
              <option value="muscle">Build lean muscle</option>
              <option value="fatloss">Lose fat</option>
              <option value="endurance">Improve endurance</option>
              <option value="wellbeing">Feel healthier</option>
            </select>
          </label>
          <label className="field">
            Sessions per week
            <select name="days" defaultValue={profile.days}>
              {[3, 4, 5, 6].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>
        <h3 className="form-section-title">Daily targets</h3>
        <div className="form-grid">
          {[
            ["Calories · kcal", "calories", 500, 10000, 1],
            ["Protein · g", "protein", 1, 500, 1],
            ["Carbs · g", "carbs", 1, 1000, 1],
            ["Fats · g", "fats", 1, 500, 1],
            ["Steps", "steps", 100, 100000, 1],
            ["Sleep · hours", "sleep", 1, 16, 0.5],
            ["Water · glasses", "water", 1, 20, 1],
          ].map(([label, k, min, max, step]) => (
            <Field
              key={k}
              label={label}
              name={k}
              value={profile[k]}
              min={min}
              max={max}
              step={step}
            />
          ))}
        </div>
        <h3 className="form-section-title">Your weight journey</h3>
        <div className="form-grid">
          <Field
            label="Starting weight · kg"
            name="startWeight"
            value={profile.startWeight}
            min="20"
            max="500"
            step="0.1"
          />
          <Field
            label="Target weight · kg"
            name="targetWeight"
            value={profile.targetWeight}
            min="20"
            max="500"
            step="0.1"
          />
        </div>
        <p className="form-hint">
          Targets are personal preferences, not prescribed recommendations.
          Existing logged sessions keep their original plan.
        </p>
        <button className="primary-button full-width">
          Save preferences <Check size={16} />
        </button>
      </form>
    </>
  );
}
function PlanForm({ plan, onSubmit, disabled }) {
  return (
    <>
      <span className="eyebrow">MAKE IT YOUR OWN</span>
      <h2 id="modal-title">A plan with purpose.</h2>
      <p>
        Customize the selected day. Started sessions keep their original plan.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            names = String(f.get("exercises"))
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean);
          if (!names.length) {
            e.currentTarget.elements.exercises.setCustomValidity(
              "Add at least one exercise.",
            );
            e.currentTarget.reportValidity();
            return;
          }
          onSubmit({
            title: f.get("title").trim(),
            type: f.get("type"),
            duration: Number(f.get("duration")),
            focus: f.get("focus"),
            exercises: names.slice(0, 15).map((name) => ({
              name,
              sets: Number(f.get("sets")),
              reps: Number(f.get("reps")),
            })),
          });
        }}
      >
        <Field
          label="Session name"
          name="title"
          type="text"
          value={plan.title}
        />
        <Field label="Focus" name="focus" type="text" value={plan.focus} />
        <div className="form-grid">
          <label className="field">
            Session type
            <select name="type" defaultValue={plan.type}>
              {["Strength", "Endurance", "Recovery"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <Field
            label="Duration · minutes"
            name="duration"
            value={plan.duration}
            min="5"
            max="240"
          />
        </div>
        <label className="field">
          Exercises · one per line
          <textarea
            required
            name="exercises"
            rows="5"
            defaultValue={plan.exercises.map((x) => x.name).join("\n")}
            onChange={(e) => e.target.setCustomValidity("")}
          />
        </label>
        <div className="form-grid">
          <Field
            label="Sets per exercise"
            name="sets"
            value="3"
            min="1"
            max="10"
          />
          <Field
            label="Reps per set"
            name="reps"
            value="10"
            min="1"
            max="100"
          />
        </div>
        <button className="primary-button full-width" disabled={disabled}>
          Save day’s plan <Check size={16} />
        </button>
      </form>
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <>
    <Entrance />
    <App />
  </>,
);
