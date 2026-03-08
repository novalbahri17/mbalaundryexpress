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
			maxSelect: 1,
			maxSize: 5242880,
			mimeTypes: ["image/jpeg", "image/png", "image/webp"],
			thumbs: ["300x300", "600x400", "1200x630"],
			protected: false,
		},
	});

migrate(
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("jobs");
		const existingImageField = collection.schema.getFieldByName("image");
		if (existingImageField) {
			collection.schema.removeField("image");
		}
		collection.schema.addField(buildJobsImageField());

		return dao.saveCollection(collection);
	},
	(db) => {
		const dao = new Dao(db);
		const collection = dao.findCollectionByNameOrId("jobs");
		const existingImageField = collection.schema.getFieldByName("image");
		if (existingImageField) {
			collection.schema.removeField("image");
		}

		return dao.saveCollection(collection);
	},
);
