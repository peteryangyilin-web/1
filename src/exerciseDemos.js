// Joint positions in a shared 300 × 220 drawing space. Each movement has its
// own start/end positions; equipment and limbs follow the same joints.
const stand = {
  head: [150, 52],
  shoulder: [150, 82],
  hip: [150, 132],
  leftElbow: [121, 109],
  rightElbow: [179, 109],
  leftWrist: [121, 143],
  rightWrist: [179, 143],
  leftKnee: [132, 158],
  rightKnee: [168, 158],
  leftAnkle: [126, 188],
  rightAnkle: [174, 188],
  rotation: 0,
};
const pose = (values = {}) => ({ ...stand, ...values });
const lift = (p, dy) =>
  Object.fromEntries(
    Object.entries(p).map(([k, v]) => [
      k,
      Array.isArray(v) ? [v[0], v[1] + dy] : v,
    ]),
  );
const squatTop = pose({
  leftWrist: [143, 104],
  rightWrist: [157, 104],
  leftElbow: [120, 106],
  rightElbow: [180, 106],
});
const squatLow = pose({
  head: [150, 77],
  shoulder: [150, 107],
  hip: [150, 155],
  leftWrist: [143, 128],
  rightWrist: [157, 128],
  leftElbow: [119, 130],
  rightElbow: [181, 130],
  leftKnee: [111, 158],
  rightKnee: [189, 158],
});
const bench = pose({
  head: [79, 126],
  shoulder: [109, 144],
  hip: [176, 147],
  leftShoulder: [107, 140],
  rightShoulder: [117, 145],
  leftElbow: [111, 112],
  rightElbow: [155, 118],
  leftWrist: [115, 85],
  rightWrist: [160, 85],
  leftKnee: [199, 166],
  rightKnee: [184, 166],
  leftAnkle: [220, 190],
  rightAnkle: [201, 190],
  rotation: -70,
});
const benchLow = pose({
  ...bench,
  leftElbow: [89, 162],
  rightElbow: [164, 164],
  leftWrist: [112, 132],
  rightWrist: [157, 132],
});
const incline = pose({
  ...bench,
  head: [93, 86],
  shoulder: [121, 110],
  leftShoulder: [114, 109],
  rightShoulder: [128, 115],
  leftElbow: [126, 78],
  rightElbow: [167, 88],
  leftWrist: [133, 48],
  rightWrist: [174, 58],
  rotation: -35,
});
const inclineLow = pose({
  ...incline,
  leftElbow: [101, 133],
  rightElbow: [163, 145],
  leftWrist: [104, 99],
  rightWrist: [166, 110],
});
const seated = pose({
  head: [150, 57],
  shoulder: [150, 87],
  hip: [150, 143],
  leftKnee: [119, 155],
  rightKnee: [181, 155],
  leftAnkle: [119, 189],
  rightAnkle: [181, 189],
});
const shoulderLow = pose({
  ...seated,
  leftElbow: [111, 100],
  rightElbow: [189, 100],
  leftWrist: [111, 68],
  rightWrist: [189, 68],
});
const shoulderHigh = pose({
  ...seated,
  leftElbow: [125, 52],
  rightElbow: [175, 52],
  leftWrist: [135, 23],
  rightWrist: [165, 23],
});
const row = pose({
  head: [129, 63],
  shoulder: [145, 92],
  hip: [148, 142],
  leftShoulder: [141, 91],
  rightShoulder: [153, 94],
  leftKnee: [188, 151],
  rightKnee: [185, 162],
  leftAnkle: [225, 186],
  rightAnkle: [212, 189],
  leftElbow: [181, 101],
  rightElbow: [191, 105],
  leftWrist: [222, 112],
  rightWrist: [226, 120],
});
const rowEnd = pose({
  ...row,
  leftElbow: [149, 121],
  rightElbow: [176, 125],
  leftWrist: [143, 133],
  rightWrist: [161, 136],
});
const pushup = pose({
  head: [75, 119],
  shoulder: [105, 138],
  hip: [169, 155],
  leftShoulder: [105, 137],
  rightShoulder: [116, 143],
  leftElbow: [105, 162],
  rightElbow: [124, 165],
  leftWrist: [108, 191],
  rightWrist: [130, 191],
  leftKnee: [201, 170],
  rightKnee: [207, 169],
  leftAnkle: [237, 189],
  rightAnkle: [245, 187],
  rotation: -60,
});
const pushupLow = pose({
  ...pushup,
  head: [75, 151],
  shoulder: [105, 169],
  hip: [169, 179],
  leftShoulder: [105, 169],
  rightShoulder: [116, 172],
  leftElbow: [88, 184],
  rightElbow: [119, 187],
  leftKnee: [203, 184],
  rightKnee: [209, 182],
});
const hinge = pose({
  head: [192, 95],
  shoulder: [173, 122],
  hip: [131, 136],
  leftShoulder: [165, 121],
  rightShoulder: [181, 121],
  leftElbow: [166, 144],
  rightElbow: [187, 143],
  leftWrist: [167, 170],
  rightWrist: [190, 170],
  leftKnee: [131, 160],
  rightKnee: [172, 160],
  leftAnkle: [120, 188],
  rightAnkle: [175, 188],
  rotation: 20,
});
const bentRow = pose({
  ...hinge,
  head: [183, 85],
  shoulder: [166, 113],
  hip: [126, 134],
  leftWrist: [133, 161],
  leftElbow: [147, 134],
  rightElbow: [195, 139],
  rightWrist: [209, 163],
});
const bentRowEnd = pose({
  ...bentRow,
  rightElbow: [190, 116],
  rightWrist: [160, 133],
});
const deadbug = pose({
  ...bench,
  head: [76, 160],
  shoulder: [105, 171],
  hip: [172, 173],
  leftShoulder: [105, 168],
  rightShoulder: [114, 173],
  leftElbow: [117, 138],
  rightElbow: [142, 142],
  leftWrist: [121, 105],
  rightWrist: [149, 111],
  leftKnee: [183, 133],
  rightKnee: [205, 138],
  leftAnkle: [209, 109],
  rightAnkle: [232, 115],
  rotation: -75,
});
const deadbugEnd = pose({
  ...deadbug,
  leftElbow: [86, 151],
  leftWrist: [53, 138],
  rightKnee: [218, 166],
  rightAnkle: [265, 176],
});
const lunge = pose({
  leftKnee: [118, 153],
  rightKnee: [191, 154],
  leftAnkle: [126, 190],
  rightAnkle: [221, 190],
  leftWrist: [125, 132],
  rightWrist: [175, 132],
});
const lungeLow = pose({
  ...lunge,
  head: [148, 78],
  shoulder: [148, 108],
  hip: [148, 155],
  leftElbow: [120, 131],
  rightElbow: [178, 131],
  leftWrist: [123, 159],
  rightWrist: [177, 159],
  leftKnee: [126, 154],
  rightKnee: [192, 186],
});
const walkA = pose({
  head: [150, 54],
  shoulder: [150, 84],
  hip: [150, 134],
  leftElbow: [118, 108],
  leftWrist: [102, 133],
  rightElbow: [182, 107],
  rightWrist: [175, 132],
  leftKnee: [121, 155],
  leftAnkle: [103, 188],
  rightKnee: [175, 156],
  rightAnkle: [190, 178],
});
const walkB = pose({
  ...walkA,
  head: [150, 51],
  shoulder: [150, 81],
  hip: [150, 131],
  leftElbow: [119, 110],
  leftWrist: [127, 135],
  rightElbow: [185, 104],
  rightWrist: [200, 125],
  leftKnee: [125, 154],
  leftAnkle: [111, 178],
  rightKnee: [182, 154],
  rightAnkle: [198, 188],
});
const entry = (id, title, frames, cues, extra = {}) => ({
  id,
  title,
  frames,
  cues,
  duration: 3.6,
  equipment: "none",
  ...extra,
});
export const EXERCISE_DEMOS = {
  squat: entry(
    "squat",
    "Goblet squat",
    [squatTop, squatLow, squatLow, squatTop],
    [
      "Feet about shoulder-width apart.",
      "Sit down between your hips; knees follow toes.",
      "Keep the weight close and stand tall.",
    ],
    { equipment: "goblet", phases: ["Sit down", "Stand tall"] },
  ),
  hinge: entry(
    "hinge",
    "Romanian deadlift",
    [pose(), hinge, hinge, pose()],
    [
      "Keep a soft bend in your knees.",
      "Push hips back and keep the weights close.",
      "Stand by driving your hips forward.",
    ],
    { equipment: "dumbbells", phases: ["Hips back", "Stand tall"] },
  ),
  bench: entry(
    "bench",
    "Barbell bench press",
    [bench, benchLow, benchLow, bench],
    [
      "Keep feet planted and shoulder blades supported.",
      "Lower the bar toward your mid-chest.",
      "Press up with wrists stacked over elbows.",
    ],
    {
      equipment: "barbell",
      bench: "flat",
      phases: ["Lower to chest", "Press up"],
    },
  ),
  incline: entry(
    "incline",
    "Incline dumbbell press",
    [incline, inclineLow, inclineLow, incline],
    [
      "Set the bench at a modest incline.",
      "Lower the dumbbells with forearms near vertical.",
      "Press upward without shrugging.",
    ],
    {
      equipment: "dumbbells",
      bench: "incline",
      phases: ["Lower slowly", "Press up"],
    },
  ),
  shoulder: entry(
    "shoulder",
    "Seated shoulder press",
    [shoulderLow, shoulderHigh, shoulderHigh, shoulderLow],
    [
      "Sit tall with your ribs stacked over your hips.",
      "Press the weights upward without arching your back.",
      "Lower under control to shoulder level.",
    ],
    {
      equipment: "dumbbells",
      bench: "seat",
      phases: ["Press overhead", "Return slowly"],
    },
  ),
  lateral: entry(
    "lateral",
    "Lateral raises",
    [
      pose(),
      pose({
        leftElbow: [104, 83],
        rightElbow: [196, 83],
        leftWrist: [75, 83],
        rightWrist: [225, 83],
      }),
      pose({
        leftElbow: [104, 83],
        rightElbow: [196, 83],
        leftWrist: [75, 83],
        rightWrist: [225, 83],
      }),
      pose(),
    ],
    [
      "Start with a light weight and softly bent elbows.",
      "Raise your arms out to shoulder height.",
      "Keep your shoulders relaxed as you lower.",
    ],
    {
      equipment: "dumbbells",
      phases: ["Raise to shoulder height", "Lower slowly"],
    },
  ),
  triceps: entry(
    "triceps",
    "Triceps rope pushdown",
    [
      pose({
        leftElbow: [129, 109],
        rightElbow: [171, 109],
        leftWrist: [140, 91],
        rightWrist: [160, 91],
      }),
      pose({
        leftElbow: [129, 109],
        rightElbow: [171, 109],
        leftWrist: [128, 144],
        rightWrist: [172, 144],
      }),
      pose({
        leftElbow: [129, 109],
        rightElbow: [171, 109],
        leftWrist: [128, 144],
        rightWrist: [172, 144],
      }),
      pose({
        leftElbow: [129, 109],
        rightElbow: [171, 109],
        leftWrist: [140, 91],
        rightWrist: [160, 91],
      }),
    ],
    [
      "Keep your elbows close to your sides.",
      "Extend your elbows and separate the rope ends.",
      "Return slowly without swinging your torso.",
    ],
    { equipment: "rope", phases: ["Extend elbows", "Return slowly"] },
  ),
  pulldown: entry(
    "pulldown",
    "Lat pulldown",
    [
      pose({
        ...seated,
        leftElbow: [105, 56],
        rightElbow: [195, 56],
        leftWrist: [113, 24],
        rightWrist: [187, 24],
      }),
      pose({
        ...seated,
        leftElbow: [108, 123],
        rightElbow: [192, 123],
        leftWrist: [113, 97],
        rightWrist: [187, 97],
      }),
      pose({
        ...seated,
        leftElbow: [108, 123],
        rightElbow: [192, 123],
        leftWrist: [113, 97],
        rightWrist: [187, 97],
      }),
      pose({
        ...seated,
        leftElbow: [105, 56],
        rightElbow: [195, 56],
        leftWrist: [113, 24],
        rightWrist: [187, 24],
      }),
    ],
    [
      "Sit tall and secure your thighs under the pad.",
      "Drive elbows down; bring the bar toward upper chest.",
      "Let the arms extend overhead under control.",
    ],
    {
      equipment: "pulldown",
      bench: "seat",
      phases: ["Elbows down", "Reach overhead"],
    },
  ),
  row: entry(
    "row",
    "Seated cable row",
    [row, rowEnd, rowEnd, row],
    [
      "Keep your torso tall and your spine neutral.",
      "Pull the handle toward your lower ribs.",
      "Reach forward without rounding your back.",
    ],
    {
      equipment: "cable",
      bench: "row",
      phases: ["Pull to lower ribs", "Reach forward"],
    },
  ),
  facepull: entry(
    "facepull",
    "Face pull",
    [
      pose({
        leftElbow: [177, 89],
        rightElbow: [190, 94],
        leftWrist: [224, 76],
        rightWrist: [230, 83],
      }),
      pose({
        leftElbow: [108, 91],
        rightElbow: [192, 91],
        leftWrist: [125, 61],
        rightWrist: [175, 61],
      }),
      pose({
        leftElbow: [108, 91],
        rightElbow: [192, 91],
        leftWrist: [125, 61],
        rightWrist: [175, 61],
      }),
      pose({
        leftElbow: [177, 89],
        rightElbow: [190, 94],
        leftWrist: [224, 76],
        rightWrist: [230, 83],
      }),
    ],
    [
      "Use a light rope attachment at face height.",
      "Pull toward your face with elbows wide.",
      "Keep your ribs down and return slowly.",
    ],
    { equipment: "face-cable", phases: ["Pull toward face", "Reach forward"] },
  ),
  curl: entry(
    "curl",
    "Dumbbell curl",
    [
      pose(),
      pose({ leftWrist: [137, 87], rightWrist: [163, 87] }),
      pose({ leftWrist: [137, 87], rightWrist: [163, 87] }),
      pose(),
    ],
    [
      "Stand tall with elbows beside your torso.",
      "Bend your elbows without swinging your shoulders.",
      "Lower the weights slowly.",
    ],
    { equipment: "dumbbells", phases: ["Curl up", "Lower slowly"] },
  ),
  pushup: entry(
    "pushup",
    "Push-up",
    [pushup, pushupLow, pushupLow, pushup],
    [
      "Keep a straight line from shoulders to heels.",
      "Lower with elbows angled slightly toward your sides.",
      "Push the floor away without dropping your hips.",
    ],
    { phases: ["Lower as one unit", "Push the floor away"] },
  ),
  dumbbellrow: entry(
    "dumbbellrow",
    "Dumbbell row",
    [bentRow, bentRowEnd, bentRowEnd, bentRow],
    [
      "Support one hand and keep a neutral back.",
      "Pull the weight toward your hip, elbow close.",
      "Lower without rotating your torso; switch sides.",
    ],
    {
      equipment: "single-dumbbell",
      bench: "support",
      phases: ["Pull to hip", "Lower slowly"],
    },
  ),
  deadbug: entry(
    "deadbug",
    "Dead bug",
    [deadbug, deadbugEnd, deadbugEnd, deadbug],
    [
      "Lie on your back with knees and arms raised.",
      "Extend the opposite arm and leg slowly.",
      "Keep your lower back steady; alternate sides.",
    ],
    { mat: true, phases: ["Opposite arm + leg", "Return, then switch"] },
  ),
  lunge: entry(
    "lunge",
    "Reverse lunge",
    [pose(), lungeLow, lungeLow, pose()],
    [
      "Step back and keep your front foot planted.",
      "Lower both knees with your torso tall.",
      "Drive through the front foot; alternate sides.",
    ],
    { phases: ["Lower both knees", "Stand and switch"] },
  ),
  calf: entry(
    "calf",
    "Calf raise",
    [pose(), lift(pose(), -12), lift(pose(), -12), pose()],
    [
      "Stand tall and use support for balance if needed.",
      "Rise onto the balls of your feet.",
      "Pause, then lower your heels slowly.",
    ],
    { toeContact: true, phases: ["Lift heels", "Lower with control"] },
  ),
  walk: entry(
    "walk",
    "Easy walk",
    [walkA, walkB, walkB, walkA],
    [
      "Walk at a comfortable, conversational pace.",
      "Keep your shoulders relaxed and look ahead.",
      "Let your arms swing naturally.",
    ],
    { duration: 2.4, phases: ["Easy steps", "Relax your shoulders"] },
  ),
  cardio: entry(
    "cardio",
    "Steady cardio",
    [walkA, walkB, walkB, walkA],
    [
      "Example shown: a steady, brisk walk.",
      "Choose a pace where you can still speak in sentences.",
      "Keep breathing comfortably and adjust your pace.",
    ],
    { duration: 1.7, phases: ["Steady pace", "Easy breathing"] },
  ),
  warmup: entry(
    "warmup",
    "Easy warm-up",
    [walkA, walkB, walkB, walkA],
    [
      "Begin with easy steps and relaxed arms.",
      "Increase your pace gradually.",
      "Keep the first few minutes comfortable.",
    ],
    { duration: 2.8, phases: ["Start gently", "Build gradually"] },
  ),
  cooldown: entry(
    "cooldown",
    "Cool-down",
    [walkA, walkB, walkB, walkA],
    [
      "Gradually slow your walking pace.",
      "Let your arms and shoulders relax.",
      "Breathe naturally as your effort eases.",
    ],
    { duration: 3.2, phases: ["Slow your pace", "Breathe naturally"] },
  ),
  hip: entry(
    "hip",
    "Hip mobility",
    [
      pose({ leftKnee: [117, 134], leftAnkle: [127, 162] }),
      pose({ leftKnee: [97, 138], leftAnkle: [107, 164] }),
      pose({ leftKnee: [97, 138], leftAnkle: [107, 164] }),
      pose({ leftKnee: [117, 134], leftAnkle: [127, 162] }),
    ],
    [
      "Stand tall; use support if you need balance.",
      "Lift one knee and gently open it to the side.",
      "Return slowly and repeat on the other side.",
    ],
    { phases: ["Open the hip gently", "Return and switch"] },
  ),
  mobility: entry(
    "mobility",
    "Shoulder mobility",
    [
      pose({
        leftElbow: [111, 106],
        rightElbow: [189, 106],
        leftWrist: [99, 129],
        rightWrist: [201, 129],
      }),
      pose({
        leftElbow: [117, 63],
        rightElbow: [183, 63],
        leftWrist: [128, 29],
        rightWrist: [172, 29],
      }),
      pose({
        leftElbow: [117, 63],
        rightElbow: [183, 63],
        leftWrist: [128, 29],
        rightWrist: [172, 29],
      }),
      pose({
        leftElbow: [111, 106],
        rightElbow: [189, 106],
        leftWrist: [99, 129],
        rightWrist: [201, 129],
      }),
    ],
    [
      "Stand tall with relaxed shoulders.",
      "Reach both arms up within a comfortable range.",
      "Lower slowly without arching your lower back.",
    ],
    { phases: ["Reach comfortably", "Lower slowly"] },
  ),
};
const mappings = [
  [/incline|上斜/i, "incline"],
  [/bench press|卧推/i, "bench"],
  [/shoulder press|overhead press|肩推|推举/i, "shoulder"],
  [/lateral raise|侧平举/i, "lateral"],
  [/triceps|pushdown|下压/i, "triceps"],
  [/romanian|deadlift|硬拉/i, "hinge"],
  [/squat|深蹲/i, "squat"],
  [/lunge|弓步/i, "lunge"],
  [/calf|提踵/i, "calf"],
  [/lat pulldown|高位下拉/i, "pulldown"],
  [/face pull|面拉/i, "facepull"],
  [/dumbbell row|哑铃划船/i, "dumbbellrow"],
  [/row|划船/i, "row"],
  [/curl|弯举/i, "curl"],
  [/push[ -]?up|俯卧撑/i, "pushup"],
  [/dead bug|死虫/i, "deadbug"],
  [/warm[ -]?up|热身/i, "warmup"],
  [/cool[ -]?down|放松/i, "cooldown"],
  [/steady cardio|有氧/i, "cardio"],
  [/walk|步行|散步/i, "walk"],
  [/hip mobility|髋/i, "hip"],
  [/shoulder mobility|肩部活动/i, "mobility"],
];
export function getExerciseDemo(name) {
  const match = mappings.find(([pattern]) => pattern.test(String(name)));
  return match ? EXERCISE_DEMOS[match[1]] : null;
}
