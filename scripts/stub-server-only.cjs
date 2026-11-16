// Lets Node scripts import server modules guarded by `import "server-only"` (Next enforces it in the app).
const id = require.resolve("server-only");
require.cache[id] = { id, filename: id, loaded: true, exports: {} };
