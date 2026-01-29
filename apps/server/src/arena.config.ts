import config from "@colyseus/tools";
import { RumbleRoom } from "rumble";
import { SlimeVolleyRoom } from "slimevolley";

export default config({
  getId: () => "standuprumble",

  initializeGameServer: (gameServer) => {
    gameServer.define("rumble", RumbleRoom);
    gameServer.define("slimevolley", SlimeVolleyRoom);
  },
});
