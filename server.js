import express from 'express';
import Sequelize from 'sequelize';

const app = express();
const PORT = 8001;

const connection = new Sequelize('db', 'user', 'password', {
	host: 'local',
	dialect: 'sqlite',
	storage: 'db.sqlite'
});

const User = connection.define('User', {
	userId: {
		type: Sequelize.UUID,
		primaryKey: true,
		defaultValue: Sequelize.UUIDV4
	},
	name: Sequelize.STRING,
	bio: Sequelize.TEXT
});

connection
	.sync({
		logging: console.log(),
		force: true
	})
	.then(() => {
		User.bulkCreate([ { name: 'John', bio: 'I am Him' }, { name: 'Jean', bio: 'I am also Him' } ]);
	})
	.then(() => {
		console.log('Connection to Database created');
		app.listen(PORT, () => {
			console.log(`Running server on port ${PORT}`);
		});
	})
	.catch(() => console.log('Issue connectin to database'));
