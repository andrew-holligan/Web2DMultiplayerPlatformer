import { MapSchema, Schema, type } from "@colyseus/schema";

import { Entity } from "./Entity";
import { GameConfig } from "./GameConfig";

export class GameState extends Schema {
	@type("string") id: string;
	@type({ map: Entity }) entities: MapSchema<Entity> = new MapSchema<Entity>();
	@type({ map: "string" }) clientIdToEntityId: MapSchema<string> = new MapSchema<string>();
	@type(GameConfig) config: GameConfig;
}
