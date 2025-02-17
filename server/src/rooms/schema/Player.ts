import { type } from "@colyseus/schema";

import { Entity } from "./Entity";
import { PlayerSkinType } from "./enums/PlayerSkinType";

export class Player extends Entity {
	@type("string") clientId: string;
	@type("int8") skin: PlayerSkinType;
}
