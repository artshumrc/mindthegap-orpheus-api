import Person from '../../models/person';
import Interview from '../../models/interview';
import Event from '../../models/event';
import Item from '../../models/item';


const addType = (arr, type) => {
	const _arr = [];
	arr.forEach((obj) => {
		// treat mongoose collection object class just like an object
		const _obj = Object.assign({}, obj._doc);
		_obj.type = type;
		_arr.push(_obj);
	});
	return _arr;
};

const setupAPI = (app) => {

	app.use('/v1/', async (req, res) => {
		const apiResponse = {
			pagination: null,
			error: null,
		};
		let offset = 0;
		let limit = 10;

		if (!req.query || !req.query.type) {

			// apiResponse.error = 'Must provide type for input parameters query (e.g. ?type=people)';
			// For the moment, if no query, just return everything
			const relationships = [];

			let people = await Person.find()
								.sort('name');
			people = addType(people, 'person');

			let interviews = await Interview.find()
								.sort('title');
			interviews = addType(interviews, 'interview');

			let items = await Item.find()
								.sort('title');
			items = addType(items, 'item');

			let events = await Event.find()
								.sort('title');
			events = addType(events, 'event');

			apiResponse.nodes = [...people, ...interviews, ...items, ...events];

			apiResponse.edges = [];
			people.forEach((person) => {
				person.events.forEach((event) => {
					if (event) {
						apiResponse.edges.push({
							source: person._id,
							target: event,
						});
					}
				});
				person.interviews.forEach((interview) => {
					if (interview) {
						apiResponse.edges.push({
							source: person._id,
							target: interview,
						});
					}
				});
				person.items.forEach((item) => {
					if (item) {
						apiResponse.edges.push({
							source: person._id,
							target: item,
						});
					}
				});
			});



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
					query: req.query,
					sort: 'name',
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
					query: req.query,
					sort: 'title',
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
					query: req.query,
					sort: 'title',
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
					query: req.query,
					sort: 'title',
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
