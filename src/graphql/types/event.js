import {
	GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString, GraphQLInt,
} from 'graphql';
import createType from 'mongoose-schema-to-graphql';

// types
import FileType, { FileInputType } from './file';
import MetadataType, { MetadataInputType } from './metadata';
import CommentType from './comment';
import ManifestType from './manifest';

// logic
import EventService from '../logic/events';
import FileService from '../logic/files';
import CommentService from '../logic/comments';
import ManifestService from '../logic/manifests';

// models
import Event from '../../models/event';


const config = {
	name: 'EventType',
	description: 'Event Schema base query type',
	class: 'GraphQLObjectType',
	schema: Event.schema,
	exclude: [],
	extend: {
		files: {
			type: new GraphQLList(FileType),
			description: 'Get event files',
			resolve(event, args, { token }) {
				const fileService = new FileService(token);
				return fileService.getFiles({ eventId: event._id });
			}
		},
		filesCount: {
			type: GraphQLInt,
			description: 'Count all event files',
			resolve(event, args, { token }) {
				const fileService = new FileService(token);
				return fileService.count({ eventId: event._id });
			}
		},
		comment: {
			type: CommentType,
			description: 'Get a comment ',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
				hostname: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug, hostname }, { token }) {
				const commentService = new CommentService(token);
				return commentService.getComment({ eventId: parent._id, _id, slug, hostname });
			}
		},
		comments: {
			type: new GraphQLList(CommentType),
			description: 'Get list of comments',
			args: {
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { textsearch, limit, offset }, { token }) {
				const commentService = new CommentService(token);
				return commentService.getComments({ eventId: parent._id, textsearch, limit, offset });
			}
		},
		commentsCount: {
			type: GraphQLInt,
			description: 'Get count of comment for project',
			resolve(parent, _, { token }) {
				const commentService = new CommentService(token);
				return commentService.count({ eventId: parent._id });
			}
		},
		metadata: {
			type: new GraphQLList(MetadataType),
			description: 'Get event metadata',
			resolve(event, args, context) {
				return event.metadata;
			}
		},
		manifest: {
			type: ManifestType,
			description: 'Get a IIIF manifest for all image files associated with event',
			resolve(parent, _, { token }) {
				const manifestService = new ManifestService(token);
				return manifestService.getManifest({ eventId: parent._id, });
			}
		},
	},
};

const configInput = {
	name: 'EventInputType',
	description: 'Event Schema base create input type',
	class: 'GraphQLInputObjectType',
	schema: Event.schema,
	exclude: ['createdAt', 'updatedAt'],
	extend: {
		metadata: {
			type: new GraphQLList(MetadataInputType)
		},
	}
};

const EventType = createType(config);
const EventInputType = createType(configInput);

export default EventType;
export { EventInputType };
