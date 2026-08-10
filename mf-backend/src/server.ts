import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`MF Rides backend running at http://0.0.0.0:${env.PORT}`);
});