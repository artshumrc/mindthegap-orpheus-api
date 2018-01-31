import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList } from 'graphql';

// types
import PersonType, { PersonInputType } from '../types/person';
import { FileInputType } from '../types/file';
import RemoveType from '../types/remove';

// Logic
import PersonService from '../logic/persons';



const personMutationFields = {
	personCreate: {
		type: PersonType,
		description: 'Create new person',
		args: {
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
			person: {
				type: new GraphQLNonNull(PersonInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(obj, { hostname, person, files }, { token }) {
			const personService = new PersonService(token);
			return await personService.create(hostname, person, files);
		},
	},

	personUpdate: {
		type: PersonType,
		description: 'Update person',
		args: {
			person: {
				type: new GraphQLNonNull(PersonInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(parent, { person, files }, { token }) {
			const personService = new PersonService(token);
			return await personService.update(person, files);
		}
	},

	personRemove: {
		type: RemoveType,
		description: 'Remove person',
		args: {
			_id: {
				type: new GraphQLNonNull(GraphQLString),
			},
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
		},
		async resolve(parent, { _id, hostname }, { token }) {
			const personService = new PersonService(token);
			return await personService.remove(_id, hostname);
		}
	},
};

export default personMutationFields;
