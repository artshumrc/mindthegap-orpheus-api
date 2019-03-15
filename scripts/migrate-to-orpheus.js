import dotenv from 'dotenv';

import { OrpheusItemBuilder } from 'orpheus-tools';

import dbSetup from '../src/mongoose';

import ItemService from '../src/graphql/logic/items';

// setup env vars
dotenv.config();

// init db
const db = dbSetup();

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
		const itemService = new ItemService('');
		const items = await itemService.getItems({
			projectId: 'B1C3ecG4M',
			limit: 1,
		});
		console.log('...items', items);

		// process items
		for (let i = 0; i < items.length; i += 1) {
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

			//
			// upload to orpheus
			//
			try {
				console.log('...transformedItem', transformedItem);
				await itemBuilder.processItem(transformedItem, []); // eslint-disable-line
			} catch (error) {
				throw new Error('Error at submitItemToOrpheus ... ', error);
			}
		}


		//
		// mtg event to orpheus item
		//


		//
		// mtg interview to orpheus item
		//


		//
		// mtg person to orpheus item
		//

	});

