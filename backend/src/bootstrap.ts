import dotenv from "dotenv";



const envType: string = process.env.NODE_ENV || "production";
const envFile: string = `.env.${envType}`;

dotenv.config({ path: envFile });