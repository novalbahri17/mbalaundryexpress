/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "3c7q28icgmfzb9b",
			created: "2026-03-01 07:08:43.427Z",
			updated: "2026-03-01 07:08:43.427Z",
			name: "branch_hours",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "ybcrkixp",
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
				{
					system: false,
					id: "0irflevs",
					name: "day",
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
					id: "6hu4dm6v",
					name: "open_time",
					type: "text",
					required: false,
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
					id: "mv8u9vvo",
					name: "close_time",
					type: "text",
					required: false,
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
					id: "ilgqxk18",
					name: "is_closed",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
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
		const collection = dao.findCollectionByNameOrId("3c7q28icgmfzb9b");

		return dao.deleteCollection(collection);
	},
);
