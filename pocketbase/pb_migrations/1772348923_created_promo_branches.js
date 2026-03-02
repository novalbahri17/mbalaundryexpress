/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "qu0anjs7i4l2r91",
			created: "2026-03-01 07:08:43.545Z",
			updated: "2026-03-01 07:08:43.545Z",
			name: "promo_branches",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "musct1oz",
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
					id: "dfgrtuqf",
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
		const collection = dao.findCollectionByNameOrId("qu0anjs7i4l2r91");

		return dao.deleteCollection(collection);
	},
);
