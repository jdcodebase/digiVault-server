import dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MONGODB_URI: z.string().url("MONGODB_URI must be a valid MongoDB connection string").default('mongodb://localhost:27017/digiVault'),
    REDIS_URL: z.string().url("REDIS_URL must be a valid Redis connection string").default('redis://localhost:6379'),
    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL").default('http://localhost:5173'),
    PORT: z.string().regex(/^\d+$/).transform(Number).default(5000),
    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).default(587),
    SMTP_SECURE: z.preprocess(
      (value) => {
        if (typeof value === "boolean") return value;
        return String(value).toLowerCase() === "true";
      },
      z.boolean()
    ).default(false),
    SMTP_USER: z.string().email().default(''),
    SMTP_PASS: z.string().default(''),
    MAIL_FROM_NAME: z.string().default('DigitalVault'),
    MAIL_FROM_EMAIL: z.string().email().default(''),
})

const result = envSchema.safeParse(process.env)

if(!result.success) {
  console.error("CRITICAL: Environment variable validation failed:");

  const formattedErrors = result.error.flatten().fieldErrors;
  console.error(JSON.stringify(formattedErrors, null, 2));

  process.exit(1);}

const env = Object.freeze(result.data);

export default env