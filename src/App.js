import { useState, useCallback } from "react";

const STORAGE_KEY = "workout_logs_v1";

const EXERCISES = [
  // Chest
  "Bench Press", "Incline Bench Press", "Decline Bench Press",
  "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press",
  "Dumbbell Fly", "Incline Dumbbell Fly", "Cable Fly", "Low Cable Fly",
  "High Cable Fly", "Pec Deck Fly", "Reverse Pec Deck Fly",
  "Push-ups", "Dips", "Machine Chest Press", "Smith Machine Bench Press",

  // Back
  "Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Barbell Row",
  "Pendlay Row", "Dumbbell Row", "T-Bar Row", "Seal Row",
  "Pull-ups", "Chin-ups", "Lat Pulldown", "Wide Grip Lat Pulldown",
  "Close Grip Lat Pulldown", "Cable Row", "Seated Cable Row",
  "Single Arm Cable Row", "Machine Row", "Straight Arm Pulldown",
  "Face Pull", "Hyperextension", "Good Morning",

  // Shoulders
  "Overhead Press", "Dumbbell Shoulder Press", "Arnold Press",
  "Lateral Raise", "Cable Lateral Raise", "Front Raise",
  "Dumbbell Front Raise", "Rear Delt Fly", "Cable Rear Delt Fly",
  "Machine Shoulder Press", "Smith Machine Shoulder Press",
  "Upright Row", "Shrugs", "Barbell Shrugs", "Dumbbell Shrugs",

  // Biceps
  "Bicep Curl", "Barbell Curl", "EZ Bar Curl", "EZ Bar Hammer Curl",
  "Dumbbell Curl", "Hammer Curl", "Incline Dumbbell Curl",
  "Decline Dumbbell Curl", "Concentration Curl", "Preacher Curl",
  "Cable Curl", "Cable Hammer Curl", "Machine Curl",
  "Spider Curl", "Reverse Curl", "Zottman Curl",

  // Triceps
  "Tricep Pushdown", "Cable Tricep Pushdown", "Rope Pushdown",
  "Overhead Tricep Extension", "Skull Crushers", "EZ Bar Skull Crusher",
  "Close Grip Bench Press", "Diamond Push-ups", "Tricep Kickback",
  "Cable Overhead Tricep Extension", "Machine Tricep Extension",

  // Legs - Quads
  "Squat", "Back Squat", "Front Squat", "Goblet Squat",
  "Bulgarian Split Squat", "Split Squat", "Hack Squat",
  "Pendulum Squat", "Leg Press", "Leg Extension",
  "Sissy Squat", "Smith Machine Squat", "Overhead Squat",
  "Box Squat", "Pause Squat", "Zercher Squat",

  // Legs - Hamstrings & Glutes
  "Lying Leg Curl", "Seated Leg Curl", "Nordic Curl",
  "Hip Thrust", "Barbell Hip Thrust", "Glute Bridge",
  "Cable Kickback", "Donkey Kickback",
  "Single Leg Romanian Deadlift", "Step Up", "Reverse Lunge",
  "Walking Lunge", "Lateral Lunge",

  // Calves
  "Standing Calf Raise", "Seated Calf Raise", "Leg Press Calf Raise",
  "Donkey Calf Raise", "Single Leg Calf Raise",

  // Core
  "Plank", "Ab Wheel Rollout", "Cable Crunch", "Hanging Leg Raise",
  "Decline Sit-up", "Russian Twist", "Pallof Press",
  "Landmine Rotation", "Woodchop", "Side Plank",

  // Olympic & Compound
  "Power Clean", "Hang Clean", "Clean and Jerk", "Snatch",
  "Thruster", "Farmer's Carry", "Trap Bar Deadlift",
];

function today() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function volume(entry) {
  return entry.sets * entry.reps * entry.weight;
}

