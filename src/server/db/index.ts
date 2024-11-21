import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema.ts";


const db = drizzle(sql,{schema});
export default db;
