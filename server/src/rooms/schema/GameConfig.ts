import { Schema, type } from "@colyseus/schema";

export class GameConfig extends Schema {
	@type("float32") playerSpeed: number;
}