function suggestWeight(weight) {
  return Math.round((weight * 1.025) / 2.5) * 2.5;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0a;
    --bg2: #111111;
    --bg3: #181818;
    --card: #141414;
    --border: rgba(255,255,255,0.07);
    --border-bright: rgba(255,255,255,0.15);
    --accent: #C8F135;
    --accent2: #FF4D4D;
    --text: #f0f0f0;
    --text2: #888;
    --text3: #555;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-sm: 8px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }

  .app { max-width: 720px; margin: 0 auto; padding: 0 0 6rem; min-height: 100vh; }

  .header { padding: 2.5rem 1.5rem 1.5rem; position: relative; overflow: hidden; }
  .header::before { content:''; position:absolute; top:-60px; right:-40px; width:220px; height:220px; background:var(--accent); opacity:0.04; border-radius:50%; pointer-events:none; }

  .header-eyebrow { font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--accent); margin-bottom:4px; font-weight:500; }
  .header-title { font-family:var(--font-display); font-size:clamp(40px,8vw,56px); letter-spacing:0.03em; line-height:1; color:var(--text); }
  .header-title span { color:var(--accent); }
  .header-date { font-size:13px; color:var(--text3); margin-top:6px; }

  .tabs { display:flex; gap:0; margin:0 1.5rem 1.5rem; border:0.5px solid var(--border); border-radius:var(--radius-sm); padding:3px; background:var(--bg2); }
  .tab-btn { flex:1; padding:9px 12px; border:none; background:transparent; color:var(--text2); font-family:var(--font-body); font-size:13px; font-weight:400; cursor:pointer; border-radius:6px; transition:all 0.15s; text-align:center; }
  .tab-btn.active { background:var(--accent); color:#000; font-weight:500; }
  .tab-btn:not(.active):hover { color:var(--text); background:var(--bg3); }

  .content { padding:0 1.5rem; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .card { background:var(--card); border:0.5px solid var(--border); border-radius:var(--radius); padding:1.25rem; margin-bottom:1rem; }
  .card-title { font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); margin-bottom:1rem; font-weight:500; }

  .form-grid { display:grid; grid-template-columns:1fr 90px 70px 70px; gap:8px; margin-bottom:10px; }
  @media(max-width:500px){ .form-grid{ grid-template-columns:1fr 1fr; } }

  .field { display:flex; flex-direction:column; gap:5px; }
  .field label { font-size:11px; color:var(--text3); letter-spacing:0.05em; text-transform:uppercase; font-weight:500; }
  .field input, .field select { background:var(--bg3); border:0.5px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:var(--font-body); font-size:14px; padding:9px 12px; outline:none; transition:border-color 0.15s; width:100%; -webkit-appearance:none; }
  .field input:focus, .field select:focus { border-color:var(--accent); }
  .field input::placeholder { color:var(--text3); }
  .field select option { background:var(--bg3); }

  .notes-row { margin-bottom:10px; }
  .notes-row input { background:var(--bg3); border:0.5px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-family:var(--font-body); font-size:14px; padding:9px 12px; outline:none; transition:border-color 0.15s; width:100%; }
  .notes-row input:focus { border-color:var(--border-bright); }
  .notes-row input::placeholder { color:var(--text3); }

  .add-btn { width:100%; padding:12px; background:var(--accent); color:#000; border:none; border-radius:var(--radius-sm); font-family:var(--font-display); font-size:18px; letter-spacing:0.05em; cursor:pointer; transition:all 0.15s; margin-top:4px; }
  .add-btn:hover { opacity:0.9; transform:translateY(-1px); }
  .add-btn:active { transform:translateY(0); }

  .export-btn { display:flex; align-items:center; gap:6px; margin-bottom:12px; padding:9px 16px; background:transparent; border:0.5px solid var(--accent); border-radius:var(--radius-sm); color:var(--accent); font-family:var(--font-body); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; letter-spacing:0.03em; }
  .export-btn:hover { background:rgba(200,241,53,0.08); }
  .export-btn::before { content:'↓'; font-size:15px; line-height:1; }

  .feedback { font-size:13px; height:18px; margin-top:6px; transition:all 0.2s; }
  .feedback.success { color:var(--accent); }
  .feedback.error { color:var(--accent2); }

  .section-label { font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text3); margin:1.5rem 0 0.75rem; font-weight:500; }

  .log-list { display:flex; flex-direction:column; gap:6px; }
  .log-item { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--bg2); border:0.5px solid var(--border); border-radius:var(--radius-sm); transition:border-color 0.15s; }
  .log-item:hover { border-color:var(--border-bright); }
  .log-name { font-size:14px; font-weight:500; color:var(--text); }
  .log-meta { font-size:12px; color:var(--text2); margin-top:2px; }
  .log-note { font-size:11px; color:var(--text3); margin-top:2px; font-style:italic; }
  .log-right { display:flex; align-items:center; gap:8px; }
  .log-date { font-size:11px; color:var(--text3); text-align:right; }

  .del-btn { background:none; border:none; color:var(--text3); cursor:pointer; font-size:18px; line-height:1; padding:2px 4px; border-radius:4px; transition:all 0.15s; }
  .del-btn:hover { color:var(--accent2); background:rgba(255,77,77,0.08); }

  .empty { text-align:center; padding:2.5rem 1rem; color:var(--text3); font-size:14px; border:0.5px dashed var(--border); border-radius:var(--radius); }
  .empty-icon { font-family:var(--font-display); font-size:36px; color:var(--border-bright); margin-bottom:8px; display:block; letter-spacing:0.05em; }

  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:1.25rem; }
  .stat-tile { background:var(--card); border:0.5px solid var(--border); border-radius:var(--radius-sm); padding:14px 12px; text-align:center; }
  .stat-num { font-family:var(--font-display); font-size:34px; color:var(--accent); letter-spacing:0.02em; line-height:1; }
  .stat-lbl { font-size:11px; color:var(--text3); margin-top:4px; text-transform:uppercase; letter-spacing:0.1em; }

  .progress-list { display:flex; flex-direction:column; gap:10px; }
  .progress-card { background:var(--card); border:0.5px solid var(--border); border-radius:var(--radius); padding:1.25rem; position:relative; overflow:hidden; transition:border-color 0.15s; }
  .progress-card:hover { border-color:var(--border-bright); }
  .progress-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--accent); opacity:0.5; }
  .progress-card.up::before { background:var(--accent); opacity:1; }
  .progress-card.same::before { background:#f0a500; opacity:1; }
  .progress-card.down::before { background:var(--accent2); opacity:1; }

  .progress-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
  .prog-name { font-size:16px; font-weight:500; color:var(--text); }
  .prog-date { font-size:11px; color:var(--text3); margin-top:2px; }
  .prog-weight { font-family:var(--font-display); font-size:28px; color:var(--text); letter-spacing:0.02em; text-align:right; }
  .prog-unit { font-size:12px; color:var(--text3); font-family:var(--font-body); }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:500; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:10px; }
  .badge.up { background:rgba(200,241,53,0.1); color:var(--accent); border:0.5px solid rgba(200,241,53,0.2); }
  .badge.same { background:rgba(240,165,0,0.1); color:#f0a500; border:0.5px solid rgba(240,165,0,0.2); }
  .badge.down { background:rgba(255,77,77,0.1); color:var(--accent2); border:0.5px solid rgba(255,77,77,0.2); }

  .bar-wrap { height:3px; background:var(--bg3); border-radius:2px; margin-bottom:10px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
  .bar-fill.up { background:var(--accent); }
  .bar-fill.same { background:#f0a500; }
  .bar-fill.down { background:var(--accent2); }

  .prog-suggest { font-size:12px; color:var(--text2); display:flex; align-items:center; gap:6px; }
  .prog-suggest strong { color:var(--accent); font-weight:500; }
  .prog-detail { font-size:12px; color:var(--text3); margin-bottom:10px; display:flex; gap:12px; flex-wrap:wrap; }
`;

export default function App() {
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [tab, setTab] = useState("log");
  const [form, setForm] = useState({ exercise: "", weight: "", sets: "", reps: "", notes: "" });
  const [feedback, setFeedback] = useState({ msg: "", type: "" });

  const saveLogs = useCallback((l) => {
    setLogs(l);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); } catch {}
  }, []);

  const todayLogs = logs.filter(l => l.date === today());
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSet = () => {
    const ex = form.exercise.trim();
    const wt = parseFloat(form.weight);
    const sets = parseInt(form.sets);
    const reps = parseInt(form.reps);
    if (!ex) return setFeedback({ msg: "Enter an exercise name.", type: "error" });
    if (!wt || !sets || !reps) return setFeedback({ msg: "Fill in weight, sets, and reps.", type: "error" });
    const entry = { id: Date.now(), exercise: ex, weight: wt, sets, reps, notes: form.notes.trim(), date: today(), ts: Date.now() };
    saveLogs([entry, ...logs]);
    setForm({ exercise: "", weight: "", sets: "", reps: "", notes: "" });
    setFeedback({ msg: "Set logged!", type: "success" });
    setTimeout(() => setFeedback({ msg: "", type: "" }), 2000);
  };

  const deleteLog = (id) => saveLogs(logs.filter(l => l.id !== id));

  const exportCSV = () => {
    const headers = ["Date", "Exercise", "Sets", "Reps", "Weight (lb)", "Volume", "Notes"];
    const rows = [...logs].reverse().map(l => [
      l.date, l.exercise, l.sets, l.reps, l.weight, volume(l), l.notes || ""
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workout-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const byExercise = {};
  logs.forEach(l => { if (!byExercise[l.exercise]) byExercise[l.exercise] = []; byExercise[l.exercise].push(l); });
  const progressExercises = Object.keys(byExercise).filter(ex => byExercise[ex].length >= 2);
  const uniqueDates = [...new Set(logs.map(l => l.date))];
  const uniqueExercises = [...new Set(logs.map(l => l.exercise))];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-eyebrow">Personal Trainer</div>
          <div className="header-title">IRON<span>LOG</span></div>
          <div className="header-date">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>

        <div className="tabs">
          {[["log", "Log Workout"], ["history", "History"], ["progress", "Overload"]].map(([id, label]) => (
            <button key={id} className={`tab-btn${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        <div className="content">
          {tab === "log" && (
            <>
              <div className="card">
                <div className="card-title">New set</div>
                <div className="form-grid">
                  <div className="field">
                    <label>Exercise</label>
                    <input list="ex-list" value={form.exercise} onChange={e => setField("exercise", e.target.value)} placeholder="Bench Press" />
                    <datalist id="ex-list">{EXERCISES.map(ex => <option key={ex} value={ex} />)}</datalist>
                  </div>
                  <div className="field">
                    <label>Weight (lb)</label>
                    <input type="number" value={form.weight} onChange={e => setField("weight", e.target.value)} placeholder="135" min="0" />
                  </div>
                  <div className="field">
                    <label>Sets</label>
                    <input type="number" value={form.sets} onChange={e => setField("sets", e.target.value)} placeholder="3" min="1" />
                  </div>
                  <div className="field">
                    <label>Reps</label>
                    <input type="number" value={form.reps} onChange={e => setField("reps", e.target.value)} placeholder="8" min="1" />
                  </div>
                </div>
                <div className="notes-row">
                  <input value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Notes (optional) — felt strong, paused reps..." />
                </div>
                <button className="add-btn" onClick={addSet}>Add Set</button>
                {feedback.msg && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}
              </div>

              {todayLogs.length > 0 ? (
                <>
                  <div className="section-label">Today's session — {todayLogs.length} set{todayLogs.length !== 1 ? "s" : ""}</div>
                  <div className="log-list">
                    {todayLogs.map(l => (
                      <div className="log-item" key={l.id}>
                        <div>
                          <div className="log-name">{l.exercise}</div>
                          <div className="log-meta">{l.sets} sets × {l.reps} reps @ {l.weight} lb · Vol: {volume(l).toLocaleString()}</div>
                          {l.notes && <div className="log-note">{l.notes}</div>}
                        </div>
                        <button className="del-btn" onClick={() => deleteLog(l.id)}>×</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty">
                  <span className="empty-icon">LIFT</span>
                  No sets logged today yet.<br />Add your first one above.
                </div>
              )}
            </>
          )}

          {tab === "history" && (
            <>
              <div className="stats-grid">
                {[
                  [uniqueDates.length, "Sessions"],
                  [logs.length, "Total Sets"],
                  [uniqueExercises.length, "Exercises"]
                ].map(([val, lbl]) => (
                  <div className="stat-tile" key={lbl}>
                    <div className="stat-num">{val}</div>
                    <div className="stat-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
              {logs.length === 0 ? (
                <div className="empty">
                  <span className="empty-icon">DATA</span>
                  No history yet.<br />Start logging sets to see your data.
                </div>
              ) : (
                <>
                  <button className="export-btn" onClick={exportCSV}>Download CSV</button>
                  <div className="log-list">
                    {logs.map(l => (
                      <div className="log-item" key={l.id}>
                        <div>
                          <div className="log-name">{l.exercise}</div>
                          <div className="log-meta">{l.sets} × {l.reps} @ {l.weight} lb · Vol: {volume(l).toLocaleString()}</div>
                          {l.notes && <div className="log-note">{l.notes}</div>}
                        </div>
                        <div className="log-right">
                          <div className="log-date">{l.date}</div>
                          <button className="del-btn" onClick={() => deleteLog(l.id)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "progress" && (
            progressExercises.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">PR</span>
                Log at least 2 sessions<br />of any exercise to see overload insights.
              </div>
            ) : (
              <div className="progress-list">
                {progressExercises.map(ex => {
                  const entries = [...byExercise[ex]].sort((a, b) => a.ts - b.ts);
                  const latest = entries[entries.length - 1];
                  const prev = entries[entries.length - 2];
                  const diff = volume(latest) - volume(prev);
                  const pct = volume(prev) ? Math.round((diff / volume(prev)) * 100) : 0;
                  const trend = diff > 0 ? "up" : diff === 0 ? "same" : "down";
                  const barWidth = Math.min(100, Math.max(5, pct + 50));
                  const badgeText = trend === "up" ? `Volume +${pct}%` : trend === "same" ? "Same volume" : `Volume ${pct}%`;
                  const suggestion = trend === "up"
                    ? `Next session: aim for ${suggestWeight(latest.weight)} lb`
                    : trend === "same"
                    ? "Try +1 rep or +5 lb next time"
                    : `Recover and hit ${latest.weight} lb again`;
                  return (
                    <div className={`progress-card ${trend}`} key={ex}>
                      <div className="progress-top">
                        <div>
                          <div className="prog-name">{ex}</div>
                          <div className="prog-date">{latest.date}</div>
                        </div>
                        <div>
                          <div className="prog-weight">{latest.weight}</div>
                          <div className="prog-unit">lb</div>
                        </div>
                      </div>
                      <div className="prog-detail">
                        <span>Sets: {latest.sets}</span>
                        <span>Reps: {latest.reps}</span>
                        <span>Vol: {volume(latest).toLocaleString()}</span>
                        <span>Prev vol: {volume(prev).toLocaleString()}</span>
                      </div>
                      <span className={`badge ${trend}`}>{badgeText}</span>
                      <div className="bar-wrap">
                        <div className={`bar-fill ${trend}`} style={{ width: `${barWidth}%` }} />
                      </div>
                      <div className="prog-suggest">
                        <span>→</span>
                        <strong>{suggestion}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
