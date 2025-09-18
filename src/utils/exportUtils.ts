import { StudyResult, CardSortResult, TreeTestResult, Study } from '../types';
import * as Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export interface ExportOptions {
  includeMetadata?: boolean;
  includeDemographics?: boolean;
  includeTimestamps?: boolean;
  includeAgreementScores?: boolean;
}

// Generate CSV data (existing functionality)
export const generateCSVData = (results: StudyResult[], study: Study, options: ExportOptions = {}): any[] => {
  const data: any[] = [];

  results.forEach(result => {
    const baseData = {
      participantId: result.participantId,
      studyId: result.studyId,
      studyType: result.studyType,
      studyName: study.name,
      ...(options.includeTimestamps && {
        startTime: new Date(result.startTime).toISOString(),
        completionTime: new Date(result.completionTime).toISOString(),
        duration: result.totalDuration
      }),
      ...(options.includeDemographics && result.demographics && {
        ...result.demographics
      })
    };

    if (['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(result.studyType)) {
      const cardSortResult = result as CardSortResult;
      cardSortResult.cardSortResults.forEach(category => {
        category.cards.forEach(card => {
          data.push({
            ...baseData,
            cardId: card.id,
            cardText: card.text,
            cardImageUrl: (card as any).image?.fileName || '',
            cardIcon: (card as any).icon?.name || '',
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            isCustomCategory: category.isCustomCategory || false,
          });
        });
      });
    } else if (result.studyType === 'tree-testing') {
      const treeTestResult = result as TreeTestResult;
      treeTestResult.treeTestResults.forEach(taskResult => {
        data.push({
          ...baseData,
          taskId: taskResult.taskId,
          task: taskResult.task,
          path: taskResult.path.join(' > '),
          success: taskResult.success,
          clicks: taskResult.clicks,
          taskDuration: taskResult.duration,
          finalDestination: taskResult.finalDestination,
          gaveUp: taskResult.gaveUp,
          directSuccess: taskResult.directSuccess,
        });
      });
    }
  });

  return data;
};

// Generate Excel workbook
export const generateExcelWorkbook = async (results: StudyResult[], study: Study, options: ExportOptions = {}): Promise<ExcelJS.Workbook> => {
  const wb = new ExcelJS.Workbook();

  // Study Overview Sheet
  const overviewSheet = wb.addWorksheet('Study Overview');

  // Add overview data
  overviewSheet.addRow(['Study Name', study.name]);
  overviewSheet.addRow(['Study ID', study.id]);
  overviewSheet.addRow(['Study Type', study.type]);
  overviewSheet.addRow(['Created Date', new Date(study.created).toLocaleDateString()]);
  overviewSheet.addRow(['Total Participants', results.length]);
  overviewSheet.addRow(['Description', study.description || '']);
  overviewSheet.addRow(['']);
  overviewSheet.addRow(['Participants Summary']);

  // Add header row
  const headerRow = overviewSheet.addRow(['Participant ID', 'Completion Time', 'Duration (ms)', 'Study Type']);
  headerRow.font = { bold: true };

  // Add participant data
  results.forEach(result => {
    overviewSheet.addRow([
      result.participantId,
      new Date(result.completionTime).toLocaleString(),
      result.totalDuration,
      result.studyType
    ]);
  });

  // Detailed Results Sheet
  const detailedData = generateCSVData(results, study, { ...options, includeTimestamps: true, includeDemographics: true });
  if (detailedData.length > 0) {
    const detailedSheet = wb.addWorksheet('Detailed Results');

    // Add headers
    const headers = Object.keys(detailedData[0]);
    const headerRow = detailedSheet.addRow(headers);
    headerRow.font = { bold: true };

    // Add data rows
    detailedData.forEach(row => {
      detailedSheet.addRow(headers.map(header => row[header]));
    });
  }

  // Card Sorting specific sheets
  const cardSortResults = results.filter(r =>
    ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(r.studyType)
  ) as CardSortResult[];

  if (cardSortResults.length > 0) {
    // Category Summary
    const categoryData: any[] = [];
    const categoryMap = new Map<string, { count: number; participants: Set<string> }>();

    cardSortResults.forEach(result => {
      result.cardSortResults.forEach(category => {
        const key = category.categoryName;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { count: 0, participants: new Set() });
        }
        const entry = categoryMap.get(key)!;
        entry.count += category.cards.length;
        entry.participants.add(result.participantId);
      });
    });

    categoryMap.forEach((data, categoryName) => {
      categoryData.push({
        'Category Name': categoryName,
        'Total Cards': data.count,
        'Used by Participants': data.participants.size,
        'Usage Percentage': Math.round((data.participants.size / cardSortResults.length) * 100)
      });
    });

    if (categoryData.length > 0) {
      const categorySheet = wb.addWorksheet('Category Analysis');

      // Add headers
      const headers = ['Category Name', 'Total Cards', 'Used by Participants', 'Usage Percentage'];
      const headerRow = categorySheet.addRow(headers);
      headerRow.font = { bold: true };

      // Add data
      categoryData.forEach(data => {
        categorySheet.addRow([
          data['Category Name'],
          data['Total Cards'],
          data['Used by Participants'],
          data['Usage Percentage']
        ]);
      });
    }
  }

  // Tree Testing specific sheets
  const treeTestResults = results.filter(r => r.studyType === 'tree-testing') as TreeTestResult[];

  if (treeTestResults.length > 0) {
    const taskData: any[] = [];
    const taskMap = new Map<string, { successes: number; totalAttempts: number; totalClicks: number; directSuccesses: number }>();

    treeTestResults.forEach(result => {
      result.treeTestResults.forEach(taskResult => {
        const key = taskResult.task;
        if (!taskMap.has(key)) {
          taskMap.set(key, { successes: 0, totalAttempts: 0, totalClicks: 0, directSuccesses: 0 });
        }
        const entry = taskMap.get(key)!;
        entry.totalAttempts++;
        if (taskResult.success) entry.successes++;
        if (taskResult.directSuccess) entry.directSuccesses++;
        entry.totalClicks += taskResult.clicks;
      });
    });

    taskMap.forEach((data, taskName) => {
      taskData.push({
        'Task': taskName,
        'Success Rate (%)': Math.round((data.successes / data.totalAttempts) * 100),
        'Direct Success Rate (%)': Math.round((data.directSuccesses / data.totalAttempts) * 100),
        'Average Clicks': Math.round(data.totalClicks / data.totalAttempts * 10) / 10,
        'Total Attempts': data.totalAttempts
      });
    });

    if (taskData.length > 0) {
      const taskSheet = wb.addWorksheet('Tree Test Analysis');

      // Add headers
      const headers = ['Task', 'Success Rate (%)', 'Direct Success Rate (%)', 'Average Clicks', 'Total Attempts'];
      const headerRow = taskSheet.addRow(headers);
      headerRow.font = { bold: true };

      // Add data
      taskData.forEach(data => {
        taskSheet.addRow([
          data['Task'],
          data['Success Rate (%)'],
          data['Direct Success Rate (%)'],
          data['Average Clicks'],
          data['Total Attempts']
        ]);
      });
    }
  }

  return wb;
};

