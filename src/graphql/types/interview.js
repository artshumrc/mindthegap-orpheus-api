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
import InterviewService from '../logic/interviews';
import FileService from '../logic/files';
import CommentService from '../logic/comments';
import ManifestService from '../logic/manifests';

// models
import Interview from '../../models/interview';


const config = {
	name: 'InterviewType',
	description: 'Interview Schema base query type',
	class: 'GraphQLObjectType',
	schema: Interview.schema,
	exclude: [],
	extend: {
		files: {
			type: new GraphQLList(FileType),
			description: 'Get interview files',
			resolve(interview, args, { token }) {
				const fileService = new FileService(token);
				return fileService.getFiles({ interviewId: interview._id });
			}
		},
		filesCount: {
			type: GraphQLInt,
			description: 'Count all interview files',
			resolve(interview, args, { token }) {
				const fileService = new FileService(token);
				return fileService.count({ interviewId: interview._id });
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
				return commentService.getComment({ interviewId: parent._id, _id, slug, hostname });
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
				return commentService.getComments({ interviewId: parent._id, textsearch, limit, offset });
			}
		},
		commentsCount: {
			type: GraphQLInt,
			description: 'Get count of comment for project',
			resolve(parent, _, { token }) {
				const commentService = new CommentService(token);
				return commentService.count({ interviewId: parent._id });
			}
		},
		metadata: {
			type: new GraphQLList(MetadataType),
			description: 'Get interview metadata',
			resolve(interview, args, context) {
				return interview.metadata;
			}
		},
		manifest: {
			type: ManifestType,
			description: 'Get a IIIF manifest for all image files associated with interview',
			resolve(parent, _, { token }) {
				const manifestService = new ManifestService(token);
				return manifestService.getManifest({ interviewId: parent._id, });
			}
		},
	},
};

const configInput = {
	name: 'InterviewInputType',
	description: 'Interview Schema base create input type',
	class: 'GraphQLInputObjectType',
	schema: Interview.schema,
	exclude: ['createdAt', 'updatedAt'],
	extend: {
		metadata: {
			type: new GraphQLList(MetadataInputType)
		},
	}
};

const InterviewType = createType(config);
const InterviewInputType = createType(configInput);

export default InterviewType;
export { InterviewInputType };
