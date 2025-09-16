import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Home, CheckCircle, ArrowLeft, Clock, Target } from 'lucide-react';
import { Study, TreeNode, TreeTestResult, TaskResult } from '../types';

interface TreeTestProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: TreeTestResult) => void;
}

const TreeTest: React.FC<TreeTestProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [currentPath, setCurrentPath] = useState<string[]>(['Home']);
  const [clickCount, setClickCount] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState(Date.now());
  const [completedTasks, setCompletedTasks] = useState<TaskResult[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const tasks = study.tasks || [];
  const currentTask = tasks[currentTaskIndex];
  const treeStructure = study.treeStructure || [];

  useEffect(() => {
    // Reset for new task
    if (currentTask) {
      setExpandedNodes(new Set([treeStructure[0]?.id].filter(Boolean)));
      setCurrentPath(['Home']);
      setClickCount(0);
      setTaskStartTime(Date.now());
      setSelectedNodeId(null);
    }
  }, [currentTaskIndex, treeStructure]);

  const findNodeById = (nodes: TreeNode[], id: number): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  };

  const buildPathToNode = (nodes: TreeNode[], targetId: number, path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const newPath = [...path, node.name];
      if (node.id === targetId) return newPath;
      
      const found = buildPathToNode(node.children, targetId, newPath);
      if (found) return found;
    }
    return null;
  };

  const handleNodeClick = (node: TreeNode) => {
    setClickCount(prev => prev + 1);
    setSelectedNodeId(node.id);

    if (node.children.length > 0) {
      // Toggle expansion for parent nodes
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    }

    // Update current path
    const pathToNode = buildPathToNode(treeStructure, node.id);
    if (pathToNode) {
      setCurrentPath(['Home', ...pathToNode]);
    }
  };

  const handleTaskComplete = (success: boolean, gaveUp: boolean = false) => {
    const taskDuration = Date.now() - taskStartTime;
    const selectedNode = selectedNodeId ? findNodeById(treeStructure, selectedNodeId) : null;
    
    // Check if this was a direct success (no backtracking)
    const directSuccess = success && clickCount <= currentPath.length;

    const taskResult: TaskResult = {
      taskId: currentTaskIndex,
      task: currentTask,
      path: [...currentPath],
      success,
      clicks: clickCount,
      duration: taskDuration,
      finalDestination: selectedNode?.name || currentPath[currentPath.length - 1],
      gaveUp,
      directSuccess
    };

    const newCompletedTasks = [...completedTasks, taskResult];
    setCompletedTasks(newCompletedTasks);

    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      // All tasks completed
      const result: TreeTestResult = {
        participantId,
        studyId: study.id,
        studyType: 'tree-testing',
        startTime: participantStartTime,
        completionTime: Date.now(),
        totalDuration: Date.now() - participantStartTime,
        treeTestResults: newCompletedTasks
      };
      
      onComplete(result);
    }
  };

  const goBack = () => {
    if (currentPath.length > 1) {
      setClickCount(prev => prev + 1);
      setCurrentPath(prev => prev.slice(0, -1));
      setSelectedNodeId(null);
    }
  };

  const renderTree = (nodes: TreeNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div
          onClick={() => handleNodeClick(node)}
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedNodeId === node.id
              ? 'bg-blue-100 border-2 border-blue-300 shadow-sm'
              : 'hover:bg-gray-50 border-2 border-transparent'
          }`}
          role="button"
          tabIndex={0}
          aria-label={`Navigate to ${node.name}`}
        >
          <div className="flex items-center space-x-2 flex-1">
            {node.children.length > 0 ? (
              expandedNodes.has(node.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )
            ) : (
              <div className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-gray-900 font-medium">{node.name}</span>
          </div>
          {node.children.length === 0 && (
            <Target className="w-4 h-4 text-blue-500" />
          )}
        </div>
        
        {expandedNodes.has(node.id) && node.children.length > 0 && (
          <div className="ml-6 mt-1 border-l-2 border-gray-200 pl-4">
            {renderTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Study Error</p>
          <p className="text-gray-600">This study has no tasks defined. Please contact the study administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{study.name}</h1>
              <p className="text-sm text-gray-600">Tree Testing Study</p>
            </div>
            <div className="text-sm text-gray-500 flex-shrink-0">
              Participant: <span className="font-medium">{participantId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  Task {currentTaskIndex + 1} of {tasks.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentTaskIndex) / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Your Task</h3>
                <p className="text-blue-800">{currentTask}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Clicks:
                  </span>
                  <span className="font-medium">{clickCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Time:
                  </span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - taskStartTime) / 1000)}s
                  </span>
                </div>
              </div>

              {/* Breadcrumb */}
              {study.settings.showBreadcrumbs && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Current Location:</div>
                  <div className="flex items-center space-x-1 text-sm bg-gray-50 p-2 rounded">
                    <Home className="w-4 h-4 text-gray-500" />
                    {currentPath.map((segment, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400" />}
                        <span className={index === currentPath.length - 1 ? 'font-medium text-gray-900' : 'text-gray-600'}>
                          {segment}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => handleTaskComplete(true)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Found It!</span>
                </button>

                <button
                  onClick={() => handleTaskComplete(false, true)}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Can't Find It
                </button>

                {study.settings.allowBacktracking && currentPath.length > 1 && (
                  <button
                    onClick={goBack}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>
                )}
              </div>

              {study.settings.timeLimit && (
                <div className="mt-4 text-xs text-gray-500 text-center">
                  Time limit: {study.settings.timeLimit} seconds
                </div>
              )}
            </div>
          </div>

          {/* Tree Structure Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-blue-600" />
                Website Structure
              </h3>
              
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {treeStructure.length > 0 ? (
                  <div className="space-y-1">
                    {renderTree(treeStructure)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No navigation structure available
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>💡 <strong>Tip:</strong> Click on items to navigate. Items with arrows have sub-items.</p>
                {selectedNodeId && (
                  <p className="mt-1 text-blue-600">Currently selected: <strong>{currentPath[currentPath.length - 1]}</strong></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeTest;