/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "h6ffycp3ud47zv9",
			created: "2026-03-01 13:45:27.062Z",
			updated: "2026-03-01 13:45:27.062Z",
			name: "site_settings",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "sfd6vy9c",
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
					id: "3vnymlph",
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
					id: "7ickqn0u",
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
		const collection = dao.findCollectionByNameOrId("h6ffycp3ud47zv9");

		return dao.deleteCollection(collection);
	},
);
