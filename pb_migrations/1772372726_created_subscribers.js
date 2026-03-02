/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "cm6wee90pr6exo7",
			created: "2026-03-01 13:45:26.948Z",
			updated: "2026-03-01 13:45:26.948Z",
			name: "subscribers",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "8kcsr07y",
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
					id: "1ijwwmva",
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
					id: "zmwzojcb",
					name: "is_active",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "klcjqwhh",
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
			indexes: ["CREATE UNIQUE INDEX `idx_subscribers_phone` ON `subscribers` (`phone`)"],
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
		const collection = dao.findCollectionByNameOrId("cm6wee90pr6exo7");

		return dao.deleteCollection(collection);
	},
);
