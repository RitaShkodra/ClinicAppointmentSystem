import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});



export const config = {
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}
if (!config.jwtRefreshSecret) {
  throw new Error("JWT_REFRESH_SECRET is not defined in .env");
}