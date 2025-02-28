export interface MapType {
	meta: {
		playerWidth: number;
		playerHeight: number;
	};
	physicsOptions: {
		isStatic: boolean;
		collisionFilter: {
			group: number;
		};
	}[];
	entities: {
		type: number;
		x: number;
		y: number;
		angle: number;
		width: number;
		height: number;
	}[];
}
