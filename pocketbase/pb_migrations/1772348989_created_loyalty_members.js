/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "jy6hds2g34w9uyp",
			created: "2026-03-01 07:09:49.134Z",
			updated: "2026-03-01 07:09:49.134Z",
			name: "loyalty_members",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "wvrzqzp2",
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
					id: "fxaovjyi",
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
					id: "dqaiyevk",
					name: "email",
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
					id: "vmg5qcot",
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
					id: "61ch4cqs",
					name: "points",
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
					id: "ungiz0sh",
					name: "level",
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
					id: "shukenmv",
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
			createRule: "",
			updateRule: null,
			deleteRule: null,
			options: {},
		});

		return Dao(db).saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("jy6hds2g34w9uyp");

		return dao.deleteCollection(collection);
	},
);
