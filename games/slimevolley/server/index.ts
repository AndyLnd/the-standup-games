import { Room } from "colyseus";
import { SlimeVolleyState } from "./schema/SlimeVolley";

export class SlimeVolleyRoom extends Room<SlimeVolleyState> {
  onCreate() {
    this.setState(new SlimeVolleyState());
    this.onMessage("*", (client, type, message) => {
      const player = client;
      switch (type) {
        case 'move':
          break;
      }
    });
    this.setSimulationInterval((dt) => this.update(dt));
  }
  update(dt: number) {
    this.state.update(dt);
  }
}
