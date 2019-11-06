import express from 'express';
import Sequelize from 'sequelize';

const app = express();
const PORT = 8001;

const connection = new Sequelize('db', 'user', 'password', {
	host: 'local',
	dialect: 'sqlite',
	storage: 'db.sqlite'
});

connection
	.authenticate()
	.then(() => {
		console.log('Connection to Database created');
		app.listen(PORT, () => {
			console.log(`Running server on port ${PORT}`);
		});
	})
	.catch(() => console.log('Issue connectin to database'));
