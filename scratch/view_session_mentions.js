const fs = require('fs');
const readline = require('readline');

async function main() {
  const fileStream = fs.createReadStream('C:\\Users\\SES\\.gemini\\antigravity\\brain\\45feb5cb-6855-4d06-bb7e-48dce2990519\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const seen = new Set();
  for await (const line of rl) {
    const data = JSON.parse(line);
    const text = JSON.stringify(data);
    
    // Find all matches for session/ followed by characters
    const matches = text.match(/\/session\/[a-zA-Z0-9_\-\/]+/g);
    if (matches) {
      for (const match of matches) {
        if (!seen.has(match)) {
          seen.add(match);
          console.log(`Step ${data.step_index} (${data.source}): ${match}`);
        }
      }
    }
  }
}

main().catch(console.error);
