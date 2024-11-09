import * as React from 'react';
import {
	Alert, Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
	FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Table
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

	// Button state to handle showing the log table
	const [showLogTable, setShowLogTable] = React.useState(false);

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

	// Filter logs based on selected log types and date range
	const filteredLogs = logs.filter(log => {
		const logDate = new Date(log.logTime);

		// Check if log is within the selected date range
		const isWithinDateRange =
			(!logDateRange || !logDateRange[0] || logDate >= logDateRange[0]) &&
			(!logDateRange || !logDateRange[1] || logDate <= logDateRange[1]);

		return selectedLogTypes.includes(log.logType) && isWithinDateRange;
	});

	const paginatedLogs = filteredLogs.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
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
				setShowLogTable(true);
				setCurrentPage(1);
			} catch (error) {
				console.error(error);
			}
		}
	}

	return (
		<>
			{showLogTable ?
				(<>
					<h1 style={titleStyle}>{translate('log.messages')}</h1>
					<FormGroup check inline style={logFilterStyle}>
						<Dropdown isOpen={dropdownOpen} toggle={onToggleDropdown}>
							<DropdownToggle caret>{translate('log.type')}</DropdownToggle>
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
						<div style={{ display: 'flex', gap: '2.5%' }}>
							<p style={labelStyle}>{translate('date.range')}</p>
							<DateRangePicker
								value={logDateRange}
								onChange={handleDateRangeChange}
								minDate={new Date(1970, 0, 1)}
								maxDate={new Date()}
								locale={locale} // Formats Dates, and Calendar months base on locale
								calendarIcon={null}
								calendarProps={{ defaultView: 'year' }} />
						</div>
						<FormGroup check>
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
							/>
						</FormGroup>
						<Button color='primary' onClick={handleShowLogTable}>{translate('refresh')}</Button>
					</FormGroup>
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
					<div style={{ textAlign: 'center', margin: '-1% auto 1% auto' }}>
						{Array.from({ length: totalPages }, (_, index) => (
							<Button
								key={index + 1}
								color={currentPage === index + 1 ? 'primary' : 'secondary'}
								onClick={() => handlePageChange(index + 1)}
								style={{ margin: '0 2px' }}
							>
								{index + 1}
							</Button>
						))}
					</div>
				</>)
				:
				(<div className='container-fluid'>
					<div className='d-inline-flex flex-column align-items-center justify-content-center w-100'>
						<Alert style={{ textAlign: 'center' }}>{translate('please.choose.log.limit.date.range')}</Alert>
						<div className='col-12 col-lg-6 border border-4 rounded p-4 vw-50'>
							<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
								<Dropdown isOpen={dropdownOpen} toggle={onToggleDropdown}>
									<DropdownToggle color='primary' caret>{translate('log.type')}</DropdownToggle>
									<DropdownMenu>
										<DropdownItem key='selectAll' toggle={false}>
											<Label check>
												<Input
													type="checkbox"
													checked={selectAll}
													onChange={handleSelectAllChange}
												/>{translate('select.all')}
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
								<FormGroup check>
									<Label for='logDate' style={{ fontWeight: 'bold', margin: '0' }}>
										{translate('date.range')}
									</Label>
									<DateRangePicker
										id='logDate'
										value={logDateRange}
										onChange={handleDateRangeChange}
										minDate={new Date(1970, 0, 1)}
										maxDate={new Date()}
										locale={locale} // Formats Dates, and Calendar months base on locale
										calendarIcon={null}
										calendarProps={{ defaultView: 'year' }}
										required />

								</FormGroup>
								<FormGroup check>
									<Label for="logLimit" style={{ fontWeight: 'bold', margin: '0' }}>
										{translate('num.logs.display')}
									</Label>
									<Input
										id="logLimit"
										name="logLimit"
										placeholder={translate('from.1.to.1000')}
										type="number"
										onChange={e => setLogLimit(e.target.valueAsNumber)}
										required
										invalid={logLimit < 1 || logLimit > 1000}
									/>
								</FormGroup>
							</div>
							<Button block color='primary' onClick={handleShowLogTable}>{translate('show.logs')}</Button>
						</div>
					</div>
				</div >)
			}

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
	margin: '2.5% auto'
};

const logFilterStyle: React.CSSProperties = {
	display: 'flex',
	marginLeft: '9%',
	gap: '1%',
	flexWrap: 'wrap',
	alignItems: 'center'
};

const labelStyle: React.CSSProperties = {
	fontWeight: 'bold',
	marginRight: '-2.5%',
	padding: 'none'
};