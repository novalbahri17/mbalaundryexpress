/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "b7mz5y7poda3pft",
			created: "2026-03-01 07:09:49.198Z",
			updated: "2026-03-01 07:09:49.198Z",
			name: "site_settings",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "ntkk3z2n",
					name: "key",
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
					id: "c5xttqen",
					name: "value",
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
					id: "zklwhwhv",
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
			],
			indexes: ["CREATE UNIQUE INDEX `idx_site_settings_key` ON `site_settings` (`key`)"],
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
		const collection = dao.findCollectionByNameOrId("b7mz5y7poda3pft");

		return dao.deleteCollection(collection);
	},
);
