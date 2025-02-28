import { Schema, type } from "@colyseus/schema";

import { EntityType } from "./enums/EntityType";
import { Vector } from "./Vector";

export class Entity extends Schema {
	@type("string") id: string;
	@type("int8") type: EntityType;
	@type(Vector) pos: Vector;
	@type(Vector) vel: Vector;
	@type("number") width: number;
	@type("number") height: number;
	@type("float32") angle: number;
}
