import { GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList } from 'graphql';

// types
import NodeType from '../types/node';

// Logic
import NodeService from '../logic/nodes';


const nodeQueryFields = {
	node: {
		type: NodeType,
		description: 'Get node by node id',
		args: {
			_id: {
				type: GraphQLString,
			},
		},
		resolve(parent, { _id, }, { token }) {
			const nodeService = new NodeService(token);
			return nodeService.getNode({ _id, });
		}
	},
};

export default nodeQueryFields;
