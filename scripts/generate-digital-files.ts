/**
 * Generates the demo digital products (real, openable files) into /storage/digital
 * and the free lead magnet into /public/downloads.
 *
 *   npx tsx scripts/generate-digital-files.ts
 *
 * The seed script calls this automatically when files are missing.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { zipSync, strToU8 } from "fflate";

const ROOT = process.cwd();
const DIGITAL_DIR = path.join(ROOT, "storage", "digital");
const PUBLIC_DIR = path.join(ROOT, "public", "downloads");

const EMBER = rgb(0.886, 0.243, 0.098);
const INK = rgb(0.07, 0.07, 0.08);
const MUTED = rgb(0.4, 0.4, 0.42);

type Section = { heading: string; lines: string[] };
type Doc = { title: string; subtitle: string; sections: Section[] };

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf(doc: Doc) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(doc.title);
  pdf.setAuthor("Maya Lane");
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const W = 595;
  const H = 842;
  const M = 56;

  // Cover
  const cover = pdf.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: INK });
  cover.drawRectangle({ x: 0, y: H - 14, width: W, height: 14, color: EMBER });
  cover.drawText("MAYA LANE", { x: M, y: H - 90, size: 14, font: bold, color: EMBER });
  const titleLines = wrap(doc.title.toUpperCase(), bold, 40, W - M * 2);
  titleLines.forEach((l, i) =>
    cover.drawText(l, { x: M, y: H / 2 + 60 - i * 46, size: 40, font: bold, color: rgb(1, 1, 1) }),
  );
  wrap(doc.subtitle, regular, 14, W - M * 2).forEach((l, i) =>
    cover.drawText(l, {
      x: M,
      y: H / 2 + 60 - titleLines.length * 46 - 10 - i * 20,
      size: 14,
      font: regular,
      color: rgb(0.85, 0.85, 0.85),
    }),
  );
  cover.drawText("mayalane.shop", { x: M, y: M, size: 11, font: regular, color: rgb(0.7, 0.7, 0.7) });

  // Body
  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - M;
  const newPage = () => {
    page = pdf.addPage([W, H]);
    y = H - M;
  };
  for (const s of doc.sections) {
    if (y < 160) newPage();
    page.drawRectangle({ x: M, y: y - 4, width: 28, height: 4, color: EMBER });
    y -= 30;
    page.drawText(s.heading, { x: M, y, size: 20, font: bold, color: INK });
    y -= 28;
    for (const raw of s.lines) {
      const bullet = raw.startsWith("- ");
      const text = bullet ? raw.slice(2) : raw;
      const lines = wrap(text, regular, 11.5, W - M * 2 - (bullet ? 14 : 0));
      for (const [i, l] of lines.entries()) {
        if (y < M + 20) newPage();
        if (bullet && i === 0) page.drawText("•", { x: M, y, size: 11.5, font: bold, color: EMBER });
        page.drawText(l, { x: M + (bullet ? 14 : 0), y, size: 11.5, font: regular, color: INK });
        y -= 17;
      }
      y -= 5;
    }
    y -= 18;
  }
  const pages = pdf.getPages();
  pages.slice(1).forEach((p, i) =>
    p.drawText(`${doc.title}  ·  ${i + 2}`, { x: M, y: 28, size: 9, font: regular, color: MUTED }),
  );
  return pdf.save();
}

const strengthWeek = (week: number, focus: string): Section => ({
  heading: `Week ${week}: ${focus}`,
  lines: [
    "- Day 1, Lower A: Back squat 4x6, Romanian deadlift 3x8, Walking lunge 3x10 each leg, Plank 3x40s",
    "- Day 2, Upper A: Bench press 4x6, Chest-supported row 4x8, Half-kneeling press 3x10, Face pull 3x15",
    "- Day 3, Lower B: Deadlift 4x5, Hip thrust 4x8, Bulgarian split squat 3x8, Dead bug 3x10",
    "- Day 4, Upper B: Pull-up or lat pulldown 4x8, Incline dumbbell press 3x10, Cable row 3x12, Curl to press 3x12",
    week % 4 === 0
      ? "Deload week: keep the same exercises, drop the weight by 30% and cut one set from each lift."
      : "Progression: when you hit the top of every rep range with good form, add 2.5 to 5 lbs next session.",
  ],
});

const docs: Record<string, Doc> = {
  "strong-era-12-week-program.pdf": {
    title: "Strong Era",
    subtitle: "A 12-week strength program for women who are done being scared of the weights section.",
    sections: [
      {
        heading: "Before you start",
        lines: [
          "Hi, I'm so glad you're here. This program is built around one idea: get a little stronger every week. Not perfect, just a little stronger.",
          "- Train four days a week with at least one rest day between lower-body sessions.",
          "- Warm up for eight minutes: bike or incline walk, then two light sets of your first lift.",
          "- Log every session in the tracker at the back. Progress you can see keeps you going.",
          "- Sleep and protein do half the work. Aim for 7+ hours and roughly 0.8g of protein per lb of goal bodyweight.",
        ],
      },
      ...[1, 2, 3, 4].map((w) => strengthWeek(w, w === 4 ? "Deload" : "Foundation")),
      ...[5, 6, 7, 8].map((w) => strengthWeek(w, w === 8 ? "Deload" : "Build")),
      ...[9, 10, 11, 12].map((w) => strengthWeek(w, w === 12 ? "Test week" : "Peak")),
      {
        heading: "Form cues",
        lines: [
          "- Squat: brace like someone is about to poke your stomach, sit between your hips, push the floor away.",
          "- Deadlift: bar over mid-foot, push the floor away, finish by squeezing your glutes, not leaning back.",
          "- Bench: shoulder blades back and down, feet planted, bar touches the lower chest.",
          "- Hip thrust: chin tucked, ribs down, pause for one second at the top.",
        ],
      },
      {
        heading: "Weekly tracker",
        lines: [
          "Write your top set for each main lift every week. Circle it when it's a PR.",
          "- Squat: ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____",
          "- Deadlift: ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____",
          "- Bench: ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____",
          "- Hip thrust: ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____  ____",
        ],
      },
    ],
  },
  "sunday-reset-meal-prep-ebook.pdf": {
    title: "Sunday Reset",
    subtitle: "Two hours on Sunday, a whole week of high-protein food you'll actually look forward to.",
    sections: [
      {
        heading: "How the reset works",
        lines: [
          "Every week follows the same rhythm: one tray bake, one pot, one prep bowl. While the oven does the heavy lifting you chop, portion and pack.",
          "- 0:00 to 0:15: oven on, grains rinsed and cooking, veg on trays.",
          "- 0:15 to 0:45: proteins seasoned and in the oven, sauces blended.",
          "- 0:45 to 1:30: breakfast prep, snack boxes and washing up as you go.",
          "- 1:30 to 2:00: portion, label, fridge. Done.",
        ],
      },
      {
        heading: "Week A menu",
        lines: [
          "- Breakfast: Vanilla protein overnight oats (32g protein)",
          "- Lunch: Hot honey chicken grain bowls with roasted sweet potato (41g protein)",
          "- Dinner: Turkey taco lettuce cups with lime crema (38g protein)",
          "- Snack: Cottage cheese, berries and granola cups (18g protein)",
          "Grocery list: rolled oats, protein powder, chicken thighs, sweet potatoes, quinoa, ground turkey, butter lettuce, Greek yogurt, limes, cottage cheese, mixed berries, hot honey.",
        ],
      },
      {
        heading: "Week B menu",
        lines: [
          "- Breakfast: Spinach and feta egg bites (24g protein)",
          "- Lunch: Miso salmon rice bowls with cucumber salad (36g protein)",
          "- Dinner: One-pot creamy tomato orzo with white beans (29g protein)",
          "- Snack: Chocolate peanut butter protein balls (12g protein)",
        ],
      },
      {
        heading: "Storage tips",
        lines: [
          "- Most bowls keep for four days. Freeze Thursday and Friday portions and move them to the fridge the night before.",
          "- Keep dressings and crunchy toppings separate until you eat.",
          "- Glass containers reheat more evenly and don't hold onto smells.",
        ],
      },
    ],
  },
  "home-glow-4-week-starter-plan.pdf": {
    title: "Home Glow",
    subtitle: "Four weeks of 30-minute home workouts. Just a mat, two dumbbells and you.",
    sections: [
      {
        heading: "Your setup",
        lines: [
          "You need a mat, a pair of light to medium dumbbells (5 to 15 lbs) and about two square metres of floor. That's it.",
          "- Five workouts a week: three strength, one cardio circuit, one mobility flow.",
          "- Each workout is 30 minutes including warm-up and cool-down.",
        ],
      },
      ...[1, 2, 3, 4].map(
        (w): Section => ({
          heading: `Week ${w}`,
          lines: [
            `- Mon: Full body. Goblet squat, push-up (incline is fine), dumbbell row, glute bridge. ${2 + Math.min(w, 3)} rounds of 10.`,
            "- Tue: Cardio circuit. 40s on, 20s off: squat jacks, mountain climbers, skaters, high knees.",
            "- Wed: Mobility flow, 20 minutes. World's greatest stretch, 90/90 switches, cat-cow, thread the needle.",
            "- Thu: Lower body. Reverse lunge, sumo squat, single-leg RDL, frog pumps.",
            "- Fri: Upper and core. Shoulder press, renegade row, chest press on the floor, dead bug.",
          ],
        }),
      ),
      {
        heading: "When motivation doesn't show up",
        lines: [
          "Motivation is a feeling. Discipline is a decision. On the low days, promise yourself ten minutes. You'll almost always keep going, and if you don't, ten minutes still counts.",
        ],
      },
    ],
  },
  "golden-hour-install-guide.pdf": {
    title: "Golden Hour Presets",
    subtitle: "Install guide and editing tips.",
    sections: [
      {
        heading: "Install on Lightroom mobile",
        lines: [
          "- Unzip the folder on your phone and open the 'mobile' folder.",
          "- Import the .dng files into Lightroom, open each one and tap ... then Create Preset.",
          "- Name each preset and save it to a new group called Golden Hour.",
        ],
      },
      {
        heading: "Install on Lightroom Classic or desktop",
        lines: [
          "- Open the Develop module, click + next to Presets and choose Import Presets.",
          "- Select every .xmp file in the 'desktop' folder.",
        ],
      },
      {
        heading: "Getting the best results",
        lines: [
          "- Start with the preset at 70% strength and adjust exposure first.",
          "- If skin looks too warm, nudge the orange saturation slider down by 5 to 10.",
          "- GH-07 to GH-12 are tuned for indoor and gym lighting.",
        ],
      },
    ],
  },
  "free-7-day-workout-plan.pdf": {
    title: "7-Day Kickstart",
    subtitle: "Your free 7-day workout plan from Maya. Thirty minutes a day, no gym required.",
    sections: [
      {
        heading: "Welcome to day one",
        lines: [
          "This week is about one thing: showing up. Every workout is 30 minutes or less and only needs your bodyweight and a mat.",
          "- Day 1: Full body. Squats, incline push-ups, glute bridges, plank. 3 rounds of 12.",
          "- Day 2: Walk 8,000 steps and do the 10-minute mobility flow.",
          "- Day 3: Lower body burner. Reverse lunges, sumo squats, donkey kicks, wall sit.",
          "- Day 4: Rest. Stretch, hydrate, sleep early.",
          "- Day 5: Upper body and core. Tricep dips, superman pulls, dead bugs, side planks.",
          "- Day 6: 20-minute cardio circuit, 40s on and 20s off.",
          "- Day 7: Reflect. Write down one thing that felt easier than day one.",
        ],
      },
      {
        heading: "Ready for more?",
        lines: [
          "If you loved this week, Home Glow is the full 4-week version, and Strong Era takes you into the gym. Use code KICKSTART10 for 10% off your first order.",
        ],
      },
    ],
  },
};

const presetXmp = (n: number, name: string) => `<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about="" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
   crs:PresetType="Normal" crs:Version="15.0" crs:ProcessVersion="11.0"
   crs:Temperature="${5400 + n * 60}" crs:Tint="+6" crs:Exposure2012="+0.${(n % 4) + 1}0"
   crs:Contrast2012="-${10 + n}" crs:Highlights2012="-${30 + n * 2}" crs:Shadows2012="+${20 + n}"
   crs:Vibrance="+${12 + n}" crs:Saturation="-4" crs:SaturationAdjustmentOrange="-${6 + (n % 3)}"
   crs:HueAdjustmentOrange="-3" crs:LuminanceAdjustmentOrange="+8">
   <crs:Name><rdf:Alt><rdf:li xml:lang="x-default">Golden Hour ${String(n).padStart(2, "0")} ${name}</rdf:li></rdf:Alt></crs:Name>
   <crs:Group><rdf:Alt><rdf:li xml:lang="x-default">Golden Hour by Maya Lane</rdf:li></rdf:Alt></crs:Group>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
`;

async function exists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

export async function generateDigitalFiles({ force = false } = {}) {
  await mkdir(DIGITAL_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
  const written: string[] = [];

  for (const [fileName, doc] of Object.entries(docs)) {
    if (fileName === "golden-hour-install-guide.pdf") continue;
    const dir = fileName.startsWith("free-") ? PUBLIC_DIR : DIGITAL_DIR;
    const out = path.join(dir, fileName);
    if (!force && (await exists(out))) continue;
    await writeFile(out, await buildPdf(doc));
    written.push(path.relative(ROOT, out));
  }

  const zipOut = path.join(DIGITAL_DIR, "golden-hour-presets.zip");
  if (force || !(await exists(zipOut))) {
    const names = ["Soft Light", "Warm Linen", "Beach Glow", "Coastal", "Sunset Walk", "Latte", "Gym Mirror", "Studio Warm", "Night In", "Candle", "Cozy", "Matte Gold"];
    const files: Record<string, Uint8Array> = {
      "Golden Hour Presets/README.txt": strToU8(
        "Thank you for supporting my small business! Open Install-Guide.pdf to get started.\n— Maya\n",
      ),
      "Golden Hour Presets/Install-Guide.pdf": await buildPdf(docs["golden-hour-install-guide.pdf"]),
    };
    names.forEach((name, i) => {
      files[`Golden Hour Presets/desktop/GH-${String(i + 1).padStart(2, "0")} ${name}.xmp`] = strToU8(presetXmp(i + 1, name));
    });
    await writeFile(zipOut, zipSync(files));
    written.push(path.relative(ROOT, zipOut));
  }
  return written;
}

if (process.argv[1]?.includes("generate-digital-files")) {
  generateDigitalFiles({ force: process.argv.includes("--force") }).then((w) =>
    console.log(w.length ? `Generated:\n  ${w.join("\n  ")}` : "All digital files already exist."),
  );
}
