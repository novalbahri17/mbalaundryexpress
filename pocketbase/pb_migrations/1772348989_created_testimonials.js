/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "2rvo2yv7xirkcg4",
			created: "2026-03-01 07:09:49.033Z",
			updated: "2026-03-01 07:09:49.033Z",
			name: "testimonials",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "sfzh7rzn",
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
					id: "du1tprvj",
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
					id: "ecbc3lxa",
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
					id: "zoehmdjy",
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
					id: "ysloyqf1",
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
					id: "eyrff8pk",
					name: "is_approved",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "sibha4bn",
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
		const collection = dao.findCollectionByNameOrId("2rvo2yv7xirkcg4");

		return dao.deleteCollection(collection);
	},
);
