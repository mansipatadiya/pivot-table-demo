import { createRoot } from 'react-dom/client';
import './index.css';
import  React,{useEffect,useState} from 'react';
import { PivotViewComponent, Inject, FieldList, CalculatedField, Toolbar, PDFExport, ExcelExport, ConditionalFormatting, NumberFormatting, GroupingBar, VirtualScroll, DrillThrough, Grouping } from '@syncfusion/ej2-react-pivotview';
import axios from 'axios';

import { select, createElement, registerLicense } from '@syncfusion/ej2-base';
registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1NpRHxbf1x0ZFRMYV5bRnRPMyBoS35RckVqW3tecXVXRGJeUkd+');


function PivotToolbar() {
const [dataSourceSettings, setData] = useState(null);
const [UniversityData, setUniversityData] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:5000/api/details')
      .then(response => {
        setData(response?.data?.dataSourceSettings);
        setUniversityData(response?.data?.universityData)
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);
    let pivotObj;
    let toolbarOptions = ['New', 'Save', 'SaveAs', 'Rename', 'Remove', 'Load',
        'Grid', 'Chart', 'Export', 'SubTotal', 'GrandTotal', 'Formatting', 'FieldList'];
    function queryCellInfo(args) {
        if (args.cell && args.cell.classList.contains('e-valuescontent') && args.data && args.data[0].hasChild) {
            let pivotValues;
            let colIndex = Number(args.cell.getAttribute('data-colindex'));
            if (!isNaN(colIndex)) {
                pivotValues = pivotObj.pivotValues[args.data[colIndex].rowIndex][args.data[colIndex].colIndex];
            }
            if (pivotValues && args.cell && args.cell.classList.contains(pivotValues.cssClass)) {
                args.cell.classList.remove(pivotValues.cssClass);
                pivotValues.style = undefined;
            }
        }
    }
    function cellTemplate(args) {
        if (args.cellInfo && args.cellInfo.axis === 'row' && args.cellInfo.valueSort.axis === 'university') {
            let imgElement = createElement('img', {
                className: 'university-logo',
                attrs: {
                    'src': UniversityData[args.cellInfo.index[0]].logo,
                    'alt': args.cellInfo.formattedText + ' Image',
                    'width': '30',
                    'height': '30'
                },
            });
            let cellValue = select('.e-cellvalue', args.targetCell);
            cellValue.classList.add('e-hyperlinkcell');
            cellValue.addEventListener('click', hyperlinkCellClick.bind(pivotObj));
            args.targetCell.insertBefore(imgElement, cellValue);
        }
        return '';
    }
    function hyperlinkCellClick(args) {
        let cell = args.target.parentElement;
        let pivotValue = pivotObj.pivotValues[Number(cell.getAttribute('index'))][Number(cell.getAttribute('data-colindex'))];
        let link = UniversityData[pivotValue.index[0]].link;
        window.open(link, '_blank');
    }
    function saveReport(args) {
        let reports = [];
        let isSaved = false;
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            reports = JSON.parse(localStorage.pivotviewReports);
        }
        if (args.report && args.reportName && args.reportName !== '') {
            let report = JSON.parse(args.report);
            report.dataSourceSettings.dataSource = [];
            report.pivotValues = [];
            args.report = JSON.stringify(report);
            reports.map(function (item) {
                if (args.reportName === item.reportName) {
                    item.report = args.report;
                    isSaved = true;
                }
            });
            if (!isSaved) {
                reports.push(args);
            }
            localStorage.pivotviewReports = JSON.stringify(reports);
        }
    }
    function fetchReport(args) {
        let reportCollection = [];
        let reeportList = [];
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            reportCollection = JSON.parse(localStorage.pivotviewReports);
        }
        reportCollection.map(function (item) { reeportList.push(item.reportName); });
        args.reportName = reeportList;
    }
    function loadReport(args) {
        let reportCollection = [];
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            reportCollection = JSON.parse(localStorage.pivotviewReports);
        }
        reportCollection.map(function (item) {
            if (args.reportName === item.reportName) {
                args.report = item.report;
            }
        });
        if (args.report) {
            let report = JSON.parse(args.report);
            report.dataSourceSettings.dataSource =
                pivotObj.dataSourceSettings.dataSource;
            pivotObj.dataSourceSettings = report.dataSourceSettings;
        }
    }
    function removeReport(args) {
        let reportCollection = [];
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            reportCollection = JSON.parse(localStorage.pivotviewReports);
        }
        for (let i = 0; i < reportCollection.length; i++) {
            if (reportCollection[i].reportName === args.reportName) {
                reportCollection.splice(i, 1);
            }
        }
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            localStorage.pivotviewReports = JSON.stringify(reportCollection);
        }
    }
    function renameReport(args) {
        let reportsCollection = [];
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            reportsCollection = JSON.parse(localStorage.pivotviewReports);
        }
        if (args.isReportExists) {
            for (let i = 0; i < reportsCollection.length; i++) {
                if (reportsCollection[i].reportName === args.rename) {
                    reportsCollection.splice(i, 1);
                }
            }
        }
        reportsCollection.map(function (item) { if (args.reportName === item.reportName) {
            item.reportName = args.rename;
        } });
        if (localStorage.pivotviewReports && localStorage.pivotviewReports !== "") {
            localStorage.pivotviewReports = JSON.stringify(reportsCollection);
        }
    }
    function newReport() {
        pivotObj.setProperties({ dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, false);
    }
    function beforeToolbarRender(args) {
        args.customToolbar.splice(6, 0, {
            type: 'Separator'
        });
        args.customToolbar.splice(9, 0, {
            type: 'Separator'
        });
    }
    function chartOnLoad(args) {
        let selectedTheme = window.location.hash.split("/")[1];
        selectedTheme = selectedTheme ? selectedTheme : "Material";
        args.chart.theme = (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(/-dark/i, "Dark").replace(/contrast/i, 'Contrast').replace(/-highContrast/i, 'HighContrast');
    }
    function chartSeriesCreated(args) {
        pivotObj.chartSettings.chartSeries.legendShape = pivotObj.chartSettings.chartSeries.type === 'Polar' ? 'Rectangle' : 'SeriesType';
    }
    function excelQueryCellInfo(args) {
        if (args?.cell.axis === 'value' && args?.cell.value === undefined) {
            args.style.numberFormat = undefined;
        }
    }
    console.log("dataSourceSettings",dataSourceSettings);
    return ( dataSourceSettings ? <div className='control-pane'>
            <meta name="referrer" content="never"></meta>
            <div className='control-section' id='pivot-table-section' style={{ overflow: 'initial' }}>
                <div>
                    <PivotViewComponent id='PivotView' ref={(scope) => { pivotObj = scope; }} dataSourceSettings={dataSourceSettings} width={'100%'} height={'600'} showFieldList={true} exportAllPages={false} maxNodeLimitInMemberEditor={50} cellTemplate={cellTemplate.bind(this)} showGroupingBar={true} allowGrouping={true} enableVirtualization={true} enableValueSorting={true} allowDeferLayoutUpdate={true} allowDrillThrough={true} gridSettings={{
            columnWidth: 120, allowSelection: true, rowHeight: 36,
            selectionSettings: { mode: 'Cell', type: 'Multiple', cellSelectionMode: 'Box' },
            excelQueryCellInfo: excelQueryCellInfo.bind(this),
            queryCellInfo: queryCellInfo.bind(this)
        }} allowExcelExport={true} allowNumberFormatting={true} allowConditionalFormatting={true} allowPdfExport={true} showToolbar={true} allowCalculatedField={true} displayOption={{ view: 'Both' }} toolbar={toolbarOptions} newReport={newReport.bind(this)} renameReport={renameReport.bind(this)} removeReport={removeReport.bind(this)} loadReport={loadReport.bind(this)} fetchReport={fetchReport.bind(this)} saveReport={saveReport.bind(this)} toolbarRender={beforeToolbarRender.bind(this)} chartSettings={{ title: 'Top Universities Analysis', load: chartOnLoad.bind(this) }} chartSeriesCreated={chartSeriesCreated.bind(this)} enableFieldSearching={true}>
                        <Inject services={[FieldList, CalculatedField, Toolbar, PDFExport, ExcelExport, ConditionalFormatting, NumberFormatting, GroupingBar, Grouping, VirtualScroll, DrillThrough]}/>
                    </PivotViewComponent>
                </div>
                <div className='urllink'>
                    Source:
                    <a href="https://www.topuniversities.com/university-rankings?utm_source=topnav" target="_blank">QS World
                        University Rankings</a>
                </div>
            </div>

        </div>  : <div>Loading...........</div>);
}
export default PivotToolbar;

const root = createRoot(document.getElementById('sample'));
root.render(<PivotToolbar />);