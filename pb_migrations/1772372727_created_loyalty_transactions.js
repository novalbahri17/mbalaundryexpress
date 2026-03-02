/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "rr05rbzvh73mqbi",
			created: "2026-03-01 13:45:27.018Z",
			updated: "2026-03-01 13:45:27.018Z",
			name: "loyalty_transactions",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "crpbilly",
					name: "member_id",
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
					id: "yvyakvas",
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
					id: "adnjn7zv",
					name: "type",
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
					id: "crmgsn1p",
					name: "points",
					type: "number",
					required: true,
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
					id: "8cxv069t",
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
					id: "emlfjove",
					name: "reference_id",
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
		const collection = dao.findCollectionByNameOrId("rr05rbzvh73mqbi");

		return dao.deleteCollection(collection);
	},
);
