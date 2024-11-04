/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ApiBackend from './ApiBackend';
import { LogData } from '../../types/redux/logs';

export default class LogsApi {
	private readonly backend: ApiBackend;

	constructor(backend: ApiBackend) {
		this.backend = backend;
	}

	public async info(log: LogData): Promise<void> {
		return await this.backend.doPostRequest('/api/logs/info', log);
	}

	public async warn(log: LogData): Promise<void> {
		return await this.backend.doPostRequest('/api/logs/warn', log);
	}

	public async error(log: LogData): Promise<void> {
		return await this.backend.doPostRequest('/api/logs/error', log);
	}

	// fetch all logs
	public async getAllLogs(): Promise<LogData[]> {
		return await this.backend.doGetRequest('/api/logs/logsmsg');
	}

	public async getLogsByDateRangeAndType(startDate: string, endDate: string, types: string[]): Promise<LogData[]> {
		const requests = types.map(
			type => this.backend.doGetRequest('/api/logs/logsmsg/getLogsByDateRangeAndType',
				{ startDate: startDate, endDate: endDate, logType: type })
		);
		const results = await Promise.all(requests);

		return results.flat() as LogData[];
	}

}
