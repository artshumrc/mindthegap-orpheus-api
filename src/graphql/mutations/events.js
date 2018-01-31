import { GraphQLNonNull, GraphQLID, GraphQLString, GraphQLList } from 'graphql';

// types
import EventType, { EventInputType } from '../types/event';
import { FileInputType } from '../types/file';
import RemoveType from '../types/remove';

// Logic
import EventService from '../logic/events';



const eventMutationFields = {
	eventCreate: {
		type: EventType,
		description: 'Create new event',
		args: {
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
			event: {
				type: new GraphQLNonNull(EventInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(obj, { hostname, event, files }, { token }) {
			const eventService = new EventService(token);
			return await eventService.create(hostname, event, files);
		},
	},

	eventUpdate: {
		type: EventType,
		description: 'Update event',
		args: {
			event: {
				type: new GraphQLNonNull(EventInputType),
			},
			files: {
				type: new GraphQLList(FileInputType),
			},
		},
		async resolve(parent, { event, files }, { token }) {
			const eventService = new EventService(token);
			return await eventService.update(event, files);
		}
	},

	eventRemove: {
		type: RemoveType,
		description: 'Remove event',
		args: {
			_id: {
				type: new GraphQLNonNull(GraphQLString),
			},
			hostname: {
				type: new GraphQLNonNull(GraphQLString)
			},
		},
		async resolve(parent, { _id, hostname }, { token }) {
			const eventService = new EventService(token);
			return await eventService.remove(_id, hostname);
		}
	},
};

export default eventMutationFields;
