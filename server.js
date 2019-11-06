import express from 'express';
import Sequelize from 'sequelize';

const app = express();
const PORT = 8001;

app.listen(PORT, () => {
	console.log(`Running server on port ${PORT}`);
});
