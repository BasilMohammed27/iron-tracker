export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  category: string;
  formTips: string;
}

export interface WorkoutDay {
  id: string;
  title: string;
  subtitle: string;
  focus: string;
  exercises: Exercise[];
}

export const WORKOUT_PLAN: WorkoutDay[] = [
  {
    id: "push-a",
    title: "Push A",
    subtitle: "Chest & Triceps Focus",
    focus: "Push",
    exercises: [
      { id: "pa-1", name: "Incline Dumbbell Bench Press", targetSets: 3, targetReps: "6–10", category: "Chest", formTips: "Set bench to 30°. Control the eccentric (2s down), touch upper chest, drive up." },
      { id: "pa-2", name: "Flat Barbell / Machine Press", targetSets: 3, targetReps: "8–12", category: "Chest", formTips: "Keep shoulder blades retracted and depressed against the pad." },
      { id: "pa-3", name: "Seated Dumbbell Shoulder Press", targetSets: 3, targetReps: "8–10", category: "Shoulders", formTips: "Keep core tight, press slightly inward at the top without locking elbows abruptly." },
      { id: "pa-4", name: "Cable Lateral Raises", targetSets: 3, targetReps: "12–15", category: "Shoulders", formTips: "Set pulley at wrist height. Maintain constant tension throughout the arc." },
      { id: "pa-5", name: "Rope Triceps Pushdowns", targetSets: 3, targetReps: "10–12", category: "Triceps", formTips: "Keep elbows pinned to your ribs. Spread the rope apart at full extension." },
      { id: "pa-6", name: "Overhead Cable Triceps Extension", targetSets: 3, targetReps: "12–15", category: "Triceps", formTips: "Step forward into a split stance; let elbows point forward for maximum long-head stretch." }
    ]
  },
  {
    id: "pull-a",
    title: "Pull A",
    subtitle: "Lats & Upper Back Focus",
    focus: "Pull",
    exercises: [
      { id: "pla-1", name: "Weighted Pull-Ups / Lat Pulldown", targetSets: 3, targetReps: "6–10", category: "Lats", formTips: "Drive elbows down toward your hip pockets. Chest up toward the bar." },
      { id: "pla-2", name: "Chest-Supported Row", targetSets: 3, targetReps: "8–12", category: "Upper Back", formTips: "Eliminates lower-back fatigue. Pull handles toward your hip crease." },
      { id: "pla-3", name: "Close-Grip Neutral Cable Row", targetSets: 3, targetReps: "10–12", category: "Back", formTips: "Squeeze scapulae together at peak contraction; control the negative." },
      { id: "pla-4", name: "Cable Face Pulls", targetSets: 3, targetReps: "12–15", category: "Rear Delts", formTips: "Pull toward your ears with high elbows, externally rotating your shoulders." },
      { id: "pla-5", name: "Incline Dumbbell Bicep Curls", targetSets: 3, targetReps: "10–12", category: "Biceps", formTips: "Set bench to 45°. Let arms hang completely straight to maximize long-head stretch." },
      { id: "pla-6", name: "Hammer Curls", targetSets: 3, targetReps: "10–12", category: "Biceps", formTips: "Neutral grip to target brachialis and forearm thickness." }
    ]
  },
  {
    id: "legs-a",
    title: "Legs A",
    subtitle: "Quad Dominant Focus",
    focus: "Legs",
    exercises: [
      { id: "la-1", name: "Barbell Back Squat / Hack Squat", targetSets: 3, targetReps: "6–8", category: "Quads", formTips: "Deep knee flexion with upright torso. Drive through mid-foot." },
      { id: "la-2", name: "Leg Press", targetSets: 3, targetReps: "10–12", category: "Quads", formTips: "Place feet mid-to-low on platform for optimal quad sweep." },
      { id: "la-3", name: "Leg Extensions", targetSets: 3, targetReps: "12–15", category: "Quads", formTips: "Pause for 1 second at the top peak contraction." },
      { id: "la-4", name: "Lying Leg Curls", targetSets: 3, targetReps: "10–12", category: "Hamstrings", formTips: "Keep hips pressed firmly against the pad; do not lift lower back." },
      { id: "la-5", name: "Standing Calf Raises", targetSets: 4, targetReps: "12–15", category: "Calves", formTips: "Full dorsiflexion stretch at the bottom for 2 seconds before exploding up." }
    ]
  },
  {
    id: "push-b",
    title: "Push B",
    subtitle: "Shoulders & Pec Tension Focus",
    focus: "Push",
    exercises: [
      { id: "pb-1", name: "Standing Barbell OHP", targetSets: 3, targetReps: "6–8", category: "Shoulders", formTips: "Brace glutes and core hard; press straight overhead past your face." },
      { id: "pb-2", name: "Flat Dumbbell Press", targetSets: 3, targetReps: "8–12", category: "Chest", formTips: "Deep chest stretch at the bottom; convergence at the top." },
      { id: "pb-3", name: "Cable Chest Flyes (High to Low)", targetSets: 3, targetReps: "12–15", category: "Chest", formTips: "Sweep hands downward and together to contract lower pecs." },
      { id: "pb-4", name: "Dumbbell Lateral Raises", targetSets: 4, targetReps: "12–15", category: "Shoulders", formTips: "Slight forward lean, pour water pitcher motion with pinkies slightly up." },
      { id: "pb-5", name: "Weighted Dips", targetSets: 3, targetReps: "8–10", category: "Chest / Triceps", formTips: "Slight forward torso lean to maximize lower chest involvement." },
      { id: "pb-6", name: "EZ-Bar Skullcrushers", targetSets: 3, targetReps: "10–12", category: "Triceps", formTips: "Lower bar just past the top of your head to load the triceps long head." }
    ]
  },
  {
    id: "pull-b",
    title: "Pull B",
    subtitle: "Thickness & Rear Delts Focus",
    focus: "Pull",
    exercises: [
      { id: "plb-1", name: "Barbell / T-Bar Row", targetSets: 3, targetReps: "6–10", category: "Back", formTips: "Hinge at 45°, pull bar into your lower ribcage." },
      { id: "plb-2", name: "Wide-Grip Seated Cable Row", targetSets: 3, targetReps: "8–12", category: "Upper Back", formTips: "Flare elbows outward to target rear delts and rhomboids." },
      { id: "plb-3", name: "Straight-Arm Cable Pulldown", targetSets: 3, targetReps: "12–15", category: "Lats", formTips: "Keep arms straight, push bar down in an arc to isolate lats without biceps." },
      { id: "plb-4", name: "Reverse Pec Deck Fly", targetSets: 3, targetReps: "15–20", category: "Rear Delts", formTips: "Keep thumbs pointed inward; squeeze rear delts with high reps." },
      { id: "plb-5", name: "Barbell Preacher Curl", targetSets: 3, targetReps: "8–10", category: "Biceps", formTips: "Strict form against the pad with zero body momentum." },
      { id: "plb-6", name: "Cable Concentration Curls", targetSets: 3, targetReps: "12–15", category: "Biceps", formTips: "Constant tension curve throughout the entire range of motion." }
    ]
  },
  {
    id: "legs-b",
    title: "Legs B",
    subtitle: "Posterior Chain & Hamstrings Focus",
    focus: "Legs",
    exercises: [
      { id: "lb-1", name: "Romanian Deadlift (RDL)", targetSets: 3, targetReps: "8–10", category: "Hamstrings", formTips: "Push hips back until a deep hamstring stretch is felt; shins vertical." },
      { id: "lb-2", name: "Bulgarian Split Squats", targetSets: 3, targetReps: "8–10", category: "Glutes / Quads", formTips: "Slight forward torso hinge to load glutes; maintain balance." },
      { id: "lb-3", name: "Seated Leg Curls", targetSets: 3, targetReps: "12–15", category: "Hamstrings", formTips: "Superior hamstring isolation compared to lying variant." },
      { id: "lb-4", name: "Walking Dumbbell Lunges", targetSets: 2, targetReps: "10–12", category: "Legs", formTips: "Controlled knee touch to floor, driving up through front heel." },
      { id: "lb-5", name: "Seated Calf Raises", targetSets: 4, targetReps: "15–20", category: "Calves", formTips: "Targets the soleus muscle with high rep ranges and deep stretches." }
    ]
  }
];