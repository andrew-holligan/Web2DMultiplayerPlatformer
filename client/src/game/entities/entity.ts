import * as PIXI from "pixi.js";

import { EntityType } from "../../../../server/src/rooms/schema/enums/EntityType";
import { Entity as ServerEntity } from "../../../../server/src/rooms/schema/Entity";

export abstract class Entity {
	readonly spriteContainer: PIXI.Container;
	readonly id: string;

	protected type: EntityType;
	protected pos: { x: number; y: number };
	protected vel: { x: number; y: number };
	protected width: number;
	protected height: number;
	protected angle: number;

	constructor(entity: ServerEntity) {
		this.spriteContainer = new PIXI.Container();
		this.id = entity.id;

		this.type = entity.type;
		this.pos = entity.pos;
		this.vel = entity.vel;
		this.width = entity.width;
		this.height = entity.height;
		this.angle = entity.angle;

		this.initEntity();
	}

	// INITIALIZATION

	private initEntity() {
		this.spriteContainer.pivot.set(this.width / 2, this.height / 2);
		this.spriteContainer.position.set(this.pos.x, this.pos.y);
		this.spriteContainer.rotation = this.angle;
	}

	// UPDATE

	updateEntity(entity: ServerEntity) {
		this.spriteContainer.position.set(entity.pos.x, entity.pos.y);
	}
}
