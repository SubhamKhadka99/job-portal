// Import with `import` if you are using ESM
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration(), Sentry.mongooseIntegration()],
  //! tracing
  tracesSampleRate: 1.0,

  sendDefaultPii: true,
});
