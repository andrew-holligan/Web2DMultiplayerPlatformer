import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { MapType } from "../../../shared/types/map";

import { MapEntityType } from "../rooms/schema/enums/MapEntityType";
import { Entity } from "../rooms/schema/Entity";

export class GameEngine {
	private readonly engine: Matter.Engine;
	private readonly entities: Map<string, Matter.Body>;
	private readonly spawns: { x: number; y: number }[] = [];

	constructor(map: MapType) {
		this.engine = Matter.Engine.create({
			gravity: { x: 0, y: 0.1 },
		});
		this.entities = new Map<string, Matter.Body>();

		this.initMap(map);
		this.initCollisions();
	}

	// INITIALIZATION

	private initMap(map: MapType): void {
		map.entities.forEach((entity) => {
			if (entity.type === MapEntityType.SPAWN) {
				this.spawns.push({ x: entity.x, y: entity.y });
			}

			this.addEntity({
				x: entity.x,
				y: entity.y,
				width: entity.width,
				height: entity.height,
				physicsOptions: map.physicsOptions[entity.type],
				angle: entity.angle,
			});
		});
	}

	private initCollisions(): void {}

	// ADD ENTITIES

	private addEntity({
		x,
		y,
		width,
		height,
		physicsOptions,
		angle,
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		physicsOptions: Matter.IBodyDefinition;
		angle: number;
	}): Matter.Body {
		const matterEntity = Matter.Bodies.rectangle(x, y, width, height, physicsOptions);
		Matter.Body.setAngle(matterEntity, angle);
		Matter.World.add(this.engine.world, matterEntity);
		this.entities.set(matterEntity.id.toString(), matterEntity);
		return matterEntity;
	}

	addPlayer({ x, y, width, height }: { x: number; y: number; width: number; height: number }): string {
		const entity = this.addEntity({
			x: x,
			y: y,
			width: width,
			height: height,
			physicsOptions: {
				isStatic: false,
				frictionAir: 0.01,
				collisionFilter: {
					group: -1,
				},
				isSensor: false,
			},
			angle: 0,
		});
		return entity.id.toString();
	}

	// REMOVE ENTITIES

	removeEntity(id: string): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.World.remove(this.engine.world, entity);
		this.entities.delete(id);
	}

	// UPDATE

	update(delta: number, colyseusEntities: MapSchema<Entity, string>): void {
		Matter.Engine.update(this.engine);
		this.updateColyseusEntities(colyseusEntities);
	}

	private updateColyseusEntities(colyseusEntities: MapSchema<Entity, string>): void {
		colyseusEntities.forEach((entity, id) => {
			const matterEntity = this.entities.get(id);
			if (!matterEntity) return;
			entity.pos.x = matterEntity.position.x;
			entity.pos.y = matterEntity.position.y;
			entity.vel.x = matterEntity.velocity.x;
			entity.vel.y = matterEntity.velocity.y;
			entity.angle = matterEntity.angle;
		});
	}

	// EVENT HANDLERS

	handleJump(id: string, playerSpeed: number): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: entity.velocity.x, y: -(2 * playerSpeed) });
	}

	handleLeft(id: string, playerSpeed: number): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: -(1 * playerSpeed), y: entity.velocity.y });
	}

	handleRight(id: string, playerSpeed: number): void {
		const entity = this.entities.get(id);
		if (!entity) return;
		Matter.Body.setVelocity(entity, { x: 1 * playerSpeed, y: entity.velocity.y });
	}

	// CLEANUP

	dispose(): void {
		Matter.World.clear(this.engine.world, false);
		Matter.Engine.clear(this.engine);
	}

	// MISC

	getRandomSpawn(): { x: number; y: number } {
		return this.spawns[Math.floor(Math.random() * this.spawns.length)];
	}
}
