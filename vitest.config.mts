import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // Vitest runs in plain Node, not through Next.js's webpack/Turbopack
      // server build — which is what normally swaps `server-only`'s
      // throwing implementation for a no-op on the server side. Alias it
      // here to the package's own no-op ("empty.js", used for its
      // react-server export condition) so importing src/lib/supabase/admin.ts
      // in a server-context test doesn't throw.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url)
      ),
    },
  },
});
