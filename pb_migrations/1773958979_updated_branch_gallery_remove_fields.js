/// <reference path="../pb_data/types.d.ts" />
migrate(
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("branch_gallery");

		// Remove 'type' field if exists
		try {
			const typeField = collection.schema.find((f) => f.name === "type");
			if (typeField) {
				collection.schema = collection.schema.filter((f) => f.name !== "type");
			}
		} catch (e) {
			console.log("type field not found or already removed");
		}

		// Remove 'sort_order' field if exists
		try {
			const sortOrderField = collection.schema.find((f) => f.name === "sort_order");
			if (sortOrderField) {
				collection.schema = collection.schema.filter((f) => f.name !== "sort_order");
			}
		} catch (e) {
			console.log("sort_order field not found or already removed");
		}

		return dao.saveCollection(collection);
	},
	(db) => {
		// Rollback - add fields back (not needed for this case)
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("branch_gallery");

		// Add type field back
		collection.schema.push({
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
		});

		// Add sort_order field back
		collection.schema.push({
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
		});

		return dao.saveCollection(collection);
	},
);
