import Person from '../../models/person';
import Interview from '../../models/interview';
import Event from '../../models/event';
import Item from '../../models/item';

const setupAPI = (app) => {

	app.use('/v1/', async (req, res) => {
		const apiResponse = {
			pagination: null,
			error: null,
		};
		let offset = 0;
		let limit = 10;

		if (!req.query || !req.query.type) {
			apiResponse.error = 'Must provide type for input parameters query (e.g. ?type=people)';
		} else {
			if (req.query.offset) {
				offset = req.query.offset;
			}

			if (req.query.limit) {
				limit = req.query.limit;
			}


			switch (req.query.type) {
			case 'people':
				apiResponse.people = await Person.find()
									.sort('name')
											.skip(offset)
											.limit(limit);
				apiResponse.pagination = {
					numFound: await Person.count(),
					query: '',
					sort: '',
					limit,
					offset,
				};
				break;
			case 'interviews':
				apiResponse.interviews = await Interview.find()
																	.sort('title')
																		.skip(offset)
																		.limit(limit);
				apiResponse.pagination = {
					numFound: await Interview.count(),
					query: '',
					sort: '',
					limit,
					offset,
				};
				break;
			case 'items':
				apiResponse.items = await Item.find()
															.sort('title')
																.skip(offset)
																.limit(limit);
				apiResponse.pagination = {
					numFound: await Item.count(),
					query: '',
					sort: '',
					limit,
					offset,
				};
				break;
			case 'events':
				apiResponse.events = await Event.find()
															.sort('title')
																.skip(offset)
																.limit(limit);
				apiResponse.pagination = {
					numFound: await Event.count(),
					query: '',
					sort: '',
					limit,
					offset,
				};
				break;
			default:
				break;
			}
		}

		// sent response
		res.send(apiResponse);
	});
};

export default setupAPI;
