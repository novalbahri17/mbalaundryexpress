/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "q3usihqkl9cgsho",
			created: "2026-03-01 13:45:26.774Z",
			updated: "2026-03-01 13:45:26.774Z",
			name: "branch_hours",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "94cpl9sa",
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
					id: "9p3lrchq",
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
					id: "uncej633",
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
					id: "37e75i9s",
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
					id: "mdd3nzgv",
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
		const collection = dao.findCollectionByNameOrId("q3usihqkl9cgsho");

		return dao.deleteCollection(collection);
	},
);
