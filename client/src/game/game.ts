import * as PIXI from "pixi.js";
import { Room } from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";
import { ActionType } from "../../../server/src/rooms/schema/enums/ActionType";

const container = document.getElementById("app")!;

export class Game {
	public static readonly SCALE = 1;

	private readonly room: Room<GameState>;
	private readonly app: PIXI.Application;
	private readonly world: PIXI.Container;

	constructor(room: Room<GameState>) {
		this.room = room;
		this.app = new PIXI.Application();
		this.world = new PIXI.Container();
	}

	async init() {
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
			resizeTo: parent,
		});

		container.appendChild(this.app.canvas);

		this.app.stage.addChild(this.world);
		this.app.stage.scale.set(Game.SCALE);
		this.app.ticker.add(() => this.update());

		window.addEventListener("keydown", (event) => {
			switch (event.key) {
				case " ":
				case "ArrowUp":
				case "w":
					this.room.send(ActionType.JUMP);
					break;

				case "ArrowLeft":
				case "a":
					this.room.send(ActionType.LEFT);
					break;

				case "ArrowRight":
				case "d":
					this.room.send(ActionType.RIGHT);
					break;
			}
		});

		this.app.start();
	}

	update() {}
}
