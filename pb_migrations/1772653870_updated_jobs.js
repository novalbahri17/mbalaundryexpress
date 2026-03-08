/// <reference path="../pb_data/types.d.ts" />
const buildJobsImageField = () =>
	new SchemaField({
		system: false,
		id: "jimg6q2w7rh9fka",
		name: "image",
		type: "file",
		required: false,
		presentable: false,
		unique: false,
		options: {
			mimeTypes: ["image/jpeg", "image/png", "image/webp"],
			thumbs: ["300x300", "600x400", "1200x630"],
			maxSelect: 1,
			maxSize: 5242880,
			protected: false,
		},
	});

migrate(
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("jobs");
		const existingImageField = collection.schema.getFieldByName("image");

		if (!existingImageField || existingImageField.id !== "jimg6q2w7rh9fka") {
			if (existingImageField) {
				collection.schema.removeField("image");
			}
			collection.schema.addField(buildJobsImageField());
			return dao.saveCollection(collection);
		}

		return dao.saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("jobs");
		const existingImageField = collection.schema.getFieldByName("image");

		if (existingImageField && existingImageField.id === "jimg6q2w7rh9fka") {
			collection.schema.removeField("image");
			return dao.saveCollection(collection);
		}

		return dao.saveCollection(collection);
	},
);
