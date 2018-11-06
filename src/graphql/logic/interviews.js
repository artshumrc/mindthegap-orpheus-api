import _s from 'underscore.string';
import shortid from 'shortid';
import rp from 'request-promise';
import request from 'request';

// services
import PermissionsService from './PermissionsService';

// models
import Interview from '../../models/interview';
import File from '../../models/file';
import Manifest from '../../models/manifest';
import Project from '../../models/project';

// errors
import { AuthenticationError, PermissionError } from '../errors';


const saveFiles = async (project, interview, files) => {

	const existingFiles = await File.find({
		interviewId: interview._id
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
		file.interviewId = interview._id;
		file.projectId = project._id;

		const newFile = new File(file);
		await newFile.save();
	});
};


const saveManifest = async (project, interview, files) => {
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

	// update interview manifest
	const manifest = {
		interviewId: interview._id,
		title: interview.title,
		label: interview.title,
		description: interview.description || '',
		attribution: project.title,
		images,
	};

	let existingManifest = await Manifest.findOne({ interviewId: manifest.interviewId });
	if (!existingManifest) {
		existingManifest = new Manifest(manifest);
		await existingManifest.save();
		existingManifest = await Manifest.findOne({ interviewId: manifest.interviewId });
	} else {
		await Manifest.update({
			interviewId: manifest.interviewId,
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
 * Logic-layer service for dealing with interviews
 */

export default class InterviewService extends PermissionsService {
	/**
	 * Count interviews
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @returns {number} count of interviews
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

		return await Interview.count(where);
	}

	/**
	 * Get a list of interviews
	 * @param {string} projectId
	 * @param {string} collectionId
	 * @param {string} textsearch
	 * @param {number} offset
	 * @param {number} limit
	 * @returns {Object[]} array of interviews
	 */
	async getInterviews({ projectId, collectionId, _ids, textsearch, offset, limit }) {
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

		if (_ids) {
			args._id = { $in: _ids };
		}

		if (textsearch) {
			args.title = /.*${textsearch}.*/;
		}

		return await Interview.find(args)
			.sort({ slug: 1})
			.skip(offset)
			.limit(limit);
	}

	/**
	 * Get interview
	 * @param {string} collectionId - id of collection of interview
	 * @param {number} _id - id of interview
	 * @param {string} slug - slug of interview
	 * @returns {Object[]} array of interviews
	 */
	async getInterview({ collectionId, _id, slug }) {
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

		return await Interview.findOne(where);
	}

	/**
	 * Create a new interview
	 * @param {Object} interview - interview candidate
	 * @param {string} hostname - hostname of interview project
	 * @param {[Object]} files - files for the object
	 * @returns {Object} created interview
	 */
	async create(hostname, interview, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ hostname });
		if (!project) throw new ArgumentError({ data: { field: 'hostname' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// Initiate new interview
		interview.projectId = project._id;
		interview.slug = _s.slugify(interview.title);
		const newInterview = new Interview(interview);

		await newInterview.save();

		if (files && files.length) {
			await saveFiles(project, newInterview, files);
			await saveManifest(project, newInterview, files);
		}

		// return new interview
		return newInterview;
	}

	/**
	 * Update a interview
	 * @param {Object} interview - interview candidate
	 * @returns {Object} updated interview
	 */
	async update(interview, files) {
		// if user is not logged in
		if (!this.userId) throw new AuthenticationError();

		// find project
		const project = await Project.findOne({ _id: interview.projectId });
		if (!project) throw new ArgumentError({ data: { field: 'interview.projectId' } });

		// validate permissions
		const userIsAdmin = this.userIsProjectAdmin(project);
		if (!userIsAdmin) throw new PermissionError();

		// perform action
		const result = await Interview.update({ _id: interview._id }, { $set: interview });
		const updatedInterview = await Interview.findById(interview._id);

		// save files and add ids to interview
		if (files && files.length) {
			await saveFiles(project, updatedInterview, files);
			await saveManifest(project, updatedInterview, files);
		}

		// TODO
		// error handling

		// return updated interview
		return updatedInterview;
	}

	/**
	 * Remove a interview
	 * @param {string} _id - id of interview to Remove
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
		const result = await Interview.remove({ _id });

		// TODO
		// error handling

		// respond with result
		return {
			result,
		};
	}

	/**
	 * Get interview activity feed
	 * @param {number} interviewId - interview id for activity
	 * @param {number} limit - mongoose orm limit
	 * @param {number} offset - mongoose orm offset
	 * @returns {Object[]} activity feed interviews
	 */
	async getActivityFeed({ interviewId, limit, offset }) {

		// TODO:
		// get activity feed from interviews, interviews, articles, texts, and comments

		return [];
	}
}
