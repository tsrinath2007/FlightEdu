import fs from "fs";
import path from "path";

function scanDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === "node_modules" || file === ".git" || file === ".next") continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      if (file.toLowerCase().includes("middleware")) {
        console.log(`Found: ${fullPath}`);
      }
    }
  }
}

console.log("Scanning workspace for 'middleware' files...");
scanDir(path.resolve(__dirname, ".."));
