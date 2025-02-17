import * as PIXI from "pixi.js";

import { EntityType } from "../../../../server/src/rooms/schema/enums/EntityType";
import { Entity as ServerEntity } from "../../../../server/src/rooms/schema/Entity";

export abstract class Entity {
	public readonly spriteContainer: PIXI.Container;
	public readonly id: string;

	private readonly type: EntityType;
	private readonly pos: { x: number; y: number };
	private readonly vel: { x: number; y: number };
	private readonly width: number;
	private readonly height: number;

	constructor(entity: ServerEntity) {
		this.spriteContainer = new PIXI.Container();
		this.id = entity.id;
		this.type = entity.type;
		this.pos = entity.pos;
		this.vel = entity.vel;
		this.width = entity.width;
		this.height = entity.height;
		this.initEntity();
	}

	// INITIALIZATION

	private initEntity() {
		this.spriteContainer.position.set(this.pos.x, this.pos.y);
		this.spriteContainer.width = this.width;
		this.spriteContainer.height = this.height;
	}

	// UPDATE

	updateEntity(entity: ServerEntity) {
		this.spriteContainer.position.set(entity.pos.x, entity.pos.y);
		this.spriteContainer.width = entity.width;
		this.spriteContainer.height = entity.height;
	}
}
