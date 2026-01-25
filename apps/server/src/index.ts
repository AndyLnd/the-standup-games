/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to use Colyseus Arena
 *
 * If you're self-hosting (without Arena), you can manually instantiate a
 * Colyseus Server as documented here: 👉 https://docs.colyseus.io/server/api/#constructor-options
 */
import { listen } from "@colyseus/tools";

// Import arena config
import arenaConfig from "./arena.config";

// Create and listen on 2567 (or PORT_WS environment variable.)
listen(arenaConfig, parseInt(process.env.PORT_WS || "2567", 10));
