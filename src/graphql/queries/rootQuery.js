import { GraphQLObjectType } from 'graphql';

import projectQueryFields from './projects';
import nodeQueryFields from './nodes';
import userQueryFields from './users';

/**
 * Root Queries
 * @type {GraphQLObjectType}
 */
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	description: 'Root query object type',
	fields: {
		...projectQueryFields,
		...nodeQueryFields,
		...userQueryFields,
	},
});

export default RootQuery;
