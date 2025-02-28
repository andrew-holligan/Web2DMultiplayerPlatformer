import { type } from "@colyseus/schema";

import { PlayerSkinType } from "./enums/PlayerSkinType";
import { Entity } from "./Entity";

export class Player extends Entity {
	@type("string") clientId: string;
	@type("int8") skin: PlayerSkinType;
}
