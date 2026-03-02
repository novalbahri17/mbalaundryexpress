/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "51sxf2ohjkf5lpc",
			created: "2026-03-01 13:45:26.848Z",
			updated: "2026-03-01 13:45:26.848Z",
			name: "promo_branches",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "qxln8x2s",
					name: "promo_id",
					type: "text",
					required: true,
					presentable: false,
					unique: false,
					options: {
						min: null,
						max: null,
						pattern: "",
					},
				},
				{
					system: false,
					id: "ls1w6y6w",
					name: "branch_id",
					type: "text",
					required: true,
					presentable: false,
					unique: false,
					options: {
						min: null,
						max: null,
						pattern: "",
					},
				},
			],
			indexes: [],
			listRule: "",
			viewRule: "",
			createRule: null,
			updateRule: null,
			deleteRule: null,
			options: {},
		});

		return Dao(db).saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("51sxf2ohjkf5lpc");

		return dao.deleteCollection(collection);
	},
);
