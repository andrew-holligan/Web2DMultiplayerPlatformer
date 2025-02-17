import { type } from "@colyseus/schema";
import { Entity } from "./Entity";

export class Player extends Entity {
	@type("string") clientId: string;
	@type("string") name: string;
}
