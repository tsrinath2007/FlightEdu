import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function generateFallbackSyllabus(subject: string, durationMin: number) {
  const takeoffMin = Math.max(5, Math.round(durationMin * 0.15));
  const descentMin = Math.max(5, Math.round(durationMin * 0.15));
  const cruiseMin = durationMin - takeoffMin - descentMin;

  const subjectLower = subject.toLowerCase().trim();
  
  let takeoffTask = "Review core foundational concepts and write down key definitions.";
  let cruiseTask = "Implement practice problems and build a hands-on mini-project.";
  let descentTask = "Run optimization testing, review mistake logs, and finalize notes.";

  // Check C/C++ first to avoid overlapping other rules
  const isCStyle = 
    subjectLower === "c" || 
    subjectLower.startsWith("c ") || 
    subjectLower.endsWith(" c") || 
    subjectLower.includes(" c ") || 
    subjectLower.includes("c++") || 
    subjectLower.includes("cpp") || 
    subjectLower.includes("c programming") || 
    subjectLower.includes("c-programming") ||
    subjectLower.includes("objective-c");

  if (isCStyle) {
    takeoffTask = "Learn C syntax foundations: study main functions, declare variables, understand data types, and practice basic console Input/Output (printf/scanf).";
    cruiseTask = "Master C control flow: write conditional structures (if-else, switch), execute loops (while, for), and build custom reusable functions.";
    descentTask = "Examine C memory layout: learn pointer declarations, address referencing (&/*), dynamic memory allocation (malloc), and compile/test code.";
  } else if (subjectLower.includes("rust") || subjectLower.includes("cargo") || subjectLower.includes("wasm")) {
    takeoffTask = "Set up cargo project structure, define core structs & traits, and review memory safety rules (ownership, borrowing, lifetimes).";
    cruiseTask = "Write application logic, implement match control flow structures, compile loops, and resolve borrowing compiler errors.";
    descentTask = "Run cargo test, check memory/bounds safety, write error handling logs, and compile final binaries.";
  } else if (subjectLower.includes("javascript") || subjectLower.includes("js") || subjectLower.includes("typescript") || subjectLower.includes("ts")) {
    takeoffTask = "Learn JS/TS syntax foundations: declare variables (let/const), build type interfaces, and set up basic script blocks.";
    cruiseTask = "Master logic flow: write array operations, construct control loops, build asynchronous async/await event pipelines, and update DOM structures.";
    descentTask = "Validate logic flow: debug script runtime in console, audit closures/scopes, and run compiler type checking.";
  } else if (subjectLower.includes("react") || subjectLower.includes("next")) {
    takeoffTask = "Master React/Next.js basics: study file structure conventions, build layout trees, utilize component props, and manage JSX syntax.";
    cruiseTask = "Manage React state flow: utilize hooks (useState, useEffect), control lifecycle rendering, and compose responsive component hierarchies.";
    descentTask = "Optimize web performance: audit hydration errors, implement performance hooks (useMemo, useCallback), and run build check validations.";
  } else if (subjectLower.includes("python")) {
    takeoffTask = "Learn Python syntax basics: understand indentation rules, declare variables/lists/dictionaries, and print console statements.";
    cruiseTask = "Build logic flow: write conditional loops (for, while), define custom parameter functions (def), and parse standard modules.";
    descentTask = "Review Python code execution: manage exceptions (try-except), test local script scopes, and write clear unit tests.";
  } else if (subjectLower.includes("java")) {
    takeoffTask = "Study Java OOP basics: set up main class structures, declare primitives, write variable declarations, and study class models.";
    cruiseTask = "Design Java control flow: write conditional branches, configure looping statements, construct class methods, and implement interfaces.";
    descentTask = "Validate execution: compile JVM bytecode, manage throws/try-catch exception handlers, and test collections arrays.";
  } else if (subjectLower.includes("sql") || subjectLower.includes("database") || subjectLower.includes("postgres") || subjectLower.includes("mysql")) {
    takeoffTask = "Learn SQL selectors: study relational tables, query datasets using SELECT/FROM, and filter rows using WHERE statements.";
    cruiseTask = "Master query relationship flow: perform table relationships using JOINs, apply aggregation groups (GROUP BY), and write HAVING filters.";
    descentTask = "Optimize queries: check execution index performance, analyze query plans with EXPLAIN, and test database transaction commits.";
  } else if (subjectLower.includes("html") || subjectLower.includes("css") || subjectLower.includes("flexbox") || subjectLower.includes("tailwind")) {
    takeoffTask = "Structure web pages: build HTML document trees, code semantic tags (nav, header), and write basic CSS rules.";
    cruiseTask = "Style responsive layout flows: design grids/containers (Flexbox/Grid), define positions, and configure transition styles.";
    descentTask = "Audit visual styling: verify mobile responsiveness breakpoints, debug styling using browser inspectors, and validate standards.";
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
    takeoffTask = `Review core concepts and foundational definitions for ${subject} in a structured sequence.`;
    cruiseTask = `Step-by-step mastery: Complete active learning cycles, solve topic exercises, and write mini-examples.`;
    descentTask = `Test your retention of ${subject} under focus, review mistake patterns, and compile a summary.`;
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
