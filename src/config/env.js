import dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const result = envSchema.safeParse(process.env)

if(!result.success) {
  console.error("CRITICAL: Environment variable validation failed:");

  const formattedErrors = result.error.flatten().fieldErrors;
  console.error(JSON.stringify(formattedErrors, null, 2));

  process.exit(1);
}

const env = Object.freeze(result.data);

export default env