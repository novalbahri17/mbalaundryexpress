/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "q14wsmjntrs3a6r",
			created: "2026-03-01 07:08:43.473Z",
			updated: "2026-03-01 07:08:43.473Z",
			name: "branch_gallery",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "uhvp2xuq",
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
					id: "1z50b1in",
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
					id: "9igzehje",
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
					id: "gtjdludc",
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
					id: "hvutt02a",
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
		const collection = dao.findCollectionByNameOrId("q14wsmjntrs3a6r");

		return dao.deleteCollection(collection);
	},
);
