import * as React from 'react';
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

const PER_PAGE = 20;
const initialLogs: any[] = [];
const logTypes = ['ERROR', 'INFO', 'WARN', 'SILENT'];

/**
 * React component that defines the log message page
 * @returns LogMsgComponent element
 */
export default function LogMsgComponent() {
	const locale = useAppSelector(selectSelectedLanguage);
	const [logs, setLogs] = React.useState(initialLogs);

	const [selectedLogTypes, setSelectedLogTypes] = React.useState<string[]>(logTypes);
	const [dateSortOrder, setDateSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [logDateRange, setLogDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
	// Dropdown open state for log type in the header
	const [dropdownOpen, setDropdownOpen] = React.useState(false);

	// number of log messages to display
	const [logLimit, setLogLimit] = React.useState(0);
	const [selectAll, setSelectAll] = React.useState(true);

	const [currentPage, setCurrentPage] = React.useState(1);

	const [modalOpen, setModalOpen] = React.useState(false);
	const [modalLogMessage, setModalLogMessage] = React.useState('');

	const [showAllLogs, setShowAllLogs] = React.useState(false);

	// Open modal with the full log message
	const handleLogMessageClick = (logMessage: string) => {
		setModalLogMessage(logMessage);
		setModalOpen(true);
	};

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

	// Handle "Select All" checkbox change
	const handleSelectAllChange = () => {
		if (selectAll) {
			setSelectedLogTypes([]);
		} else {
			setSelectedLogTypes(logTypes);
		}
		setSelectAll(!selectAll);
	};

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

	const handleDateRangeChange = (range: [Date | null, Date | null]) => {
		setLogDateRange(range);
	};

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage);
	};

	// Toggle dropdown in the header
	const onToggleDropdown = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleShowAllLogs = () => {
		setShowAllLogs(!showAllLogs);
	};

	// Filter logs based on selected log types and date range
	const filteredLogs = logs.filter(log => {
		const logDate = new Date(log.logTime);

		// Check if log is within the selected date range
		const isWithinDateRange =
			(!logDateRange || !logDateRange[0] || logDate >= logDateRange[0]) &&
			(!logDateRange || !logDateRange[1] || logDate <= logDateRange[1]);

		return selectedLogTypes.includes(log.logType) && isWithinDateRange;
	});

	const paginatedLogs = showAllLogs ? filteredLogs : filteredLogs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
	const totalPages = Math.ceil(filteredLogs.length / PER_PAGE);

	/**
	 * Handle showing the log table
	 */
	async function handleShowLogTable() {
		if (!logDateRange || !logDateRange[0] || !logDateRange[1]) {
			showWarnNotification('You must select a date range');
		} else if (!logLimit || logLimit < 1 || logLimit > 1000) {
			showWarnNotification('You must enter a valid number of logs to display');
		} else {
			try {
				// get log by date and type
				const data = await logsApi.getLogsByDateRangeAndType(
					logDateRange[0].toISOString(), logDateRange[1].toISOString(), selectedLogTypes, logLimit.toString());
				setLogs(data);
				// setShowLogTable(true);
				setCurrentPage(1);
			} catch (error) {
				console.error(error);
			}
		}
	}

	return (
		<>
			<h1 style={titleStyle}>{translate('log.messages')}</h1>
			<div style={logFilterStyle}>
				<Dropdown isOpen={dropdownOpen} toggle={onToggleDropdown}>
					<DropdownToggle color='primary' caret>{translate('log.type')}</DropdownToggle>
					<DropdownMenu>
						<DropdownItem key='selectAll' toggle={false}>
							<Label check>
								<Input
									type="checkbox"
									checked={selectAll}
									onChange={handleSelectAllChange}
								/> {translate('select.all')}
							</Label>
						</DropdownItem>
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
				<FormGroup style={{ padding: 0 }} check>
					<Label for="dateRange" style={{ fontWeight: 'bold', margin: '0' }}>
						{translate('date.range')}
					</Label>
					<DateRangePicker
						id="dateRange"
						value={logDateRange}
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
				<Button color='primary' onClick={handleShowLogTable}>{translate('log.msg.update')}</Button>
			</div>

			{logs.length > 0 ?
				<Table style={tableStyle} bordered hover>
					<thead style={headerStyle}>
						<tr>
							<th>{translate('log.type')}</th>
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
				<Alert style={{ textAlign: 'center', margin: '2% 25% 25%' }}>{translate('no.logs')}</Alert>}

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

			{logs.length > 0 && !showAllLogs &&
				<Button color='primary' style={{ margin: '0% 40% 1%' }} onClick={handleShowAllLogs}>Show All Logs ({filteredLogs.length})</Button>}
			{logs.length > 0 && showAllLogs &&
				<Button color='primary' style={{ margin: '0% 40% 1%' }} onClick={handleShowAllLogs}>Show in pages</Button>}

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
	gap: '1%',
	alignItems: 'center',
	margin: 'auto 25%',
	padding: '20px',
	border: '2px solid lightgrey'
};