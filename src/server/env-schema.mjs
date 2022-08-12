import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(), //.path(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});
