import _s from 'underscore.string';
import shortid from 'shortid';
import rp from 'request-promise';
import request from 'request';

// services
import PermissionsService from './PermissionsService';

// models
import Event from '../../models/event';
import File from '../../models/file';
import Manifest from '../../models/manifest';
import Project from '../../models/project';

// errors
import { AuthenticationError, PermissionError } from '../errors';


const saveFiles = async (project, event, files) => {

	const existingFiles = await File.find({
		eventId: event._id
	});

	// remove all existing files
	existingFiles.forEach(async (existingFile) => {
		await File.remove({
			_id: existingFile._id,
		});
	});

	files.forEach(async (file) => {
		if (!('_id' in file)) {
			file._id = shortid.generate();
		}

		// relationships
		file.eventId = event._id;
		file.projectId = project._id;

		const newFile = new File(file);
		await newFile.save();
	});
};


const saveManifest = async (project, event, files) => {
	const images = [];
	files.forEach((file) => {
		let newImageName = file.name;
		newImageName = newImageName.replace(`${file._id}-`, '');

		images.push({
			_id: file._id,
			name: newImageName,
			label: file.title,
		});
	});

	// update event manifest
	const manifest = {
		eventId: event._id,
		title: event.title,
		label: event.title,
		description: event.description || '',
		attribution: project.title,
		images,
	};

	let existingManifest = await Manifest.findOne({ eventId: manifest.eventId });
	if (!existingManifest) {
		existingManifest = new Manifest(manifest);
		await existingManifest.save();
		existingManifest = await Manifest.findOne({ eventId: manifest.eventId });
	} else {
		await Manifest.update({
			eventId: manifest.eventId,
		}, {
			$set: manifest
		});
	}

	manifest._id = existingManifest._id;
	const manifestCreationResult = await request.post('http://generate-manifests.orphe.us/manifests', {
		form: {
			manifest: JSON.stringify(manifest),
			responseUrl: process.env.MANIFEST_RESPONSE_URL,
		},
	});
};


/**
 * Logic-layer service for dealing with events
 */

export default class EventService extends PermissionsService {
	/**
	 * Count events
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @returns {number} count of events
	 */
	async count({ projectId, collectionId }) {
		const where = {};

		if (!projectId && !collectionId) {
			return 0;
		}

		if (projectId) {
			where.projectId = projectId;
		}

		if (collectionId) {
			where.collectionId = collectionId;
		}

		return await Event.count(where);
	}

	/**
	 * Get a list of events
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @param {string} textsearch
	 * @param {number} offset
	 * @param {number} limit
	 * @returns {Object[]} array of events
	 */
	async getEvents({ projectId, collectionId, textsearch, offset, limit }) {
		const args = {};

		if (!projectId && !collectionId) {
			return [];
		}

		if (projectId) {
			args.projectId = projectId;
		}

		if (collectionId) {
			args.collectionId = collectionId;
		}

		if (textsearch) {
			args.title = /.*${textsearch}.*/;
		}

		return await Event.find(args)
			.sort({ slug: 1})
			.skip(offset)
			.limit(limit);
	}

	/**
	 * Get event
	 * @param {string} collectionId - id of collection of event
	 * @param {number} _id - id of event
	 * @param {string} slug - slug of event
	 * @returns {Object[]} array of events
	 */
	async getEvent({ collectionId, _id, slug }) {
		const where = {};

		if (!_id && !slug) {
			return null;
		}

		if (_id) {
			where._id = _id;
		}

		if (slug) {
			where.slug = slug;
		}

		return await Event.findOne(where);
	}

	/**
	 * Create a new event
	 * @param {Object} event - event candidate
	 * @param {string} hostname - hostname of event project
	 * @param {[Object]} files - files for the object
	 * @returns {Object} created event
	 */
	async create(hostname, event, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ hostname });
		if (!project) throw new ArgumentError({ data: { field: 'hostname' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// Initiate new event
		event.projectId = project._id;
		event.slug = _s.slugify(event.title);
		const newEvent = new Event(event);

		await newEvent.save();

		if (files) {
			await saveFiles(project, newEvent, files);
			await saveManifest(project, newEvent, files);
		}

		// return new event
		return newEvent;
	}

	/**
	 * Update a event
	 * @param {Object} event - event candidate
	 * @returns {Object} updated event
	 */
	async update(event, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ _id: event.projectId });
		if (!project) throw new ArgumentError({ data: { field: 'event.projectId' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// perform action
		const result = await Event.update({ _id: event._id }, { $set: event });
		const updatedEvent = await Event.findById(event._id);

		// save files and add ids to event
		if (files) {
			await saveFiles(project, updatedEvent, files);
			await saveManifest(project, updatedEvent, files);
		}

		// TODO
		// error handling

		// return updated event
		return updatedEvent;
	}

	/**
	 * Remove a event
	 * @param {string} _id - id of event to Remove
	 * @param {string} hostname - hostname of project to check permissions against
	 * @returns {boolean} remove result
	 */
	async remove(_id, hostname) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ hostname });
		if (!project) throw new ArgumentError({ data: { field: 'hostname' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// perform action
		const result = await Event.remove({ _id });

		// TODO
		// error handling

		// respond with result
		return {
			result,
		};
	}

	/**
	 * Get event activity feed
	 * @param {number} eventId - event id for activity
	 * @param {number} limit - mongoose orm limit
	 * @param {number} offset - mongoose orm offset
	 * @returns {Object[]} activity feed events
	 */
	async getActivityFeed({ eventId, limit, offset }) {

		// TODO:
		// get activity feed from events, events, articles, texts, and comments

		return [];
	}
}
