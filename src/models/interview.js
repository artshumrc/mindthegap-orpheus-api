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
 * Interview base schema
 * @type {Schema}
 */
const InterviewSchema = new Schema({
	_id: {
		type: String,
		default: shortid.generate
	},
	title: {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	projectId: {
		type: String,
		ref: 'Project',
		index: true
	},
	collectionId: {
		type: [String],
		ref: 'Collection',
		index: true
	},
	personId: {
		type: [String],
		ref: 'Person',
		index: true
	},
	tagIds: {
		type: [String],
		ref: 'Tag',
		index: true
	},
	description: {
		type: String,
	},
	metadata: [MetadataSchema],
	private: {
		type: Boolean,
		default: false,
	},
});


// add timestamps (createdAt, updatedAt)
InterviewSchema.plugin(timestamp);

// add slug (slug)
InterviewSchema.plugin(URLSlugs('title', {
	indexUnique: false,
}));


/**
 * Statics
 */

/**
 * Find all interviews belonging to a collection
 * @param  {String} collectionId 	Collection id
 * @return {Promise}              	(Promise) Array of found interviews
 */

InterviewSchema.statics.findByCollectionId = function findByCollectionId(collectionId) {
	return this.find({ collectionId }).select({ _id: 1 });
};


/**
 * Methods
 */

InterviewSchema.methods.validateUser = function validateUser(userId) {
	return Collection.isUserAdmin(this.collectionId, userId);
};

/**
 * Interview mongoose model
 * @type {Object}
 */
const Interview = mongoose.model('Interview', InterviewSchema);

export default Interview;
export { InterviewSchema };
