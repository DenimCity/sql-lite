import express from 'express';
import Sequelize from 'sequelize';
import _USERS from './user-data.json';

const app = express();
const PORT = 8001;

const connection = new Sequelize('db', 'user', 'password', {
	host: 'local',
	dialect: 'sqlite',
	storage: 'db.sqlite',
	define: {
		freezeTableName: true
	}
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

const OP = Sequelize.Op;

app.get('/findAll', async (req, res) => {
	try {
		const users = await User.findAll({
			// finding ALL with a filter
			where: {
				name: {
					[OP.like]: 'D%'
				}
			},
			raw: true
		});
		res.json(users);
	} catch (error) {
		res.status(404).send(error);
	}
});

app.get('/findById/:name', async (req, res) => {
	const { name } = req.params;

	try {
		const users = await User.findOne({
			where: { name }
		});
		res.json(users);
	} catch (error) {
		res.status(404).send(error);
	}
});

app.put('/update', async (req, res) => {
	User.update(
		{
			name: 'Michal Keaton',
			password: 'password'
		},
		{ where: { id: 8 }, returning: true }
	)
		.then((rows) => {
			res.send(rows);
		})
		.catch((error) => {
			res.status(404).send(error);
		});
});

app.delete('/remove', (req, res) => {
	User.destroy({ where: { id: 100 } })
		.then(() => {
			res.send('User Successfully Deleted');
		})
		.catch((error) => {
			res.status(404).send(error);
		});
});
app.post('/', async (req, res) => {
	const newUser = req.body.user;
	try {
		const user = await User.create(newUser);
		res.json(user);
	} catch (error) {
		res.status(404).send(error);
	}
});

connection
	.sync({
		logging: console.log(),
		force: true
	})
	.then(async () => {
		try {
			await User.bulkCreate(_USERS);
			console.log('Successfully inserted Dubby Data');
		} catch (error) {
			console.log(error);
		}
	})
	.then(() => {
		console.log('Connection to Database created');
		app.listen(PORT, () => {
			console.log(`Running server on port ${PORT}`);
		});
	})
	.catch(() => console.log('Issue connectin to database'));
