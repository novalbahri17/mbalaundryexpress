/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "cz2u1jg1ggsfcuh",
			created: "2026-03-01 13:45:26.919Z",
			updated: "2026-03-01 13:45:26.919Z",
			name: "faqs",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "f4yq54yc",
					name: "question",
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
					id: "5mpl5x02",
					name: "answer",
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
					id: "igz3gkkr",
					name: "category",
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
					id: "woxupwpd",
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
					id: "m6ppwbwi",
					name: "sort_order",
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
					id: "kltw3yfs",
					name: "is_active",
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
		const collection = dao.findCollectionByNameOrId("cz2u1jg1ggsfcuh");

		return dao.deleteCollection(collection);
	},
);
