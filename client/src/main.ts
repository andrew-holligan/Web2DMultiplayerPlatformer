import { APIColyseus } from "./api/colyseus";
import { Game } from "./game/game";

import "./style.css";

const api = new APIColyseus();
const room = await api.joinOrCreate();

const game = new Game(room);
await game.init();
