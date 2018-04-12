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
import PersonService from '../logic/persons';
import FileService from '../logic/files';
import CommentService from '../logic/comments';
import ManifestService from '../logic/manifests';

// models
import Person from '../../models/person';


const config = {
	name: 'PersonType',
	description: 'Person Schema base query type',
	class: 'GraphQLObjectType',
	schema: Person.schema,
	exclude: [],
	extend: {
		files: {
			type: new GraphQLList(FileType),
			description: 'Get person files',
			async resolve(person, args, { token }) {
				const fileService = new FileService(token);
				const files = await fileService.getFiles({ personId: person._id });
				return files;
			}
		},
		filesCount: {
			type: GraphQLInt,
			description: 'Count all person files',
			resolve(person, args, { token }) {
				const fileService = new FileService(token);
				return fileService.count({ personId: person._id });
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
				return commentService.getComment({ personId: parent._id, _id, slug, hostname });
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
				return commentService.getComments({ personId: parent._id, textsearch, limit, offset });
			}
		},
		commentsCount: {
			type: GraphQLInt,
			description: 'Get count of comment for project',
			resolve(parent, _, { token }) {
				const commentService = new CommentService(token);
				return commentService.count({ personId: parent._id });
			}
		},
		metadata: {
			type: new GraphQLList(MetadataType),
			description: 'Get person metadata',
			resolve(person, args, context) {
				return person.metadata;
			}
		},
		manifest: {
			type: ManifestType,
			description: 'Get a IIIF manifest for all image files associated with person',
			resolve(parent, _, { token }) {
				const manifestService = new ManifestService(token);
				return manifestService.getManifest({ personId: parent._id, });
			}
		},
	},
};

const configInput = {
	name: 'PersonInputType',
	description: 'Person Schema base create input type',
	class: 'GraphQLInputObjectType',
	schema: Person.schema,
	exclude: ['createdAt', 'updatedAt'],
	extend: {
		metadata: {
			type: new GraphQLList(MetadataInputType),
		},
	}
};

const PersonType = createType(config);
const PersonInputType = createType(configInput);

export default PersonType;
export { PersonInputType };
