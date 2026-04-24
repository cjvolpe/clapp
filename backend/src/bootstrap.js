import dotenv from "dotenv";
const envType = process.env.NODE_ENV || "production";
const envFile = `.env.${envType}`;
dotenv.config({ path: envFile });
//# sourceMappingURL=bootstrap.js.map