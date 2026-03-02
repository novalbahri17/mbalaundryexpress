/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const collection = new Collection({
			id: "t303k0ifluhlexm",
			created: "2026-03-01 13:45:26.966Z",
			updated: "2026-03-01 13:45:26.966Z",
			name: "spin_rewards",
			type: "base",
			system: false,
			schema: [
				{
					system: false,
					id: "ziulhtdc",
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
					id: "r5cybrvj",
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
					id: "wz6gfihz",
					name: "reward_type",
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
					id: "1aywifjo",
					name: "reward_value",
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
					id: "3pt9fkfb",
					name: "probability",
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
					id: "ogypuk7z",
					name: "is_active",
					type: "bool",
					required: false,
					presentable: false,
					unique: false,
					options: {},
				},
				{
					system: false,
					id: "wysoj5de",
					name: "stock",
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
		const collection = dao.findCollectionByNameOrId("t303k0ifluhlexm");

		return dao.deleteCollection(collection);
	},
);
