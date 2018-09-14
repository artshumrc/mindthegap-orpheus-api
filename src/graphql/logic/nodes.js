// services
import PermissionsService from './PermissionsService';

// models
import Event from '../../models/event';
import Interview from '../../models/interview';
import Item from '../../models/item';
import Person from '../../models/person';



/**
 * Logic-layer service for dealing with items
 */

export default class NodeService extends PermissionsService {
 /**
	 * Get node
	 * @param {number} _id - id of node
	 * @returns {Object[]} array of objects from db
	 */
	async getNode({ _id }) {
		const where = { _id };
		let node = null;

		if (!_id) {
			return null;
		}


		const event = await Event.findOne(where);
		const interview = await Interview.findOne(where);
		const item = await Item.findOne(where);
		const person = await Person.findOne(where);

		if (event) {
			node = event;
			node.collectionType = 'event';
		}

		if (interview) {
			node = interview;
			node.collectionType = 'interview';
		}

		if (item) {
			node = item;
			node.collectionType = 'item';
		}

		if (person) {
			node = person;
			node.title = person.name;
			node.description = person.bio;
			node.collectionType = 'person';
		}

		return node;
	}
}
