import { readFileSync } from "fs";
import { join } from "path";
import { query } from "./db.js";

async function run() {
  const sqlPath = join(process.cwd(), "src", "migrations", "001_init.sql");
  const sql = readFileSync(sqlPath, "utf8");
  await query(sql);
  console.log("Migration applied");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