// Generate PDF report
export const generatePDFReport = (results: StudyResult[], study: Study, _options: ExportOptions = {}): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('VUX-Sort Study Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(16);
  doc.text(study.name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Study Overview
  doc.setFontSize(14);
  doc.text('Study Overview', 20, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const overviewText = [
    `Study ID: ${study.id}`,
    `Study Type: ${study.type}`,
    `Created: ${new Date(study.created).toLocaleDateString()}`,
    `Total Participants: ${results.length}`,
    `Description: ${study.description || 'N/A'}`
  ];

  overviewText.forEach(text => {
    doc.text(text, 20, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Participant Summary Table
  if (results.length > 0) {
    const participantTableData = results.map(result => [
      result.participantId,
      new Date(result.completionTime).toLocaleDateString(),
      `${Math.round(result.totalDuration / 1000)}s`,
      result.studyType
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Participant ID', 'Completion Date', 'Duration', 'Study Type']],
      body: participantTableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Card Sorting Analysis
  const cardSortResults = results.filter(r =>
    ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(r.studyType)
  ) as CardSortResult[];

  if (cardSortResults.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Card Sorting Analysis', 20, yPosition);
    yPosition += 10;

    // Category frequency analysis
    const categoryMap = new Map<string, { count: number; participants: Set<string> }>();

    cardSortResults.forEach(result => {
      result.cardSortResults.forEach(category => {
        const key = category.categoryName;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, { count: 0, participants: new Set() });
        }
        const entry = categoryMap.get(key)!;
        entry.count += category.cards.length;
        entry.participants.add(result.participantId);
      });
    });

    const categoryTableData = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].participants.size - a[1].participants.size)
      .slice(0, 15) // Top 15 categories
      .map(([categoryName, data]) => [
        categoryName,
        data.count.toString(),
        data.participants.size.toString(),
        `${Math.round((data.participants.size / cardSortResults.length) * 100)}%`
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category Name', 'Total Cards', 'Used by Participants', 'Usage %']],
      body: categoryTableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Tree Testing Analysis
  const treeTestResults = results.filter(r => r.studyType === 'tree-testing') as TreeTestResult[];

  if (treeTestResults.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Tree Testing Analysis', 20, yPosition);
    yPosition += 10;

    const taskMap = new Map<string, { successes: number; totalAttempts: number; totalClicks: number; directSuccesses: number }>();

    treeTestResults.forEach(result => {
      result.treeTestResults.forEach(taskResult => {
        const key = taskResult.task;
        if (!taskMap.has(key)) {
          taskMap.set(key, { successes: 0, totalAttempts: 0, totalClicks: 0, directSuccesses: 0 });
        }
        const entry = taskMap.get(key)!;
        entry.totalAttempts++;
        if (taskResult.success) entry.successes++;
        if (taskResult.directSuccess) entry.directSuccesses++;
        entry.totalClicks += taskResult.clicks;
      });
    });

    const taskTableData = Array.from(taskMap.entries())
      .map(([taskName, data]) => [
        taskName.length > 30 ? taskName.substring(0, 30) + '...' : taskName,
        `${Math.round((data.successes / data.totalAttempts) * 100)}%`,
        `${Math.round((data.directSuccesses / data.totalAttempts) * 100)}%`,
        `${Math.round(data.totalClicks / data.totalAttempts * 10) / 10}`
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Task', 'Success Rate', 'Direct Success', 'Avg Clicks']],
      body: taskTableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Generated by VUX-Sort on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
};

// Enhanced export function
export const exportResults = async (
  results: StudyResult[],
  study: Study,
  format: ExportFormat = 'csv',
  options: ExportOptions = {}
): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `${study.name.replace(/\s+/g, '_')}_results_${timestamp}`;

  try {
    switch (format) {
      case 'csv': {
        const csvData = generateCSVData(results, study, options);
        const csvContent = Papa.unparse(csvData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${baseFilename}.csv`);
        break;
      }

      case 'json': {
        const jsonContent = JSON.stringify({
          study,
          results,
          exportOptions: options,
          exportedAt: new Date().toISOString()
        }, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        downloadBlob(blob, `${baseFilename}.json`);
        break;
      }

      case 'excel': {
        const workbook = await generateExcelWorkbook(results, study, options);
        const excelBuffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadBlob(blob, `${baseFilename}.xlsx`);
        break;
      }

      case 'pdf': {
        const pdf = generatePDFReport(results, study, options);
        pdf.save(`${baseFilename}.pdf`);
        break;
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export as ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function for downloading blobs
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};