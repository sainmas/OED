/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as React from 'react';
import * as moment from 'moment';
import {
	Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
	FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Pagination, PaginationItem, PaginationLink, Table
} from 'reactstrap';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { useAppSelector } from '../../redux/reduxHooks';
import { selectSelectedLanguage } from '../../redux/slices/appStateSlice';
import { showWarnNotification } from '../../utils/notifications';
import { logsApi } from '../../utils/api';
import translate from '../../utils/translate';
import { TimeInterval } from '../../../../common/TimeInterval';
import { dateRangeToTimeInterval, timeIntervalToDateRange } from '../../utils/dateRangeCompatibility';
import { Value } from '@wojtekmaj/react-daterange-picker/dist/cjs/shared/types';


// number of log messages to display per page
const PER_PAGE = 20;
// initialize log message array to hold log messages
const initialLogs: any[] = [];
// log types for filtering
const logTypes = ['ERROR', 'INFO', 'WARN', 'SILENT'];

/**
 * React component that defines the log message page
 * @returns LogMsgComponent element
 */
export default function LogMsgComponent() {
	const locale = useAppSelector(selectSelectedLanguage);

	// Log messages state
	const [logs, setLogs] = React.useState(initialLogs);
	// Selected log types for filtering in the update log
	const [selectedUpdateLogTypes, setSelectedUpdateLogTypes] = React.useState<string[]>(logTypes);
	// Dropdown open state for log type in the header for filtering
	const [typeTableDropdown, setTypeTableDropdown] = React.useState(false);
	// Selected log types for filtering in the table
	const [selectedTableLogTypes, setSelectedTableLogTypes] = React.useState<string[]>(logTypes);
	// Dropdown open state for log type in the table for filtering
	const [updateLogDropdown, setUpdateLogDropdown] = React.useState(false);
	// Sort order for date column in the table
	const [dateSortOrder, setDateSortOrder] = React.useState<'asc' | 'desc'>('asc');
	// Log messages date range state
	const [logDateRange, setLogDateRange] = React.useState<TimeInterval>(TimeInterval.unbounded());
	// Number of log messages to display
	const [logLimit, setLogLimit] = React.useState(0);
	// "Select All Logs" button state for update log
	const [selectAllUpdate, setSelectAllUpdate] = React.useState(true);
	// "Select All Logs" button state for table log
	const [selectAllTable, setSelectAllTable] = React.useState(true);
	// Current page state for pagination
	const [currentPage, setCurrentPage] = React.useState(1);
	// Modal state for displaying full log message
	const [modalOpen, setModalOpen] = React.useState(false);
	// Full log message to display in the modal
	const [modalLogMessage, setModalLogMessage] = React.useState('');
	// Showing all logs instead of paginated
	const [showAllLogs, setShowAllLogs] = React.useState(false);
	// Update button state
	const [buttonAvailable, setButtonAvailable] = React.useState(false);

	// Update the availability of the update button each time the selected log types, log limit, or date range changes
	React.useEffect(() => {
		setButtonAvailable(false);
	}, [selectedUpdateLogTypes, logLimit, logDateRange]);

	// Open modal with the full log message
	const handleLogMessageClick = (logMessage: string) => {
		setModalLogMessage(logMessage);
		setModalOpen(true);
	};

	// Handle checkbox change for log type in the table
	const handleTableCheckboxChange = (logType: string) => {
		if (selectedTableLogTypes.includes(logType)) { // Remove log type if already selected
			setSelectedTableLogTypes(selectedTableLogTypes.filter(type => type !== logType));
		} else { // Add log type if not selected
			setSelectedTableLogTypes([...selectedTableLogTypes, logType]);
		}
	};

	// Handle checkbox change for log type in the update log
	const handleUpdateCheckboxChange = (logType: string) => {
		if (selectedUpdateLogTypes.includes(logType)) {  // Remove log type if already selected
			setSelectedUpdateLogTypes(selectedUpdateLogTypes.filter(type => type !== logType));
		} else { // Add log type if not selected
			setSelectedUpdateLogTypes([...selectedUpdateLogTypes, logType]);
		}
	};

	// React effect to keep track of the "Select All" checkbox state
	React.useEffect(() => {
		selectedUpdateLogTypes.length === logTypes.length ? setSelectAllUpdate(true) : setSelectAllUpdate(false);
		selectedTableLogTypes.length === logTypes.length ? setSelectAllTable(true) : setSelectAllTable(false);
	}, [selectedUpdateLogTypes, selectedTableLogTypes]);

	// Handle "Select All" checkbox change in the table
	const handleTableSelectAll = () => {
		selectAllTable ? setSelectedTableLogTypes([]) : setSelectedTableLogTypes(logTypes);
		setSelectAllTable(!selectAllTable);
	};
	// Handle "Select All" checkbox change in the update log
	const handleUpdateSelectAll = () => {
		selectAllUpdate ? setSelectedUpdateLogTypes([]) : setSelectedUpdateLogTypes(logTypes);
		setSelectAllUpdate(!selectAllUpdate);
	};
	// Handle sorting of logs by date
	const handleDateSort = () => {
		const newDateSortOrder = dateSortOrder === 'asc' ? 'desc' : 'asc';
		const sortedLogs = [...logs].sort((a, b) => {
			const dateA = new Date(a.logTime);
			const dateB = new Date(b.logTime);

			if (newDateSortOrder === 'asc') {
				return dateA.getTime() - dateB.getTime();
			} else {
				return dateB.getTime() - dateA.getTime();
			}
		});
		setDateSortOrder(newDateSortOrder);
		setLogs(sortedLogs);
	};
	// Handle date range change
	const handleDateRangeChange = (range: Value) => {
		setLogDateRange(dateRangeToTimeInterval(range));
	};
	// Handle page change for pagination
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};
	// Toggle dropdown for type in the table
	const toggleTypeTable = () => {
		setTypeTableDropdown(!typeTableDropdown);
	};
	// Toggle dropdown for type in the update log
	const toggleUpdateLog = () => {
		setUpdateLogDropdown(!updateLogDropdown);
	};
	// Handle showing all logs instead of paginated
	const handleShowAllLogs = () => {
		setShowAllLogs(!showAllLogs);
	};

	// Filter logs based on selected log types and date range
	const filteredLogs = logs.filter(log => {
		const logDate = moment(log.logTime);
		// Check if log is within the selected date range
		const isWithinDateRange =
			(!logDateRange || !logDateRange.getIsBounded() || logDate >= logDateRange.getStartTimestamp()) &&
			(!logDateRange || !logDateRange.getIsBounded() || logDate <= logDateRange.getEndTimestamp());
		return selectedTableLogTypes.includes(log.logType) && isWithinDateRange;
	});

	// Paginate logs if not showing all logs
	const paginatedLogs = showAllLogs ? filteredLogs : filteredLogs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
	const totalPages = Math.ceil(filteredLogs.length / PER_PAGE);

	/**
	 * Handle showing the log table by fetching from the server
	 */
	async function handleShowLogTable() {
		// Number of logs being fetched must be between 1 and 1000
		if (!logLimit || logLimit < 1 || logLimit > 1000) {
			showWarnNotification(translate('log.limit.required'));
		} else {
			try {
				// get log by date and type
				const data = await logsApi.getLogsByDateRangeAndType(logDateRange, selectedUpdateLogTypes, logLimit.toString());
				setLogs(data);
				// reset pagination to first page after fetching new logs
				setCurrentPage(1);
				setButtonAvailable(true);
			} catch (error) {
				console.error(error);
			}
		}
	}

	return (
		<>
			<h1 style={titleStyle}>{translate('log.messages')}</h1>

			{/* Filter log messages by type, date range, and number of logs for fetching */}
			<div style={logFilterStyle}>
				<Dropdown isOpen={updateLogDropdown} toggle={toggleUpdateLog}>
					<DropdownToggle color='primary' caret>{translate('log.type')}</DropdownToggle>
					<DropdownMenu>
						<DropdownItem key='selectAll' toggle={false}>
							<Label check>
								<Input
									type="checkbox"
									checked={selectAllUpdate}
									onChange={handleUpdateSelectAll}
								/> {translate('select.all')}
							</Label>
						</DropdownItem>
						{logTypes.map(logType => (
							<DropdownItem key={logType} toggle={false}>
								<Label check>
									<Input
										type="checkbox"
										checked={selectedUpdateLogTypes.includes(logType)}
										onChange={() => handleUpdateCheckboxChange(logType)}
									/> {logType}
								</Label>
							</DropdownItem>
						))}
					</DropdownMenu>
				</Dropdown>
				<FormGroup style={{ padding: 0 }} check>
					<Label for="dateRange" style={{ fontWeight: 'bold', margin: '0' }}>
						{translate('date.range')}
					</Label>
					<DateRangePicker
						id="dateRange"
						value={timeIntervalToDateRange(logDateRange)}
						onChange={handleDateRangeChange}
						minDate={new Date(1970, 0, 1)}
						maxDate={new Date()}
						locale={locale} // Formats Dates, and Calendar months base on locale
						calendarIcon={null}
						calendarProps={{ defaultView: 'year' }} />
				</FormGroup>
				<FormGroup style={{ padding: 0 }} check>
					<Label for="logLimit" style={{ fontWeight: 'bold', margin: '0' }}>
						{translate('num.logs.display')}
					</Label>
					<Input
						id="logLimit"
						name="logLimit"
						placeholder={translate('from.1.to.1000')}
						type="number"
						onChange={e => setLogLimit(e.target.valueAsNumber)}
						invalid={logLimit < 1 || logLimit > 1000}
						value={logLimit}
					/>
				</FormGroup>
				<Button color='primary' disabled={buttonAvailable} onClick={handleShowLogTable}>{translate('log.msg.update')}</Button>
			</div>

			{/* Display log messages table */}
			{logs.length > 0 ?
				<Table style={tableStyle} bordered hover>
					<thead style={headerStyle}>
						<tr>
							<th>
								<Dropdown isOpen={typeTableDropdown} toggle={toggleTypeTable}>
									<DropdownToggle color='primary' caret>{translate('log.type')}</DropdownToggle>
									<DropdownMenu>
										<DropdownItem key='selectAll' toggle={false}>
											<Label check>
												<Input
													type="checkbox"
													checked={selectAllTable}
													onChange={handleTableSelectAll}
												/> {translate('select.all')}
											</Label>
										</DropdownItem>
										{logTypes.map(logType => (
											<DropdownItem key={logType} toggle={false}>
												<Label check>
													<Input
														type="checkbox"
														checked={selectedTableLogTypes.includes(logType)}
														onChange={() => handleTableCheckboxChange(logType)}
													/> {logType}
												</Label>
											</DropdownItem>
										))}
									</DropdownMenu>
								</Dropdown>
							</th>
							<th>{translate('log.message')}</th>
							<th onClick={handleDateSort} style={{ cursor: 'pointer' }}>{translate('log.time')} {dateSortOrder === 'asc' ? '↑' : '↓'}</th>
						</tr>
					</thead>
					<tbody style={bodyStyle}>
						{paginatedLogs.map((log, index) => (
							<tr key={index + 1}>
								<td>{log.logType}</td>
								<td
									style={{ cursor: 'pointer' }}
									onClick={() => handleLogMessageClick(log.logMessage)}
								>{log.logMessage.length > 80 ? `${log.logMessage.slice(0, 80)} ...` : log.logMessage}</td>
								<td>
									{new Date(log.logTime).toLocaleString('en-US', {
										year: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit',
										fractionalSecondDigits: 2
									})}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
				:
				<Alert style={{ textAlign: 'center', margin: '2% 25% 25%' }}>{translate('no.logs')}</Alert>
			}

			{/* pagination */}
			{!showAllLogs && logs.length !== 0 && <Pagination aria-label="Log pagination" style={{ justifyContent: 'center', margin: '1% auto' }}>
				<>
					<PaginationItem disabled={currentPage === 1}>
						<PaginationLink first onClick={() => handlePageChange(1)} />
					</PaginationItem><PaginationItem disabled={currentPage === 1}>
						<PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
					</PaginationItem>

					{Array.from({ length: totalPages }, (_, index) => (
						<PaginationItem key={index + 1} active={currentPage === index + 1}>
							<PaginationLink onClick={() => handlePageChange(index + 1)}>
								{index + 1}
							</PaginationLink>
						</PaginationItem>
					))}

					<PaginationItem disabled={currentPage === totalPages}>
						<PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
					</PaginationItem><PaginationItem disabled={currentPage === totalPages}>
						<PaginationLink last onClick={() => handlePageChange(totalPages)} />
					</PaginationItem>
				</>
			</Pagination >}

			{/* Show all logs or in pages button */}
			{logs.length > 0 && !showAllLogs &&
				<Button color='primary' style={{ margin: '0% 40% 1%' }} onClick={handleShowAllLogs}>Show All Logs ({filteredLogs.length})</Button>}
			{logs.length > 0 && showAllLogs &&
				<Button color='primary' style={{ margin: '0% 40% 1%' }} onClick={handleShowAllLogs}>Show in pages</Button>}

			{/* Modal for displaying full log message */}
			<Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered>
				<ModalHeader toggle={() => setModalOpen(!modalOpen)}>{translate('log.message')}</ModalHeader>
				<ModalBody>
					{modalLogMessage}
				</ModalBody>
			</Modal >
		</>
	);
}

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
	margin: '1% auto'
};

const logFilterStyle: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'center',
	gap: '1.5%',
	alignItems: 'center',
	margin: 'auto 25%',
	padding: '20px',
	border: '2px solid lightgrey'
};