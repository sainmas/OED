/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const express = require('express');
const { log } = require('../log');
const validate = require('jsonschema').validate;
const adminAuthenticator = require('./authenticator').adminAuthMiddleware;
const LogMsg = require('../models/LogMsg');
const { getConnection } = require('../db');

const router = express.Router();
router.use(adminAuthenticator('log API'));

const validLog = {
	type: 'object',
	required: ['message'],
	properties: {
		message: {
			type: 'string',
			minLength: 1
		}
	}
}

const validLogMsg = {
	type: 'object',
	required: ['startDate', 'endDate', 'logType'],
	properties: {
		startDate: {
			type: 'string',
			format: 'date-time'
		},
		endDate: {
			type: 'string',
			format: 'date-time'
		},
		logType: {
			type: 'string',
			enum: ['INFO', 'WARN', 'ERROR', 'SILENT']
		},

		// use this if later database is changed to be able to deal with logType as a list
		// logType: {
		// 	type: 'array',
		// 	items: {
		// 		type: 'string',
		// 		enum: ['INFO', 'WARN', 'ERROR', 'SILENT']
		// 	}
		// }
	}
}
router.post('/info', async (req, res) => {
	const validationResult = validate(req.body, validLog);
	if (validationResult.valid) {
		log.info(req.body.message);
		res.sendStatus(200);
	} else {
		log.error('invalid input from client logger');
		res.sendStatus(400);
	}
});

router.post('/warn', async (req, res) => {
	const validationResult = validate(req.body, validLog);
	if (validationResult.valid) {
		log.warn(req.body.message);
		res.sendStatus(200);
	} else {
		log.error('invalid input from client logger');
		res.sendStatus(400);
	}
});

router.post('/error', async (req, res) => {
	const validationResult = validate(req.body, validLog);
	if (validationResult.valid) {
		log.error(req.body.message);
		res.sendStatus(200);
	} else {
		log.error('invalid input from client logger');
		res.sendStatus(400);
	}
});


// router.get('/logsmsg', async (req, res) => {
// 	const conn = getConnection();
// 	try {
// 		const rows = await LogMsg.getAll(conn);
// 		res.json(rows);
// 	} catch (err) {
// 		console.error(`Failed to fetch in getAll: ${err}`);
// 		res.sendStatus(500);
// 	}
// });

router.get('/logsmsg/getLogsByDateRangeAndType', async (req, res) => {
	const validationResult = validate(req.query, validLogMsg);
	if (!validationResult.valid) {
		res.sendStatus(400);
	} else {
		const conn = getConnection();
		try {
			const rows = await LogMsg.getLogsByDateRangeAndType(req.query.startDate, req.query.endDate, req.query.logType, conn);
			res.json(rows);
		} catch (err) {
			console.error(`Failed to fetch logs filter by date range and type: ${err}`);
			res.sendStatus(500);
		}
	}
});

module.exports = router;
