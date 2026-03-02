/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "a4fsjkpt1gv36s1",
			created: "2026-03-01 13:45:26.984Z",
			updated: "2026-03-01 13:45:26.984Z",
			name: "spin_plays",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "pljbrlif",
					name: "phone",
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
					id: "mbxzmfqi",
					name: "branch_id",
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
					id: "ayqqyxlw",
					name: "reward_id",
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
					id: "khvamtjs",
					name: "is_winner",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "byr9phpu",
					name: "played_at",
					type: "date",
					required: true,
					presentable: false,
					unique: false,
					options: {
						min: "",
						max: "",
					},
				},
			],
			indexes: [],
			listRule: "",
			viewRule: "",
			createRule: "",
			updateRule: null,
			deleteRule: null,
			options: {},
		});

		return Dao(db).saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("a4fsjkpt1gv36s1");

		return dao.deleteCollection(collection);
	},
);
