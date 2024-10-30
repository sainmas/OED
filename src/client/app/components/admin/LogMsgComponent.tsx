import * as React from 'react';
import { Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormGroup, Input, Label, Table } from 'reactstrap';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { useAppSelector } from '../../redux/reduxHooks';
import { selectSelectedLanguage } from '../../redux/slices/appStateSlice';
import { showWarnNotification } from '../../utils/notifications';
import { logsApi } from '../../utils/api';
// import translate from '../../utils/translate';

const initialLogs = [
	{
		id: 1,
		log_type: 'ERROR',
		// eslint-disable-next-line max-len
		log_message: 'Unhandled Promise Rejection: AggregateError Stacktrace: AggregateError [ECONNREFUSED]: at internalConnectMultiple (node:net:1118:18) at afterConnectMultiple (node:net:1685:7)',
		log_time: '2024-09-11 16:58:51.303'
	},
	{
		id: 2,
		log_type: 'ERROR',
		// eslint-disable-next-line max-len
		log_message: 'Unhandled Promise Rejection: AggregateError Stacktrace: AggregateError [ECONNREFUSED]: at internalConnectMultiple(node:net:1118:18) at afterConnectMultiple (node:net:1685:7)',
		log_time: '2024-09-11 16:59:12.524'
	},
	{
		id: 3,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "kg" to "kg"',
		log_time: '2024-09-12 17:35:29.953'
	},
	{
		id: 4,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "liter" to "liter"',
		log_time: '2024-09-12 17:35:29.954'
	},
	{
		id: 5,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "Fahrenheit" to "Fahrenheit"',
		log_time: '2024-09-12 17:35:29.954'
	},
	{
		id: 6,
		log_type: 'INFO',
		log_message: 'Schema created',
		log_time: '2024-10-01 21:53:13.505'
	},
	{
		id: 7,
		log_type: 'INFO',
		log_message: 'Listening on port 3000',
		log_time: '2024-10-01 21:53:35.09'
	},
	{
		id: 8,
		log_type: 'INFO',
		// eslint-disable-next-line max-len
		log_message: 'The uploaded file /usr/src/app/src/server/tmp/uploads/csvPipeline/2024-10-01_22:49:55.358-29ac-3yrLeap.csv was created to upload readings csv data',
		log_time: '2024-10-01 22:49:55.374'
	},
	{
		id: 9,
		log_type: 'ERROR',
		// eslint-disable-next-line max-len
		log_message: 'Unhandled Promise Rejection: AggregateError Stacktrace: AggregateError [ECONNREFUSED]: at internalConnectMultiple (node:net:1118:18) at afterConnectMultiple (node:net:1685:7)',
		log_time: '2024-09-11T16:58:51.303-04:00'
	},
	{
		id: 10,
		log_type: 'ERROR',
		// eslint-disable-next-line max-len
		log_message: 'Unhandled Promise Rejection: AggregateError Stacktrace: AggregateError [ECONNREFUSED]: at internalConnectMultiple(node:net:1118:18) at afterConnectMultiple (node:net:1685:7)',
		log_time: '2024-09-11T16:59:12.524-04:00'
	},
	{
		id: 11,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "kg" to "kg"',
		log_time: '2024-09-12T17:35:29.953+00:00'
	},
	{
		id: 12,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "liter" to "liter"',
		log_time: '2024-09-12T17:35:29.954+00:00'
	},
	{
		id: 13,
		log_type: 'WARN',
		log_message: 'Automatically set identifier of the unit "Fahrenheit" to "Fahrenheit"',
		log_time: '2024-09-12T17:35:29.954+00:00'
	},
	{
		id: 14,
		log_type: 'INFO',
		log_message: 'Schema created',
		log_time: '2024-10-01T21:53:13.505+00:00'
	},
	{
		id: 15,
		log_type: 'INFO',
		log_message: 'Listening on port 3000',
		log_time: '2024-10-01T21:53:35.090+00:00'
	},
	{
		id: 16,
		log_type: 'INFO',
		// eslint-disable-next-line max-len
		log_message: 'The uploaded file /usr/src/app/src/server/tmp/uploads/csvPipeline/2024-10-01_22:49:55.358-29ac-3yrLeap.csv was created to upload readings csv data',
		log_time: '2024-10-01T22:49:55.374+00:00'
	}
];

const logTypes = ['ERROR', 'INFO', 'WARN', 'SILENT'];

