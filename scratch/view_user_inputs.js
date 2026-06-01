const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\SES\\.gemini\\antigravity\\brain\\45feb5cb-6855-4d06-bb7e-48dce2990519\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const data = JSON.parse(line);
    if (data.step_index >= 5800 && data.step_index <= 5815) {
      console.log(`STEP ${data.step_index} (${data.source} - ${data.type}):`);
      if (data.content && data.content.length < 500) {
        console.log(data.content);
      } else if (data.content) {
        console.log(data.content.substring(0, 500) + '... (truncated)');
      }
      if (data.tool_calls) {
        console.log("TOOL CALLS:", JSON.stringify(data.tool_calls, null, 2));
      }
      console.log("-".repeat(80));
    }
  }
}

main().catch(console.error);
