/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "tev6gvpygwuutbl",
			created: "2026-03-01 07:09:49.121Z",
			updated: "2026-03-01 07:09:49.121Z",
			name: "spin_plays",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "fcc7p43i",
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
					id: "ssei2zxn",
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
					id: "uf1sep6v",
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
					id: "xoslvwom",
					name: "is_winner",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "luyi88ep",
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
		const collection = dao.findCollectionByNameOrId("tev6gvpygwuutbl");

		return dao.deleteCollection(collection);
	},
);
