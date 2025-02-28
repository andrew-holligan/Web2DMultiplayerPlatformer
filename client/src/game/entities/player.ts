import * as PIXI from "pixi.js";

import { PlayerSkinType } from "../../../../server/src/rooms/schema/enums/PlayerSkinType";
import { Player as ServerPlayerEntity } from "../../../../server/src/rooms/schema/Player";

import * as constants from "../../../../shared/constants/constants";

import { Textures } from "../../static/textures";

import { Entity } from "./entity";

export class Player extends Entity {
	readonly spritePlayer: PIXI.Sprite;
	readonly spritePlayerName: PIXI.Text;

	private readonly clientId: string;
	private readonly skin: PlayerSkinType;

	constructor(playerEntity: ServerPlayerEntity) {
		super(playerEntity);

		this.spritePlayer = new PIXI.Sprite(Textures.textures.get(PlayerSkinType[playerEntity.skin]));
		this.spritePlayerName = new PIXI.Text({
			text: playerEntity.clientId,
			style: {
				fontFamily: "Arial",
				fontSize: 18,
				fill: 0x0000ff,
			},
		});

		this.clientId = playerEntity.clientId;
		this.skin = playerEntity.skin;

		this.initPlayer();
	}

	// INITIALIZATION

	private initPlayer() {
		// player sprite rotates around its center
		this.spritePlayer.anchor.set(0.5, 0.5);
		// player sprite is centered inside the container
		this.spritePlayer.position.set(this.width / 2, this.height / 2);
		// player sprite is set to the size of the player
		this.spritePlayer.width = this.width;
		this.spritePlayer.height = this.height;

		// player name is scaled down
		this.spritePlayerName.scale.set(1 / constants.GAME_SCALE);
		// player name is centered above the player
		this.spritePlayerName.position.set(
			(this.spritePlayer.width - this.spritePlayerName.width) / 2,
			-this.spritePlayerName.height
		);

		this.spriteContainer.addChild(this.spritePlayer);
		this.spriteContainer.addChild(this.spritePlayerName);
	}

	// UPDATE

	updatePlayer(playerEntity: ServerPlayerEntity) {
		super.updateEntity(playerEntity);
		this.spritePlayer.rotation = playerEntity.angle;
	}
}
