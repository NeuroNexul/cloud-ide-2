import z from "zod";
import { configDotenv } from "dotenv";

configDotenv();

const envSchema = z.object({
  PORT: z.string().optional(),
  CLIENT_URL: z.string(),
  PROCESS_GID: z.string(),
  PROCESS_UID: z.string(),
  PROCESS_HOME: z.string(),
});

export type Env = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export const env = envSchema.parse(process.env);

process.env = {
  ...process.env,
  ...env,
};