const LogMsgComponent = () => {
	const locale = useAppSelector(selectSelectedLanguage);
	const [logs, setLogs] = React.useState(initialLogs);

	// Button state to handle showing the log table
	const [showLogTable, setShowLogTable] = React.useState(false);

	const [selectedLogTypes, setSelectedLogTypes] = React.useState<string[]>(logTypes);
	const [dateSortOrder, setDateSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [logDateRange, setLogDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
	// Dropdown open state for log type in the header
	const [dropdownOpen, setDropdownOpen] = React.useState(false);

	// fetching logs data from server
	React.useEffect(() => {
		const fetchLogs = async () => {
			try {
				const data = await logsApi.getAllLogs();
				console.log('data: ', data);

			} catch (error) {
				console.error('Failed to fetch logs:', error);
			}
		};
		fetchLogs();
		console.log('fetching logs: ', fetchLogs);
	}, []);
	// Handle checkbox change
	const handleCheckboxChange = (logType: string) => {
		if (selectedLogTypes.includes(logType)) {
			// Remove log type if already selected
			setSelectedLogTypes(selectedLogTypes.filter(type => type !== logType));
		} else {
			// Add log type if not selected
			setSelectedLogTypes([...selectedLogTypes, logType]);
		}
	};

	const handleDateSort = () => {
		const newDateSortOrder = dateSortOrder === 'asc' ? 'desc' : 'asc';
		const sortedLogs = [...logs].sort((a, b) => {
			const dateA = new Date(a.log_time);
			const dateB = new Date(b.log_time);
			if (newDateSortOrder === 'asc') {
				return dateA.getTime() - dateB.getTime();
			} else {
				return dateB.getTime() - dateA.getTime();
			}
		});
		setDateSortOrder(newDateSortOrder);
		setLogs(sortedLogs);
	};

	const handleDateRangeChange = (range: [Date | null, Date | null]) => {
		setLogDateRange(range);
	};

	// Toggle dropdown in the header
	const onToggleDropdown = () => {
		setDropdownOpen(!dropdownOpen);
	};

	// Filter logs based on selected log types and date range
	const filteredLogs = logs.filter(log => {
		const logDate = new Date(log.log_time);

		// Check if log is within the selected date range
		const isWithinDateRange =
			(!logDateRange || !logDateRange[0] || logDate >= logDateRange[0]) &&
			(!logDateRange || !logDateRange[1] || logDate <= logDateRange[1]);

		return selectedLogTypes.includes(log.log_type) && isWithinDateRange;
	});

	const handleShowLogTable = () => {
		if (!logDateRange || !logDateRange[0] || !logDateRange[1]) {
			// showWarnNotification(translate('shifted.data.crosses.leap.year.to.non.leap.year'));
			showWarnNotification('You must select a date range');
		} else {
			setShowLogTable(true);
		}
	};

	return (
		showLogTable ?
			<>
				<h1 style={titleStyle}>Log Messages</h1>
				<FormGroup check inline style={logFilterStyle}>
					<p style={labelStyle}>Date Range:</p>
					<DateRangePicker
						value={logDateRange}
						onChange={handleDateRangeChange}
						minDate={new Date(1970, 0, 1)}
						maxDate={new Date()}
						locale={locale} // Formats Dates, and Calendar months base on locale
						calendarIcon={null}
						calendarProps={{ defaultView: 'year' }} />
				</FormGroup>
				<Table style={tableStyle} bordered hover responsive>
					<thead style={headerStyle}>
						<tr>
							<th>
								<Dropdown isOpen={dropdownOpen} toggle={onToggleDropdown}>
									<DropdownToggle caret>
										Log Type
									</DropdownToggle>
									<DropdownMenu>
										{logTypes.map(logType => (
											<DropdownItem key={logType} toggle={false}>
												<Label check>
													<Input
														type="checkbox"
														checked={selectedLogTypes.includes(logType)}
														onChange={() => handleCheckboxChange(logType)}
													/> {logType}
												</Label>
											</DropdownItem>
										))}
									</DropdownMenu>
								</Dropdown>
							</th>
							<th>Log Message</th>
							<th onClick={handleDateSort} style={{ cursor: 'pointer' }}>Log Time {dateSortOrder === 'asc' ? '↑' : '↓'}</th>
						</tr>
					</thead>
					<tbody style={bodyStyle}>
						{filteredLogs.map(log => (
							<tr key={log.id}>
								<td>{log.log_type}</td>
								<td>{log.log_message}</td>
								<td>{new Date(log.log_time).toLocaleString()}</td>
							</tr>
						))}
					</tbody>

				</Table>
			</>
			:

			<div className='container-fluid'>
				<div className='d-inline-flex flex-column align-items-center justify-content-center w-100'>
					<Alert style={{ textAlign: 'center' }}>Please choose log types and date range for log data</Alert>
					<div className='col-12 col-lg-6 border border-4 rounded p-4 vw-50'>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline' }}>
							<Dropdown style={{ display: 'block' }} isOpen={dropdownOpen} toggle={onToggleDropdown}>
								<DropdownToggle color='primary' caret>
									Log Type
								</DropdownToggle>
								<DropdownMenu>
									{logTypes.map(logType => (
										<DropdownItem key={logType} toggle={false}>
											<Label check>
												<Input
													type="checkbox"
													checked={selectedLogTypes.includes(logType)}
													onChange={() => handleCheckboxChange(logType)}
												/> {logType}
											</Label>
										</DropdownItem>
									))}
								</DropdownMenu>
							</Dropdown>
							<FormGroup check style={{ display: 'flex', alignItems: 'baseline' }}>
								<p style={{ fontWeight: 'bold' }}>Date Range:</p>
								<DateRangePicker
									value={logDateRange}
									onChange={handleDateRangeChange}
									minDate={new Date(1970, 0, 1)}
									maxDate={new Date()}
									locale={locale} // Formats Dates, and Calendar months base on locale
									calendarIcon={null}
									calendarProps={{ defaultView: 'year' }}
									required />

							</FormGroup>
						</div>
						<Button style={{ width: '70%' }} block color='primary' onClick={handleShowLogTable}>Show Log Messages</Button>



					</div>
				</div>
			</div >
	);
};

export default LogMsgComponent;

const headerStyle: React.CSSProperties = {
	textAlign: 'center'
};
const bodyStyle: React.CSSProperties = {
	textAlign: 'left'
};
const titleStyle: React.CSSProperties = {
	textAlign: 'center'
};

const tableStyle: React.CSSProperties = {
	width: '90%',
	margin: 'auto'
};

const logFilterStyle: React.CSSProperties = {
	display: 'flex',
	marginLeft: '9%',
	gap: '3%'
};

const labelStyle: React.CSSProperties = {
	fontWeight: 'bold',
	marginRight: '-2.5%',
	padding: 'none'
};