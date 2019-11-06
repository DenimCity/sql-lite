import express from 'express';
import Sequelize from 'sequelize';
import _USERS from './user-data.json';

const app = express();
const PORT = 8001;

const connection = new Sequelize('db', 'user', 'password', {
	host: 'local',
	dialect: 'sqlite',
	storage: 'db.sqlite'
});

const User = connection.define(
	'User',
	{
		name: Sequelize.STRING,
		email: {
			type: Sequelize.STRING,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: Sequelize.STRING,
			validate: {
				isAlphanumeric: true
			}
		}
		// userId: {
		// 	type: Sequelize.UUID,
		// 	primaryKey: true,
		// 	defaultValue: Sequelize.UUIDV4
		// },
		// firstName: Sequelize.STRING,
		// lastName: Sequelize.STRING,
		// full_name: Sequelize.STRING,
		// bio: {
		// 	type: Sequelize.TEXT
		// }
	},
	{
		hooks: {
			beforeValidate: () => {
				console.log('beforeValidate');
			},
			afterValidate: () => {
				console.log('afterValidate');
				// example of when you hass paswwords
				/**
                 * user.password = await bcrypt.hash(user.password, 12);
                 */
			},
			beforeCreate: (user) => {
				// user.full_name = `${user.firstName} ${user.lastName}`;
				// console.log('beforeCreate');
			},
			afterCreate: () => {
				console.log('afterCreate');
			}
		}
	}
);

const Post = connection.define('Post', {
	title: Sequelize.STRING,
	content: Sequelize.TEXT
	// title: Sequelize.String,
	// content: Sequelize.Text
});
const Comment = connection.define('Comment', {
	the_comment: Sequelize.STRING
});
const Project = connection.define('Project', {
	title: Sequelize.STRING
});

Post.belongsTo(User, { as: 'UserRef', foreignKey: 'userId' });
Post.hasMany(Comment, { as: 'All_Comments' }); // Foreign key  of postId will be add to the Comment Table

// Creates a UserProjects table with IDs for ProjectId and UserId
User.belongsToMany(Project, { as: 'Tasks', through: 'UserPojects' });
Project.belongsToMany(User, { as: 'Workers', through: 'UserPojects' });

const OP = Sequelize.Op;

app.get('/findAll', async (req, res) => {
	try {
		const users = await Post.findAll({
			// finding ALL with a filter
			include: [ { model: User, as: 'UserRef' } ],
			raw: true
		});
		res.json(users);
	} catch (error) {
		res.status(404).send(error);
	}
});

app.get('/singlePost', async (req, res) => {
	try {
		const users = await Post.findOne({
			// finding ALL with a filter
			where: { id: 1 },

			include: [
				{
					model: Comment,
					as: 'All_Comments',
					attributes: [ 'the_comment' ]
				},
				{
					model: User,
					as: 'UserRef'
				}
			],

			raw: true
		});
		const data = {
			...users
		};
		console.log(users);
		res.json(users);
	} catch (error) {
		res.status(404).send(error);
	}
});

app.put('/addWorker', async (req, res) => {
	try {
		const project = await Project.findOne({ where: { id: 1 } });
		project.addWorkers(5);
		res.json('User Added');
	} catch (error) {
		res.status(404).send(error);
	}
});

app.get('/getUserProjects', async (req, res) => {
	try {
		const users = await User.findAll({
			include: [
				{
					model: Project,
					as: 'Tasks',
					attributes: [ 'title' ]
				}
			]
		});

		res.json(users);
	} catch (error) {
		console.log('TCL: error', error);
		res.status(404).send(error);
	}
});

connection
	.sync({
		logging: console.log()
		// force: true
	})
	// .then(async () => {
	// 	await seeder();
	// })
	.then(() => {
		console.log('Connection to Database created');
		app.listen(PORT, () => {
			console.log(`Running server on port ${PORT}`);
		});
	})
	.catch(() => console.log('Issue connectin to database'));

async function seeder() {
	try {
		const userId = await User.bulkCreate(_USERS);

		Post.bulkCreate([
			{
				userId: 1,
				title: 'First post',
				content: 'post content 1'
			},
			{
				userId: 2,
				title: 'Second post',
				content: 'post content 1'
			},
			{
				userId: 3,
				title: 'Third post',
				content: 'post content 1'
			},
			{
				userId: 4,
				title: 'Third post',
				content: 'post content 1'
			}
		])
			.then(async () => {
				const userId = await Comment.bulkCreate([
					{
						PostId: 2,
						the_comment: 'My First Comment'
					},
					{
						PostId: 1,
						the_comment: 'My First Comment'
					},
					{
						PostId: 3,
						the_comment: 'My First Comment'
					}
				]);
			})
			.then(async () => {
				const project = await Project.create({
					title: 'Project 1'
				});
				project.setWorkers([ 4, 5 ]);

				const project2 = await Project.create({
					title: 'Project 2 '
				});
				project.setWorkers([ 5 ]);
			});

		//
		// await User.bulkCreate(_USERS);
		console.log('Successfully inserted Dubby Data');
	} catch (error) {
		console.log(error.message);
	}
}
