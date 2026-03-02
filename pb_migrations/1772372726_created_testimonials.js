/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "m380lm78n8zb45b",
			created: "2026-03-01 13:45:26.902Z",
			updated: "2026-03-01 13:45:26.902Z",
			name: "testimonials",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "yxztnbsc",
					name: "customer_name",
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
					id: "kcraccxr",
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
					id: "yipcfnil",
					name: "rating",
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
					id: "ycgvzyti",
					name: "comment",
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
					id: "u6ez4zjt",
					name: "photo",
					type: "file",
					required: false,
					presentable: false,
					unique: false,
					options: {
						mimeTypes: [],
						thumbs: [],
						maxSelect: 1,
						maxSize: 5242880,
						protected: false,
					},
				},
				{
					system: false,
					id: "87fifxuo",
					name: "is_approved",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "evkydeo8",
					name: "source",
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
			createRule: "",
			updateRule: null,
			deleteRule: null,
			options: {},
		});

		return Dao(db).saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("m380lm78n8zb45b");

		return dao.deleteCollection(collection);
	},
);
