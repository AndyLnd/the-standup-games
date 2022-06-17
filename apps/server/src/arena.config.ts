import Arena from "@colyseus/arena";
import { RumbleRoom } from "rumble";

export default Arena({
  getId: () => "Your Colyseus App",

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("rumble", RumbleRoom);
  },
});
