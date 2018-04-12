import mongoose from 'mongoose';
import shortid from 'shortid';

// plug-ins
import timestamp from 'mongoose-timestamp';
import URLSlugs from 'mongoose-url-slugs';
import mongoosePaginate from 'mongoose-paginate';

// models
import Collection from './collection';
import { MetadataSchema } from './item';


const Schema = mongoose.Schema;


/**
 * Person base schema
 * @type {Schema}
 */
const PersonSchema = new Schema({
	_id: {
		type: String,
		default: shortid.generate
	},
	name: {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	dateBirth: {
		type: Date,
	},
	dateDeath: {
		type: Date,
	},
	projectId: {
		type: String,
		ref: 'Project',
		index: true
	},
	tagIds: {
		type: [String],
		ref: 'Tag',
		index: true
	},
	bio: {
		type: String,
	},
	metadata: [MetadataSchema],
	private: {
		type: Boolean,
		default: false,
	},
	events: {
		type: [String],
		ref: 'Event',
		index: true
	},
	interviews: {
		type: [String],
		ref: 'Interview',
		index: true
	},
	items: {
		type: [String],
		ref: 'Item',
		index: true
	},
});


// add timestamps (createdAt, updatedAt)
PersonSchema.plugin(timestamp);

// add slug (slug)
PersonSchema.plugin(URLSlugs('name', {
	indexUnique: false,
}));


/**
 * Statics
 */

/**
 * Find all persons belonging to a collection
 * @param  {String} collectionId 	Collection id
 * @return {Promise}              	(Promise) Array of found persons
 */

PersonSchema.statics.findByCollectionId = function findByCollectionId(collectionId) {
	return this.find({ collectionId }).select({ _id: 1 });
};


/**
 * Methods
 */

PersonSchema.methods.validateUser = function validateUser(userId) {
	return Collection.isUserAdmin(this.collectionId, userId);
};

/**
 * Person mongoose model
 * @type {Object}
 */
const Person = mongoose.model('Person', PersonSchema);

export default Person;
export { PersonSchema };
