import * as PIXI from "pixi.js";

import { PlayerSkinType } from "../../../../server/src/rooms/schema/enums/PlayerSkinType";
import { Player as ServerPlayerEntity } from "../../../../server/src/rooms/schema/Player";
import { Textures } from "../../static/textures";
import { Entity } from "./entity";

export class Player extends Entity {
	public readonly spritePlayer: PIXI.Sprite;

	private readonly clientId: string;
	private readonly skin: PlayerSkinType;

	constructor(playerEntity: ServerPlayerEntity) {
		super(playerEntity);
		this.spritePlayer = new PIXI.Sprite(Textures.textures.get(PlayerSkinType[playerEntity.skin]));
		this.clientId = playerEntity.clientId;
		this.skin = playerEntity.skin;
		this.initPlayer();
	}

	// INITIALIZATION

	private initPlayer() {
		this.spritePlayer.anchor.set(0.5);
		this.spriteContainer.addChild(this.spritePlayer);
	}

	// UPDATE

	updatePlayer(playerEntity: ServerPlayerEntity) {
		super.updateEntity(playerEntity);
	}
}
