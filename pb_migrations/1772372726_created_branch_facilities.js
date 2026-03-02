/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "vgk4admphdt2vt8",
			created: "2026-03-01 13:45:26.795Z",
			updated: "2026-03-01 13:45:26.795Z",
			name: "branch_facilities",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "dfi80gjc",
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
					id: "ajqpidth",
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
					id: "cmx6dujt",
					name: "icon",
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
					id: "uht93rt2",
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
		const collection = dao.findCollectionByNameOrId("vgk4admphdt2vt8");

		return dao.deleteCollection(collection);
	},
);
