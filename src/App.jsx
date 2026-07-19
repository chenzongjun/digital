import ReportConfigPage from './pages/report-config/ReportConfigPage';

const REPORT_MODES = new Set(['add', 'edit', 'detail', 'approval']);

const getReportMode = () => {
  const currentMode = new URLSearchParams(window.location.search).get('mode');

  return REPORT_MODES.has(currentMode) ? currentMode : 'edit';
};

const App = () => {
  return <ReportConfigPage mode={getReportMode()} />;
};

export default App;
