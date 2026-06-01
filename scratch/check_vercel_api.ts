async function main() {
  const url = "https://gofocusgen.vercel.app/api/user/profile/tsrinath";
  console.log(`Fetching live Vercel API: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status Code: ${res.status}`);
    const text = await res.text();
    console.log("Response Body:");
    try {
      console.log(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      console.log(text);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

main();
