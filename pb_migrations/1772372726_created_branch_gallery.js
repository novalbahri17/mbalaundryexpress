/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "5aexn9uicv340o0",
			created: "2026-03-01 13:45:26.811Z",
			updated: "2026-03-01 13:45:26.811Z",
			name: "branch_gallery",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "log9b3kz",
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
					id: "enlz1btq",
					name: "image",
					type: "file",
					required: true,
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
					id: "8irkjpgj",
					name: "caption",
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
					id: "pmsglpj5",
					name: "type",
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
					id: "7gz3l65z",
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
		const collection = dao.findCollectionByNameOrId("5aexn9uicv340o0");

		return dao.deleteCollection(collection);
	},
);
