import { APIColyseus } from "./api/colyseus";
import { Textures } from "./static/textures";
import { Game } from "./game/game";

import "./style.css";

await Textures.initTextures();

const api = new APIColyseus();
const room = await api.joinOrCreate();

const game = new Game(room);
await game.init();
