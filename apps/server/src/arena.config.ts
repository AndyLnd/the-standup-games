import config from "@colyseus/tools";
import { RumbleRoom } from "rumble";

export default config({
  getId: () => "standuprumble",

  initializeGameServer: (gameServer) => {
    gameServer.define("rumble", RumbleRoom);
  },
});
