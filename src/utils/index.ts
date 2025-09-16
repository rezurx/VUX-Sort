// Utility functions for VUX Sort
import { StudyResult, CardSortResult, TreeTestResult, Study } from '../types';
import * as Papa from 'papaparse';

export const generateCSV = (results: StudyResult[], study: Study): string => {
  const data: any[] = [];
  
  results.forEach(result => {
    if (['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(result.studyType)) {
      const cardSortResult = result as CardSortResult;
      cardSortResult.cardSortResults.forEach(category => {
        category.cards.forEach(card => {
          data.push({
            participantId: result.participantId,
            studyId: result.studyId,
            studyType: result.studyType,
            studyName: study.name,
            cardId: card.id,
            cardText: card.text,
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            isCustomCategory: category.isCustomCategory || false,
            startTime: new Date(result.startTime).toISOString(),
            completionTime: new Date(result.completionTime).toISOString(),
            duration: result.totalDuration
          });
        });
      });
    } else if (result.studyType === 'tree-testing') {
      const treeTestResult = result as TreeTestResult;
      treeTestResult.treeTestResults.forEach(taskResult => {
        data.push({
          participantId: result.participantId,
          studyId: result.studyId,
          studyType: result.studyType,
          studyName: study.name,
          taskId: taskResult.taskId,
          task: taskResult.task,
          path: taskResult.path.join(' > '),
          success: taskResult.success,
          clicks: taskResult.clicks,
          duration: taskResult.duration,
          finalDestination: taskResult.finalDestination,
          gaveUp: taskResult.gaveUp,
          directSuccess: taskResult.directSuccess,
          startTime: new Date(result.startTime).toISOString(),
          completionTime: new Date(result.completionTime).toISOString(),
          totalDuration: result.totalDuration
        });
      });
    }
  });
  
  return Papa.unparse(data);
};

export const exportResults = (results: StudyResult[], study: Study, format: 'csv' | 'json' = 'csv') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${study.name.replace(/\s+/g, '_')}_results_${timestamp}`;
  
  let content: string;
  let mimeType: string;
  let extension: string;
  
  if (format === 'csv') {
    content = generateCSV(results, study);
    mimeType = 'text/csv';
    extension = 'csv';
  } else {
    content = JSON.stringify({ study, results }, null, 2);
    mimeType = 'application/json';
    extension = 'json';
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateParticipantId = (): string => {
  return `P_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const clearLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(result.errors.map(e => e.message).join(', ')));
        } else {
          resolve(result.data);
        }
      },
      error: (error) => reject(error)
    });
  });
};