import fs from "node:fs/promises";
import path from "node:path";

const PROVINCE_NAME = "Ilocos Norte";
const BASE = "https://psgc.cloud/api";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} -> ${url}`);
  }
  return res.json();
}

async function main() {
  console.log("Loading provinces...");

  const provinces = await getJson(`${BASE}/provinces`);
  if (!Array.isArray(provinces)) {
    throw new Error("Unexpected provinces response shape.");
  }

  const province = provinces.find((p) => p.name === PROVINCE_NAME);
  if (!province) {
    throw new Error(`Province not found: ${PROVINCE_NAME}`);
  }

  console.log(`Found province code for ${PROVINCE_NAME}: ${province.code}`);
  console.log("Loading municipalities/cities of Ilocos Norte...");

  const localities = await getJson(
    `${BASE}/provinces/${province.code}/cities-municipalities`
  );

  if (!Array.isArray(localities) || !localities.length) {
    throw new Error("No municipalities/cities returned for Ilocos Norte.");
  }

  const output = {};

  for (const locality of localities) {
    console.log(`Loading barangays for ${locality.name} (${locality.code})...`);

    const barangays = await getJson(
      `${BASE}/cities-municipalities/${locality.code}/barangays`
    );

    if (!Array.isArray(barangays)) {
      throw new Error(`Unexpected barangay response for ${locality.name}`);
    }

    output[locality.name] = barangays
      .map((b) => b.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  const sortedOutput = Object.fromEntries(
    Object.entries(output).sort(([a], [b]) => a.localeCompare(b))
  );

  const outDir = path.resolve("src/data");
  const outFile = path.join(outDir, "ilocosNorteLocations.json");

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify(sortedOutput, null, 2), "utf8");

  const totalBarangays = Object.values(sortedOutput).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  console.log(`Saved: ${outFile}`);
  console.log(`LGUs: ${Object.keys(sortedOutput).length}`);
  console.log(`Total barangays: ${totalBarangays}`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});