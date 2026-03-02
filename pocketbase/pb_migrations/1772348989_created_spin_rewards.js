/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "gb9lrybh8xvhi5r",
			created: "2026-03-01 07:09:49.103Z",
			updated: "2026-03-01 07:09:49.103Z",
			name: "spin_rewards",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "he7w0xux",
					name: "name",
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
					id: "3eyixvpr",
					name: "description",
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
					id: "jc7ibbsz",
					name: "reward_type",
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
					id: "icfwbyij",
					name: "reward_value",
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
					id: "dvvbyllx",
					name: "probability",
					type: "number",
					required: false,
					presentable: false,
					unique: false,
					options: {
						min: null,
						max: null,
						noDecimal: false,
					},
				},
				{
					system: false,
					id: "7iswvtjb",
					name: "is_active",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "pi9csqyj",
					name: "stock",
					type: "number",
					required: false,
					presentable: false,
					unique: false,
					options: {
						min: null,
						max: null,
						noDecimal: false,
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
		const collection = dao.findCollectionByNameOrId("gb9lrybh8xvhi5r");

		return dao.deleteCollection(collection);
	},
);
