import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList } from 'graphql';

// types
import InterviewType, { InterviewInputType } from '../types/interview';
import { FileInputType } from '../types/file';
import RemoveType from '../types/remove';

// Logic
import InterviewService from '../logic/interviews';



const interviewMutationFields = {
	interviewCreate: {
		type: InterviewType,
		description: 'Create new interview',
		args: {
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
			interview: {
				type: new GraphQLNonNull(InterviewInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(obj, { hostname, interview, files }, { token }) {
			const interviewService = new InterviewService(token);
			return await interviewService.create(hostname, interview, files);
		},
	},

	interviewUpdate: {
		type: InterviewType,
		description: 'Update interview',
		args: {
			interview: {
				type: new GraphQLNonNull(InterviewInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(parent, { interview, files }, { token }) {
			const interviewService = new InterviewService(token);
			return await interviewService.update(interview, files);
		}
	},

	interviewRemove: {
		type: RemoveType,
		description: 'Remove interview',
		args: {
			_id: {
				type: new GraphQLNonNull(GraphQLString),
			},
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
		},
		async resolve(parent, { _id, hostname }, { token }) {
			const interviewService = new InterviewService(token);
			return await interviewService.remove(_id, hostname);
		}
	},
};

export default interviewMutationFields;
