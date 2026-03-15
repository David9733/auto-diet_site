const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error("Usage: node scripts/commonsQuickSearch.mjs <query>");
  process.exit(1);
}

const url = new URL("https://commons.wikimedia.org/w/api.php");
url.searchParams.set("action", "query");
url.searchParams.set("list", "search");
url.searchParams.set("srnamespace", "6");
url.searchParams.set("srlimit", "30");
url.searchParams.set("srsearch", query);
url.searchParams.set("format", "json");
url.searchParams.set("origin", "*");

const res = await fetch(url.toString(), { headers: { "User-Agent": "food-forge-pro/1.0" } });
if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
const json = await res.json();
const titles = (json?.query?.search ?? []).map((x) => x.title).filter((t) => /\.(jpe?g|png)$/i.test(t));
console.log(titles.slice(0, 20));


