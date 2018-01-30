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

		if (!req.query || !req.query.type) {
			apiResponse.error = 'Must provide type for input parameters query (e.g. ?type=people)';
		} else {
			switch (req.query.type) {
			case 'people':
				apiResponse.people = await Person.find();
				break;
			case 'interviews':
				apiResponse.interviews = [];
				break;
			case 'items':
				apiResponse.items = [];
				break;
			case 'events':
				apiResponse.events = [];
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
