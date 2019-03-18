import dotenv from 'dotenv';

import { OrpheusItemBuilder } from 'orpheus-tools';

import dbSetup from '../src/mongoose';

import ItemService from '../src/graphql/logic/items';
import FileService from '../src/graphql/logic/files';
import EventService from '../src/graphql/logic/events';
import InterviewService from '../src/graphql/logic/interviews';
import PersonService from '../src/graphql/logic/persons';

// setup env vars
dotenv.config();

// init db
const db = dbSetup();

const MTGProjectID = process.env.MTG_PROJECTID;

// init item builder
const itemBuilder = new OrpheusItemBuilder({
	username: process.env.ORPHEUS_USER,
	password: process.env.ORPHEUS_PASS,
	hostname: process.env.ORPHEUS_HOSTNAME,
});

// start migration
db.on('error', console.error)
	.on('disconnected', dbSetup)
	.once('open', async () => {
		console.info(`Connected to mongodb ( host: ${db.host}, port: ${db.port}, name: ${db.name} )`);

		//
		// mtg item to orpheus item
		//
		const itemService = new ItemService();
		const items = await itemService.getItems({
			projectId: MTGProjectID,
			// limit: 1,
		});
		console.log('...itemCount', items.length);

		// process items
		for (let i = 0; i < items.length; i += 1) {
			console.log('...processing item #', i + 1);
			const mtgItem = items[i];
			console.log('...mtgItem', mtgItem);

			//
			// transform item
			//
			const transformedItem = {
				title: mtgItem.title,
				description: mtgItem.description,
				slug: mtgItem.slug,
				private: mtgItem.private,
				metadata: mtgItem.metadata.map(a => a), // plain object
				collectionId: mtgItem.collectionId,
			};
			// populate metadata
			transformedItem.metadata.push({
				type: 'text',
				label: 'Type',
				value: 'Item',
			}); // add Type
			

			//
			// build files
			//
			const fileService = new FileService();
			const files = await fileService.getFiles({ // eslint-disable-line
				projectId: MTGProjectID,
				itemId: mtgItem._id,
			});
			console.log('...mtgFiles', files);
			const transformedFiles = files.map((file) => {
				const orpheusFile = {
					_id: file._id, // fix manifest issue
					name: file.name,
					title: file.title,
					type: file.type,
					path: file.path,
					projectId: file.projectId,
					slug: file.slug,
				};
				return orpheusFile;
			});
			console.log('...transformedFiles', transformedFiles);

			//
			// upload to orpheus
			//
			try {
				console.log('...transformedItem', transformedItem);
				await itemBuilder.processItem(transformedItem, transformedFiles); // eslint-disable-line
			} catch (error) {
				throw new Error('Error at submitItemToOrpheus ... ', error);
			}
		}


		//
		// mtg event to orpheus item
		//
		const eventService = new EventService();
		const events = await eventService.getEvents({
			projectId: MTGProjectID,
			// limit: 1,
		});
		console.log('...eventCount', events.length);

		// process events
		for (let i = 0; i < events.length; i += 1) {
			console.log('...processing event #', i + 1);
			const mtgItem = events[i];
			console.log('...mtgItem', mtgItem);

			//
			// transform item
			//
			const transformedItem = {
				title: mtgItem.title,
				description: mtgItem.description,
				slug: mtgItem.slug,
				private: mtgItem.private,
				metadata: mtgItem.metadata.map(a => a), // plain object
				collectionId: mtgItem.collectionId,
			};
			// populate metadata
			transformedItem.metadata.push({
				type: 'text',
				label: 'Type',
				value: 'Event',
			}); 
			if (mtgItem.dateStart) {
				transformedItem.metadata.push({
					type: 'date',
					label: 'Date Start',
					value: mtgItem.dateStart,
				}); 
			}
			if (mtgItem.dateEnd) {
				transformedItem.metadata.push({
					type: 'date',
					label: 'Date End',
					value: mtgItem.dateEnd,
				}); 
			}
			if (mtgItem.dateDisplay) {
				transformedItem.metadata.push({
					type: 'text',
					label: 'Date Display',
					value: mtgItem.dateDisplay,
				}); 
			}

			//
			// build files
			//
			const fileService = new FileService();
			const files = await fileService.getFiles({ // eslint-disable-line
				projectId: MTGProjectID,
				eventId: mtgItem._id,
			});
			console.log('...mtgFiles', files);
			const transformedFiles = files.map((file) => {
				const orpheusFile = {
					_id: file._id, // fix manifest issue
					name: file.name,
					title: file.title,
					type: file.type,
					path: file.path,
					projectId: file.projectId,
					slug: file.slug,
				};
				return orpheusFile;
			});
			console.log('...transformedFiles', transformedFiles);

			//
			// upload to orpheus
			//
			try {
				console.log('...transformedItem', transformedItem);
				await itemBuilder.processItem(transformedItem, transformedFiles); // eslint-disable-line
			} catch (error) {
				throw new Error('Error at submitItemToOrpheus ... ', error);
			}
		}

		//
		// mtg interview to orpheus item
		//
		const interviewService = new InterviewService();
		const interviews = await interviewService.getInterviews({
			projectId: MTGProjectID,
			// limit: 1,
		});
		console.log('...interviews', interviews.length);

		// process interviews
		for (let i = 0; i < interviews.length; i += 1) {
			console.log('...processing interview #', i + 1);
			const mtgItem = interviews[i];
			console.log('...mtgItem', mtgItem);

			//
			// transform item
			//
			const transformedItem = {
				title: mtgItem.title,
				description: mtgItem.description,
				slug: mtgItem.slug,
				private: mtgItem.private,
				metadata: mtgItem.metadata.map(metafield => ({
					type: metafield.type,
					label: metafield.label,
					value: metafield.value,
				})), // trim _id
				collectionId: mtgItem.collectionId,
			};
			// populate metadata
			transformedItem.metadata.push({
				type: 'text',
				label: 'Type',
				value: 'Interview',
			}); 


			//
			// build files
			//
			const fileService = new FileService();
			const files = await fileService.getFiles({ // eslint-disable-line
				projectId: MTGProjectID,
				interviewId: mtgItem._id,
			});
			console.log('...mtgFiles', files);
			const transformedFiles = files.map((file) => {
				const orpheusFile = {
					_id: file._id, // fix manifest issue
					name: file.name,
					title: file.title,
					type: file.type,
					path: file.path,
					projectId: file.projectId,
					slug: file.slug,
				};
				return orpheusFile;
			});
			console.log('...transformedFiles', transformedFiles);

			//
			// upload to orpheus
			//
			try {
				console.log('...transformedItem', transformedItem);
				await itemBuilder.processItem(transformedItem, transformedFiles); // eslint-disable-line
			} catch (error) {
				throw new Error('Error at submitItemToOrpheus ... ', error);
			}
		}

		//
		// mtg person to orpheus item
		//
		const personService = new PersonService();
		const persons = await personService.getPersons({
			projectId: MTGProjectID,
			// limit: 1,
		});
		console.log('...persons', persons.length);

		// process persons
		for (let i = 0; i < persons.length; i += 1) {
			console.log('...processing persons #', i + 1);
			const mtgItem = persons[i];
			console.log('...mtgItem', mtgItem);

			//
			// transform item
			//
			const transformedItem = {
				title: mtgItem.name,
				description: mtgItem.description,
				slug: mtgItem.slug,
				private: mtgItem.private,
				metadata: mtgItem.metadata.map(metafield => ({
					type: metafield.type,
					label: metafield.label,
					value: metafield.value,
				})), // trim _id
				collectionId: mtgItem.collectionId,
			};
			// populate metadata
			transformedItem.metadata.push({
				type: 'text',
				label: 'Type',
				value: 'Person',
			}); 
			if (mtgItem.dateBirth) {
				transformedItem.metadata.push({
					type: 'date',
					label: 'Date Birth',
					value: mtgItem.dateBirth,
				}); 
			}
			if (mtgItem.dateDeath) {
				transformedItem.metadata.push({
					type: 'date',
					label: 'Date Death',
					value: mtgItem.dateDeath,
				}); 
			}
			if (mtgItem.bio) {
				transformedItem.metadata.push({
					type: 'text',
					label: 'Bio',
					value: mtgItem.bio,
				}); 
			}


			//
			// build files
			//
			const fileService = new FileService();
			const files = await fileService.getFiles({ // eslint-disable-line
				projectId: MTGProjectID,
				personId: mtgItem._id,
			});
			console.log('...mtgFiles', files);
			const transformedFiles = files.map((file) => {
				const orpheusFile = {
					_id: file._id, // fix manifest issue
					name: file.name,
					title: file.title,
					type: file.type,
					path: file.path,
					projectId: file.projectId,
					slug: file.slug,
				};
				return orpheusFile;
			});
			console.log('...transformedFiles', transformedFiles);

			//
			// upload to orpheus
			//
			try {
				console.log('...transformedItem', transformedItem);
				await itemBuilder.processItem(transformedItem, transformedFiles); // eslint-disable-line
			} catch (error) {
				throw new Error('Error at submitItemToOrpheus ... ', error);
			}
		}

		console.log('Migration completed.');
	});

