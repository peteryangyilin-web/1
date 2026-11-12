import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
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
import MealForm from "./components/MealForm";
import {getTrainingContext, TRAINING_SOURCES} from "./trainingPlanner";
import TrainingSetup from "./components/TrainingSetup";
import TrainingFeedback from "./components/TrainingFeedback";
import { getProfileGuidance } from "./profileGuidance";
import OverviewProfile from "./components/OverviewProfile";
import OverviewWelcome from "./components/OverviewWelcome";
import AvatarEditor from "./components/AvatarEditor";
import Entrance from "./components/Entrance";
import AccountRoot from "./accounts/AccountRoot";
import AccountPanel from "./accounts/AccountPanel";
import "./components/navigation.css";
import "./colorTheme.css";
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
function App({initialStore,onStoreChange,account=null,syncStatus,onSignIn,onSignOut,isAdmin=false,requireAccount=false,accountUnavailable=false}) {
  const [store, setStore] = useState(()=>initialStore??loadStore()),
    [selected, setSelected] = useState(() => dateKey(new Date())),
    [tab, setTab] = useState("Overview"),
    [modal, setModal] = useState(null),
    [notice, setNotice] = useState(false),
    [toast, setToast] = useState(""),
    [saveError, setSaveError] = useState(false),
    [clock, setClock] = useState(Date.now()),
    [drawerOpen, setDrawerOpen] = useState(false),
    [overviewVisit, setOverviewVisit] = useState(0),
    [overviewStarted, setOverviewStarted] = useState(false);
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
    trainingWeight = Object.entries(store.records).filter(([d,r])=>d<=today&&r.weight!=null).sort(([a],[b])=>a.localeCompare(b)).at(-1)?.[1].weight,
    trainingProfile = {...profile,currentWeight:trainingWeight??profile.startWeight},
    trainingContext = getTrainingContext(trainingProfile, store.records, selected),
    plan = getPlan(selected, trainingProfile, record, store.records),
    trainingRestricted = trainingContext.blocked || plan.blocked,
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
    if (onStoreChange) {onStoreChange(store);return;}
    if (requireAccount) return;
    try {
      localStorage.setItem("forma-v2", JSON.stringify(store));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [store,onStoreChange,requireAccount]);
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
  const openProfile = () => {if(requireAccount){onSignIn?.();return;}setModal({type:"settings"});};
  const navigate = (label) => {
    if(requireAccount&&label!=="Overview"){closeDrawer();onSignIn?.();return;}
    closeDrawer(drawerRef.current?.contains(document.activeElement));
    setTab(label);
    if (label === "Overview") setOverviewStarted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openSession = () => {
    if (trainingRestricted && !complete) { setModal({type:"trainingSetup"}); return; }
    if (!plan.exercises.length) { notify("This is a rest day. No scheduled session to start."); return; }
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
    !trainingRestricted && updateDay((r) => {
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
    !trainingRestricted && updateDay((r) => ({
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
    if(trainingRestricted){notify("Training is paused. Review your current exercise needs.");return;}
    if (!completedSets(session)) {
      notify("Check off at least one completed set to save this session.");
      return;
    }
    setModal({type:"trainingFeedback"});
  };
  const saveTrainingFeedback = (feedback) => {
    updateDay({session:{...session,elapsed:elapsedSeconds(session),runningSince:null,completedAt:new Date().toISOString(),feedback}});
    setModal(null);
    notify(feedback ? "Session and feedback saved." : "Session saved. No automatic progression without feedback.");
  };

  useEffect(()=>{
    if(trainingRestricted&&session?.runningSince)updateDay({session:{...session,elapsed:elapsedSeconds(session),runningSince:null}});
  },[trainingRestricted,session?.runningSince,selected]);
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
  const initials = (profile.name||"")
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("") || "GO";
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
              openProfile();
            }}
          >
            <Settings size={18} />
            <span>Settings & goals</span>
          </button>
          <button
            className="profile-button"
            onClick={() => {
              closeDrawer(true);
              openProfile();
            }}
          >
            <div className="avatar">{profile.avatar ? <img src={profile.avatar} alt="" /> : initials}</div>
            <div>
              <strong>{profile.name?.trim()||"Your space"}</strong>
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
              href="/"
              aria-label="GO home"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                setOverviewVisit((visit) => visit + 1);
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
            <span className={"saved-state " + (saveError||["error","conflict"].includes(syncStatus) ? "error" : "")}>
              <i />
              {account ? syncStatus==="saved"?"Saved to your account":syncStatus==="saving"?"Saving to your account…":"Sync paused" : requireAccount?"Your own GO account":saveError ? "Storage unavailable" : "Saved on this device"}
            </span>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotice(!notice)}
            >
              <Bell size={18} />
              {weekComplete > 0 && <i className="notification-dot" />}
            </button>
            {account?<>{isAdmin&&<a className="account-access" href="/admin">Admin</a>}</>:<button className="account-access" onClick={()=>onSignIn?.('signin')} aria-label="Sign in to GO">Sign in</button>}
            {account && <button
              className="avatar"
              aria-label="Profile settings"
              onClick={openProfile}
            >
              {profile.avatar ? <img src={profile.avatar} alt="" /> : initials}
            </button>}
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
                {account?"Your saved progress belongs to this account. Export a copy from Progress.":"Data is stored in this browser. Export a copy from Progress."}
              </small>
            </div>
          )}
        </header>
        <main className={tab === "Overview" && !overviewStarted ? "overview-welcome-main" : undefined}>
          {accountUnavailable&&<div className="account-preview-note" role="status">Accounts are not available yet. This preview saves progress only in this browser.</div>}
          {saveError && (
            <div className="storage-warning">
              Changes cannot be saved in this browser. Export your data before
              leaving. <button onClick={exportData}>Export now</button>
            </div>
          )}
          {(tab !== "Overview" || overviewStarted) && <section className={"greeting " + (tab === "Overview" ? "overview-greeting" : "")}>
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
                  ? "A little about you. A plan that feels like you."
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
          </section>}
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
          {tab === "Overview" && !overviewStarted && (
            <OverviewWelcome profile={profile} onStart={() => {
              if(requireAccount){onSignIn?.('signup');return;}
              setOverviewStarted(true);
              window.scrollTo({ top: 0, behavior: "instant" });
            }} />
          )}
          {tab === "Overview" && overviewStarted && (
            <OverviewProfile
              key={overviewVisit}
              profile={profile}
              cloudAccount={!!account}
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
          {tab === "Training" && <div className="training-setup-actions"><span>Training setup · your time, equipment and current ability</span><button className="secondary-button" onClick={()=>setModal({type:"trainingSetup"})}>{trainingRestricted?"Complete training setup":"Edit training setup"}</button></div>}
          {tab === "Training" && trainingRestricted && <section className="training-plan-status" role="status"><h3>{({needs_input:"Complete your training setup",review_required:"Individual assessment needed",urgent_review:"Pause training",specialist_path:"Specialist pathway"})[trainingContext.status]||plan.title}</h3><p>{trainingContext.status==='needs_input'?'A few answers about your recent training, available time and health will help us build your starting week.':trainingContext.reasons.join(' ')||plan.rationale}</p>{trainingContext.missing.length>0&&<details><summary>What’s needed</summary><p>{trainingContext.missing.join(' · ')}</p></details>}<p>Existing sessions remain in your history. New adult plans use the supplied rule-based algorithm, not an assessment or medical clearance.</p><details><summary>Activity and specialist resources</summary>{TRAINING_SOURCES.filter(s=>["S01","S04",trainingContext.older?"S09":trainingContext.youth?"S10":"S11"].includes(s.id)).map(s=><p key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></p>)}</details></section>}
          {tab === "Training" && plan.weekly && !trainingRestricted && <section className="training-plan-totals" aria-label="Weekly dose and reference"><strong>This week · {plan.weekly.strengthDays} strength days · {plan.weekly.moderateEquivalentMinutes} aerobic minutes · {plan.weekly.totalMinutes} total minutes</strong><p>{plan.weekly.gap}</p>{plan.weekly.adherence!==null&&plan.weekly.adherence<.7&&<p>Recorded completion last week was below 70%. Check whether time, equipment, enjoyment or fatigue was the barrier before changing the physical load. Update your setup or record this in session feedback.</p>}<details><summary>Reference and plan details</summary><p>{plan.weekly.reference} Easy recovery and strength time are not counted as moderate aerobic activity. Secondary muscles are not double-counted as full sets.</p><p>{plan.progression}</p><p>Template {plan.templateVersion} · GO product rules, pending professional template review.</p>{TRAINING_SOURCES.map(source=><p key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.id} · {source.label} ↗</a></p>)}</details></section>}
          {tab === "Training" && <section className="training-week-guide" aria-label="Your goal-based training week"><div><strong>Your week · {plan.goalLabel}</strong><p>Choose a day to see its session. Saved sessions keep their original plan.</p></div><div className="training-week-cards">{dates.map(day=>{const p=getPlan(day,trainingProfile,store.records[day],store.records);return <button type="button" key={day} aria-pressed={day===selected} aria-label={`View ${p.title} on ${shortDate(day)}`} onClick={()=>setSelected(day)}><span>{parseDate(day).toLocaleDateString('en-US',{weekday:'short'})}</span><strong>{p.title}</strong><small>{p.duration} min · {p.type}</small></button>})}</div></section>}
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
                    disabled={!!session||trainingRestricted}
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
                  <button className="lime-button" onClick={openSession} disabled={(trainingRestricted&&!complete)||(!plan.exercises.length&&!complete)}>
                    {trainingRestricted&&!complete ? "Complete setup / review" : !plan.exercises.length ? "Rest day" : complete
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
                    {plan.rationale || "Your avatar, your coach. Watch the movement, then open the form tips."}
                  </p>
                  {(session||record.customPlan)&&<p className="setup-help">{session?"This saved session keeps the plan it started with. New goal preferences apply to unstarted days.":"Your custom plan is active for this day; goal-based suggestions apply to other unstarted days."}</p>}
                  {plan.warmup&&<p className="session-preparation"><strong>Warm-up:</strong> {plan.warmup}</p>}
                  {plan.balance&&<p className="session-preparation"><strong>Supported balance · {plan.balance.minutes} min:</strong> {plan.balance.instruction}</p>}
                  {plan.exercises.map((e, i) => (
                    <div className="cat-outline-row" key={e.name + i}>
                      <div className="cat-outline-header">
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <strong>{e.name}</strong>
                        <small>
                          {e.prescription||`${e.sets} × ${e.reps}`}
                        </small>
                      </div>
                      {(e.effort||e.note)&&<p className="exercise-dose"><strong>{e.repRange?`${e.sets} working sets · ${e.repRange} reps · ${e.restSeconds}s rest. `:""}</strong>{e.effort} {e.note} {e.loadAdvice}</p>}
                      <ExerciseDemo name={e.name} profile={profile} compact />
                    </div>
                  ))}
                  {plan.cooldown&&<p className="session-preparation"><strong>Cool-down:</strong> {plan.cooldown}</p>}
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
              <div className="nutrition-date-note"><span>{isFuture ? `You’re viewing ${shortDate(selected)} in the future. Meal logging opens on that day.` : `Meals below belong to ${shortDate(selected)}. Calories update as you add, edit or remove food.`}</span>{selected!==today&&<button type="button" className="secondary-button" onClick={()=>setSelected(today)}>Go to today to log food</button>}</div>
              {record.meals.some(m=>['protein','carbs','fats'].some(k=>m[k]==null))&&<p className="food-estimate-note">Some meals have no macro details. Macro totals include only the values you entered or estimated; calorie totals include every meal.</p>}
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
                            <small>{m.category || "Meal"}{m.nutritionSource?.includes("estimate")?" · estimated":""}</small>
                          </strong>
                        </div>
                        <span>
                          {niceNumber(m.calories)}
                          <small> kcal</small>
                        </span>
                        <span>
                          {m.protein==null?"—":niceNumber(m.protein)}
                          <small> g</small>
                        </span>
                        <span>
                          {m.carbs==null?"—":niceNumber(m.carbs)}
                          <small> g</small>
                        </span>
                        <span>
                          {m.fats==null?"—":niceNumber(m.fats)}
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
                      : profile.targetWeight==null ? "Set a weight target in your profile, if useful to you." : `Goal: ${profile.targetWeight} kg · ${goalProgress}% of the way`
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
          {(tab !== "Overview" || overviewStarted) && <footer>
            <span className="footer-logo">
              GO<sup>®</sup>
            </span>
            <p>Built around you. Built for the long run.</p>
            <span>
              <span className="green-dot" /> ALL IN GOOD FORM
            </span>
          </footer>}
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
              "modal " + (modal.type === "workout" ? "workout-modal" : ["settings","account","trainingSetup","trainingFeedback"].includes(modal.type) ? "profile-modal" : "")
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
                presets={PRESETS}
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
            ) : modal.type === "trainingSetup" ? (
              <TrainingSetup profile={profile} onSave={setup=>{setStore(s=>({...s,profile:{...s.profile,age:Number(setup.age),goal:setup.goal,days:setup.windows.length,trainingSetup:setup}}));setModal(null);notify("Training setup saved. Unstarted sessions now use your new information.");}}/>
            ) : modal.type === "trainingFeedback" && session ? (
              <TrainingFeedback onSave={saveTrainingFeedback}/>
            ) : modal.type === "account" && account ? (
              <>
                <button className="account-back" onClick={openProfile}><ArrowLeft size={15}/> Back to profile</button>
                <AccountPanel user={account} onSignOut={onSignOut}/>
              </>
            ) : modal.type === "settings" ? (
              <>
              <SettingsForm
                profile={profile}
                onSubmit={(v) => {
                  setStore((s) => ({ ...s, profile: v }));
                  setModal(null);
                  notify("Profile saved.");
                }}
              />
              {account && <button className="profile-account-link" onClick={()=>setModal({type:"account"})}><span>Account</span><ChevronRight size={18}/></button>}
              </>
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
                    <button className="secondary-button" onClick={toggleTimer} disabled={trainingRestricted}>
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
                {session.plan.warmup&&<p className="session-preparation"><strong>Warm-up:</strong> {session.plan.warmup}</p>}
                {session.plan.balance&&<p className="session-preparation"><strong>Supported balance · {session.plan.balance.minutes} min:</strong> {session.plan.balance.instruction}</p>}
                <div className="exercise-list">
                  {session.plan.exercises.map((e, ei) => (
                    <section key={ei}>
                      <h3>
                        <span>{String(ei + 1).padStart(2, "0")}</span>
                        {e.name}
                      </h3>
                      {e.prescription&&<p className="exercise-dose">{e.prescription}{e.kind!=="time"?` · ${e.restSeconds}s rest · ${e.effort}`:" · Complete the planned minutes at your chosen pace."}</p>}
                      {e.loadAdvice&&<p className="exercise-dose">{e.loadAdvice}</p>}
                      <ExerciseDemo name={e.name} profile={profile} />
                      <div className="set-header">
                        <span>SET</span>
                        <span>{e.kind==="time"?"LOAD · N/A":"WEIGHT · KG"}</span>
                        <span>{e.kind==="time"?"MINUTES":"REPS"}</span>
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
                            value={s.weight??""}
                            disabled={complete||trainingRestricted||e.kind==="time"}
                            onChange={(ev) => {
                              if(ev.target.value===''){setWorkoutSet(ei,si,"weight",null);return;}
                              const v = ev.target.valueAsNumber;
                              if (Number.isFinite(v) && v >= 0 && v <= 1000)
                                setWorkoutSet(ei, si, "weight", v);
                            }}
                          />
                          <input
                            aria-label={`${e.name} set ${si + 1} ${e.kind==="time"?"minutes":"reps"}`}
                            type="number"
                            min="1"
                            max="500"
                            value={s.reps}
                            disabled={complete||trainingRestricted}
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
                            disabled={complete||trainingRestricted}
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
                        disabled={trainingRestricted}
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
                  {account?"Your sets and timer sync to your GO account. Check the save status before leaving.":"Your sets and timer are saved automatically on this device."}
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
  const hasTarget = Number(profile.calories)>0;
  const fill = hasTarget ? Math.min(1, totals.calories / profile.calories) : 0;
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
            aria-label={hasTarget ? `${Math.round(fill * 100)} percent of calorie target` : "Calories logged; no target set"}
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
            <span>{hasTarget ? `of ${niceNumber(profile.calories)} kcal` : "kcal logged"}</span>
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
                  <small>{profile[k]>0 ? ` / ${profile[k]} g` : " g logged"}</small>
                </strong>
              </div>
              <div className="macro-track">
                <i
                  style={{
                    width: (profile[k]>0 ? Math.min(100, (totals[k] / profile[k]) * 100) : 0) + "%",
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
  const [avatar, setAvatar] = useState(profile.avatar || null);
  const [editingAvatar, setEditingAvatar] = useState(false);
  return (
    <>
      <h2 id="modal-title">Your profile</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit({ ...profile, avatar, name: f.get("name").trim() });
      }}>
        <div className="settings-avatar-section">
          <div className="settings-avatar-row">
            <div className="settings-avatar-preview">{avatar ? <img src={avatar} alt="Your profile photo" /> : <Activity size={28} strokeWidth={1.3} />}</div>
            <div>
              <button type="button" className="secondary-button" onClick={() => setEditingAvatar(true)}>{avatar ? "Change profile photo" : "Upload your profile photo"}</button>
              {avatar && <button type="button" className="settings-avatar-remove" onClick={() => setAvatar(null)}>Remove profile photo</button>}
            </div>
          </div>
        </div>
        <Field label="Your name" name="name" type="text" value={profile.name} />
        <button className="primary-button full-width">Save profile <Check size={16} /></button>
      </form>
      {editingAvatar && <AvatarEditor value={avatar} onClose={() => setEditingAvatar(false)} onSave={photo => { setAvatar(photo); setEditingAvatar(false); }} />}
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
    <AccountRoot renderApp={props=><App {...props}/>}/>
  </>,
);
