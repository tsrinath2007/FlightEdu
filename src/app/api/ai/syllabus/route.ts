import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function generateFallbackSyllabus(subject: string, durationMin: number) {
  const takeoffMin = Math.max(5, Math.round(durationMin * 0.15));
  const descentMin = Math.max(5, Math.round(durationMin * 0.15));
  const cruiseMin = durationMin - takeoffMin - descentMin;

  const subjectLower = subject.toLowerCase();
  
  let takeoffTask = "Review core foundational concepts and write down key definitions.";
  let cruiseTask = "Implement practice problems and build a hands-on mini-project.";
  let descentTask = "Run optimization testing, review mistake logs, and finalize notes.";

  if (subjectLower.includes("rust") || subjectLower.includes("cargo") || subjectLower.includes("wasm")) {
    takeoffTask = "Set up cargo project structure, define core structs & traits, and review memory safety rules.";
    cruiseTask = "Write the main application loops, implement custom handlers, and resolve ownership compiler errors.";
    descentTask = "Run cargo test, check memory leaks, document the crate, and review compile warnings.";
  } else if (subjectLower.includes("javascript") || subjectLower.includes("js") || subjectLower.includes("typescript") || subjectLower.includes("ts")) {
    takeoffTask = "Initialize codebase, declare modules & types, and review core API reference docs.";
    cruiseTask = "Implement logical functions, build dynamic UI event handlers, and chain array/object helper methods.";
    descentTask = "Run console testing, optimize garbage collection and complexity, and write simple unit tests.";
  } else if (subjectLower.includes("react") || subjectLower.includes("next")) {
    takeoffTask = "Set up file structure, verify API layouts, declare component props, and initialize states.";
    cruiseTask = "Build hooks integration, manage side effects, and compose responsive component trees.";
    descentTask = "Audit web accessibility guidelines, optimize render performance, and test production build bundlers.";
  } else if (subjectLower.includes("chem") || subjectLower.includes("chemistry")) {
    takeoffTask = "Identify chemical reactions, balance molecular equations, and list starting reagent properties.";
    cruiseTask = "Analyze reaction mechanisms step-by-step, draft synthesis pathways, and calculate yield metrics.";
    descentTask = "Summarize chemical stereochemistry configurations and compile mistake logs for reactions.";
  } else if (subjectLower.includes("physic") || subjectLower.includes("mechanic")) {
    takeoffTask = "Define coordinate frame constraints, draw free-body diagrams, and list fundamental variables.";
    cruiseTask = "Formulate mechanical equations of motion, integrate variables over time, and solve for path metrics.";
    descentTask = "Verify dimensional consistency, evaluate boundary conditions, and test limiting case ratios.";
  } else if (subjectLower.includes("math") || subjectLower.includes("calculus") || subjectLower.includes("algebra")) {
    takeoffTask = "Review core mathematical definitions, properties, theorems, and outline proof directions.";
    cruiseTask = "Work through standard calculus/algebra derivations, solve step-by-step exercises, and verify proofs.";
    descentTask = "Perform numerical validation, check boundary values, and summarize common integration errors.";
  } else if (subjectLower.includes("english") || subjectLower.includes("writ") || subjectLower.includes("literature")) {
    takeoffTask = "Outline narrative thesis, review analytical guidelines, and brainstorm thematic symbols.";
    cruiseTask = "Write body arguments, analyze textual evidence paragraphs, and draft contextual transition lines.";
    descentTask = "Check structural flow consistency, revise word choice for impact, and finalize bibliography citations.";
  } else if (subjectLower.includes("history") || subjectLower.includes("social")) {
    takeoffTask = "Establish historical timeline bounds, identify key historical figures, and define macro context.";
    cruiseTask = "Analyze primary/secondary source documents, map cause-and-effect relationships, and write short essays.";
    descentTask = "Summarize societal/political impact parameters and review flashcards for key dates and events.";
  } else if (subjectLower.includes("biology") || subjectLower.includes("anatomy") || subjectLower.includes("bio")) {
    takeoffTask = "Define cellular structures, map anatomical pathways, and sketch organelle functions.";
    cruiseTask = "Trace biological process cycles (e.g. Krebs cycle) or anatomical mechanisms step-by-step.";
    descentTask = "Label diagrams from memory and review flashcards on key biological vocabularies.";
  } else if (subjectLower.includes("deep learning") || subjectLower.includes("machine learning") || subjectLower.includes("ai") || subjectLower.includes("ml")) {
    takeoffTask = "Define network layer dimensions, clarify loss objectives, and initialize weight tensor arrays.";
    cruiseTask = "Implement forward pass calculus, execute gradient backpropagation, and write gradient descent loops.";
    descentTask = "Plot training loss curves, analyze overfitting ratios, and adjust model hyperparameter settings.";
  } else {
    takeoffTask = `Review core concepts and foundational definitions for ${subject}.`;
    cruiseTask = `Complete active study cycles, solve practice problems, and build mini-examples.`;
    descentTask = `Test your retention of ${subject} under time pressure and compile notes summary.`;
  }

  return [
    { phase: `Takeoff (${takeoffMin}m)`, task: takeoffTask },
    { phase: `Cruise (${cruiseMin}m)`, task: cruiseTask },
    { phase: `Descent (${descentMin}m)`, task: descentTask }
  ];
}

export async function POST(req: Request) {
  try {
    const { subject, duration } = await req.json();
    if (!subject || !duration || typeof duration !== "number") {
      return NextResponse.json({ error: "Missing subject or duration" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const syllabus = generateFallbackSyllabus(subject, duration);
      return NextResponse.json({ success: true, syllabus, source: "fallback" });
    }

    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `You are an AI Flight Co-Pilot. You generate customized study plans mapped to flight focus durations.
Subject: ${subject}
Flight Duration: ${duration} minutes

Generate exactly 3 study syllabus checkpoints matching the Takeoff, Cruise, and Descent phases.
Takeoff phase should be about 15-20% of the duration (${Math.round(duration * 0.15)} to ${Math.round(duration * 0.2)} minutes).
Cruise phase should be about 60-70% of the duration (${Math.round(duration * 0.6)} to ${Math.round(duration * 0.7)} minutes).
Descent phase should be about 15-20% of the duration (${Math.round(duration * 0.15)} to ${Math.round(duration * 0.2)} minutes).

The output must be JSON in the format:
{
  "syllabus": [
    { "phase": "Takeoff (Xm)", "task": "Task description here..." },
    { "phase": "Cruise (Ym)", "task": "Task description here..." },
    { "phase": "Descent (Zm)", "task": "Task description here..." }
  ]
}
Return only the raw JSON. Do not include markdown code block formatting or any explanation outside the JSON.`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const responseText = response.content[0].type === "text" ? response.content[0].text : "";
      const cleanJsonStr = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const data = JSON.parse(cleanJsonStr);

      if (data && Array.isArray(data.syllabus) && data.syllabus.length === 3) {
        return NextResponse.json({ success: true, syllabus: data.syllabus, source: "ai" });
      } else {
        throw new Error("Invalid syllabus JSON format returned by AI");
      }
    } catch (aiErr) {
      console.warn("AI syllabus generation failed, using fallback:", aiErr);
      const syllabus = generateFallbackSyllabus(subject, duration);
      return NextResponse.json({ success: true, syllabus, source: "fallback" });
    }
  } catch (err) {
    console.error("Syllabus API failed:", err);
    return NextResponse.json({ error: "Failed to generate syllabus" }, { status: 500 });
  }
}
