// Import with `` if you are using ESM
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://f6de0b868403d1650df7f4e6a308123d@o4511133633282048.ingest.us.sentry.io/4511133641146368",
  integrations: [nodeProfilingIntegration(), Sentry.mongooseIntegration()],
  //! tracing
  tracesSampleRate: 1.0,

  sendDefaultPii: true,
});
