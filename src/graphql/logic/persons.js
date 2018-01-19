import _s from 'underscore.string';
import shortid from 'shortid';
import rp from 'request-promise';
import request from 'request';

// services
import PermissionsService from './PermissionsService';

// models
import Person from '../../models/person';
import File from '../../models/file';
import Manifest from '../../models/manifest';
import Project from '../../models/project';

// errors
import { AuthenticationError, PermissionError } from '../errors';


const saveFiles = async (project, person, files) => {

	const existingFiles = await File.find({
		personId: person._id
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
		file.personId = person._id;
		file.projectId = project._id;

		const newFile = new File(file);
		await newFile.save();
	});
};


const saveManifest = async (project, person, files) => {
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

	// update person manifest
	const manifest = {
		personId: person._id,
		title: person.title,
		label: person.title,
		description: person.description || '',
		attribution: project.title,
		images,
	};

	let existingManifest = await Manifest.findOne({ personId: manifest.personId });
	if (!existingManifest) {
		existingManifest = new Manifest(manifest);
		await existingManifest.save();
		existingManifest = await Manifest.findOne({ personId: manifest.personId });
	} else {
		await Manifest.update({
			personId: manifest.personId,
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
 * Logic-layer service for dealing with persons
 */

export default class PersonService extends PermissionsService {
	/**
	 * Count persons
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @returns {number} count of persons
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

		return await Person.count(where);
	}

	/**
	 * Get a list of persons
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @param {string} textsearch
	 * @param {number} offset
	 * @param {number} limit
	 * @returns {Object[]} array of persons
	 */
	async getPersons({ projectId, collectionId, textsearch, offset, limit }) {
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

		return await Person.find(args)
			.sort({ slug: 1})
			.skip(offset)
			.limit(limit);
	}

	/**
	 * Get person
	 * @param {string} collectionId - id of collection of person
	 * @param {number} _id - id of person
	 * @param {string} slug - slug of person
	 * @returns {Object[]} array of persons
	 */
	async getPerson({ collectionId, _id, slug }) {
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

		return await Person.findOne(where);
	}

	/**
	 * Create a new person
	 * @param {Object} person - person candidate
	 * @param {string} hostname - hostname of person project
	 * @param {[Object]} files - files for the object
	 * @returns {Object} created person
	 */
	async create(hostname, person, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ hostname });
		if (!project) throw new ArgumentError({ data: { field: 'hostname' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// Initiate new person
		person.projectId = project._id;
		person.slug = _s.slugify(person.title);
		const newPerson = new Person(person);

		await newPerson.save();

		if (files) {
			await saveFiles(project, newPerson, files);
			await saveManifest(project, newPerson, files);
		}

		// return new person
		return newPerson;
	}

	/**
	 * Update a person
	 * @param {Object} person - person candidate
	 * @returns {Object} updated person
	 */
	async update(person, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ _id: person.projectId });
		if (!project) throw new ArgumentError({ data: { field: 'person.projectId' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// perform action
		const result = await Person.update({ _id: person._id }, { $set: person });
		const updatedPerson = await Person.findById(person._id);

		// save files and add ids to person
		if (files) {
			await saveFiles(project, updatedPerson, files);
			await saveManifest(project, updatedPerson, files);
		}

		// TODO
		// error handling

		// return updated person
		return updatedPerson;
	}

	/**
	 * Remove a person
	 * @param {string} _id - id of person to Remove
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
		const result = await Person.remove({ _id });

		// TODO
		// error handling

		// respond with result
		return {
			result,
		};
	}

	/**
	 * Get person activity feed
	 * @param {number} personId - person id for activity
	 * @param {number} limit - mongoose orm limit
	 * @param {number} offset - mongoose orm offset
	 * @returns {Object[]} activity feed persons
	 */
	async getActivityFeed({ personId, limit, offset }) {

		// TODO:
		// get activity feed from persons, persons, articles, texts, and comments

		return [];
	}
}
