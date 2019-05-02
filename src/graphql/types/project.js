import {
	GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString, GraphQLInt,
	GraphQLBoolean,
} from 'graphql';
import createType from 'mongoose-schema-to-graphql';

// models
import Project from '../../models/project';

// logic
import CollectionService from '../logic/collections';
import ArticleService from '../logic/articles';
import FileService from '../logic/files';
import ItemService from '../logic/items';
import ProjectService from '../logic/projects';
import TextService from '../logic/texts';
import UserService from '../logic/users';
import PageService from '../logic/pages';
import EventService from '../logic/events';
import InterviewService from '../logic/interviews';
import PersonService from '../logic/persons';

// types
import CollectionType from './collection';
import ArticleType from './article';
import FileType from './file';
import EventType from './event';
import ItemType from './item';
import InterviewType from './interview';
import PersonType from './person';
import ActivityItemType from './activityItem';
import TextType from './text';
import UserType from './user';
import PageType from './page';


const config = {
	name: 'ProjectType',
	description: 'Project base query type',
	class: 'GraphQLObjectType',
	schema: Project.schema,
	extend: {
		collection: {
			type: CollectionType,
			description: 'Get collection document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
				hostname: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug, hostname }, { token }) {
				const collectionService = new CollectionService(token);
				return collectionService.getCollection({ projectId: parent._id, _id, slug, hostname });
			}
		},
		collections: {
			type: new GraphQLList(CollectionType),
			description: 'Get list of collections',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const collectionService = new CollectionService(token);
				return collectionService.getCollections({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		collectionsCount: {
			type: GraphQLInt,
			description: 'Get count of collection for project',
			resolve(parent, _, { token }) {
				const collectionService = new CollectionService(token);
				return collectionService.count({ projectId: parent._id });
			}
		},
		article: {
			type: ArticleType,
			description: 'Get article document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
				hostname: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug, hostname }, { token }) {
				const articleService = new ArticleService(token);
				return articleService.getArticle({ projectId: parent._id, _id, slug, hostname });
			}
		},
		articles: {
			type: new GraphQLList(ArticleType),
			description: 'Get list of articles',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const articleService = new ArticleService(token);
				return articleService.getArticles({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		articlesCount: {
			type: GraphQLInt,
			description: 'Get count of articles in project',
			resolve(parent, _, { token }) {
				const articleService = new ArticleService(token);
				return articleService.count({ projectId: parent._id });
			}
		},
		page: {
			type: PageType,
			description: 'Get page document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
				hostname: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug, hostname }, { token }) {
				const pageService = new PageService(token);
				return pageService.getPage({ projectId: parent._id, _id, slug, hostname });
			}
		},
		pages: {
			type: new GraphQLList(PageType),
			description: 'Get list of pages',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const pageService = new PageService(token);
				return pageService.getPages({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		pagesCount: {
			type: GraphQLInt,
			description: 'Get count of pages in project',
			resolve(parent, _, { token }) {
				const pageService = new PageService(token);
				return pageService.count({ projectId: parent._id });
			}
		},
		activity: {
			type: new GraphQLList(ActivityItemType),
			description: 'Get project activity',
			resolve(parent, { limit, offset }, { token }) {
				const projectService = new ProjectService(token);
				return projectService.getActivityFeed({
					projectId: parent._id,
					limit,
					offset,
				});
			}
		},
		users: {
			type: new GraphQLList(new GraphQLObjectType({
				name: 'ProjectUsersType',
				fields: {
					user: {
						type: UserType,
						resolve(projectUser, args, { token }) {
							const userService = new UserService(token);
							return userService.getUser({ _id: projectUser.userId });
						}
					},
					role: {
						type: GraphQLString,
					}
				}
			})),
			resolve(parent, args, { token }) {
				return parent.users;
			}
		},
		userIsAdmin: {
			type: GraphQLBoolean,
			resolve(parent, args, { token }) {
				const userService = new UserService(token);
				return userService.userIsAdmin({ project: parent });
			}
		},
		item: {
			type: ItemType,
			description: 'Get item document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug }, { token }) {
				const itemService = new ItemService(token);
				return itemService.getItem({ projectId: parent._id, _id, slug });
			}
		},
		items: {
			type: new GraphQLList(ItemType),
			description: 'Get list of items',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const itemService = new ItemService(token);
				return itemService.getItems({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		itemsCount: {
			type: GraphQLInt,
			description: 'Get count of items in project',
			resolve(parent, _, { token }) {
				const itemService = new ItemService(token);
				return itemService.count({ projectId: parent._id });
			}
		},
		interview: {
			type: InterviewType,
			description: 'Get interview document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug }, { token }) {
				const interviewService = new InterviewService(token);
				return interviewService.getInterview({ projectId: parent._id, _id, slug });
			}
		},
		interviews: {
			type: new GraphQLList(InterviewType),
			description: 'Get list of interviews',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const interviewService = new InterviewService(token);
				return interviewService.getInterviews({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		interviewsCount: {
			type: GraphQLInt,
			description: 'Get count of interviews in project',
			resolve(parent, _, { token }) {
				const interviewService = new InterviewService(token);
				return interviewService.count({ projectId: parent._id });
			}
		},
		event: {
			type: EventType,
			description: 'Get event document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug }, { token }) {
				const eventService = new EventService(token);
				return eventService.getEvent({ projectId: parent._id, _id, slug });
			}
		},
		events: {
			type: new GraphQLList(EventType),
			description: 'Get list of events',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const eventService = new EventService(token);
				return eventService.getEvents({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		eventsCount: {
			type: GraphQLInt,
			description: 'Get count of events in project',
			resolve(parent, _, { token }) {
				const eventService = new EventService(token);
				return eventService.count({ projectId: parent._id });
			}
		},
		person: {
			type: PersonType,
			description: 'Get person document',
			args: {
				_id: {
					type: GraphQLString,
				},
				slug: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id, slug }, { token }) {
				const personService = new PersonService(token);
				return personService.getPerson({ projectId: parent._id, _id, slug });
			}
		},
		people: {
			type: new GraphQLList(PersonType),
			description: 'Get list of people',
			args: {
				_ids: {
					type: new GraphQLList(GraphQLString),
				},
				textsearch: {
					type: GraphQLString,
				},
				limit: {
					type: GraphQLInt,
				},
				offset: {
					type: GraphQLInt,
				},
			},
			resolve(parent, { _ids, textsearch, limit, offset }, { token }) {
				const personService = new PersonService(token);
				return personService.getPersons({ projectId: parent._id, _ids, textsearch, limit, offset });
			}
		},
		peopleCount: {
			type: GraphQLInt,
			description: 'Get count of people in project',
			resolve(parent, _, { token }) {
				const personService = new PersonService(token);
				return personService.count({ projectId: parent._id });
			}
		},
		files: {
			type: new GraphQLList(FileType),
			description: 'Get project files',
			resolve(parent, args, { token }) {
				const fileService = new FileService(token);
				return fileService.getFiles({ projectId: parent._id });
			}
		},
		file: {
			type: FileType,
			description: 'Get a project file',
			args: {
				_id: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id }, { token }) {
				const fileService = new FileService(token);
				return fileService.getFile({ projectId: parent._id, _id });
			}
		},
		filesCount: {
			type: GraphQLInt,
			description: 'Count all project files',
			resolve(parent, args, { token }) {
				const fileService = new FileService(token);
				return fileService.count({ projectId: parent._id });
			}
		},
		texts: {
			type: new GraphQLList(TextType),
			description: 'Get project texts',
			resolve(parent, args, { token }) {
				const textService = new TextService(token);
				return textService.getTexts({ projectId: parent._id });
			}
		},
		text: {
			type: TextType,
			description: 'Get a project text',
			args: {
				_id: {
					type: GraphQLString,
				},
			},
			resolve(parent, { _id }, { token }) {
				const textService = new TextService(token);
				return textService.getText({ projectId: parent._id, _id });
			}
		},
		textsCount: {
			type: GraphQLInt,
			description: 'Count all project texts',
			resolve(parent, args, { token }) {
				const textService = new TextService(token);
				return textService.count({ projectId: parent._id });
			}
		},
	},
};

const configInput = {
	name: 'ProjectInputType',
	description: 'Project Schema base create input type',
	class: 'GraphQLInputObjectType',
	schema: Project.schema,
	exclude: [],
};

const ProjectType = createType(config);
const ProjectInputType = createType(configInput);

export default ProjectType;
export { ProjectInputType };
