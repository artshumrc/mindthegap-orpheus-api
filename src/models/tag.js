import mongoose from 'mongoose';
import shortid from 'shortid';

// plug-ins
import timestamp from 'mongoose-timestamp';
import URLSlugs from 'mongoose-url-slugs';

const Schema = mongoose.Schema;

/**
 * Tag base schema
 * @type {Schema}
 */
const TagSchema = new Schema({
	_id: {
		type: String,
		default: shortid.generate
	},
	projectId: {
		type: String,
		required: true,
		trim: true,
	},
	name: {
		type: String,
		required: true,
		trim: true,
	},
});


// add timestamps (createdAt, updatedAt)
TagSchema.plugin(timestamp);

// Statics
TagSchema.statics.getByItemId = function getByItemId(itemId, cb) {
	return this.findOne({ itemId }, cb);
};

/**
 * Tag mongoose model
 * @type {Object}
 */
const Tag = mongoose.model('Tag', TagSchema);

export default Tag;
export { TagSchema };
