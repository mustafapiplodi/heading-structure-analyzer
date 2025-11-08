import { useState } from 'react';
import type { HeadingNode } from '../types';
import IssueCard from './IssueCard';

interface HeadingTreeProps {
  hierarchy: HeadingNode;
}

interface TreeNodeProps {
  node: HeadingNode;
  depth?: number;
}

function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels

  // Skip rendering root node (level 0 is used for root)
  if ((node.level as number) === 0) {
    return (
      <div>
        {node.items.map((child, index) => (
          <TreeNode key={`${child.id}-${index}`} node={child} depth={depth} />
        ))}
      </div>
    );
  }

  const hasChildren = node.items.length > 0;
  const hasIssues = node.issues.length > 0;

  const getLevelColor = (level: number) => {
    const colors = [
      '', // 0 - not used
      'bg-red-100 border-red-300 text-red-900', // H1
      'bg-blue-100 border-blue-300 text-blue-900', // H2
      'bg-green-100 border-green-300 text-green-900', // H3
      'bg-yellow-100 border-yellow-300 text-yellow-900', // H4
      'bg-purple-100 border-purple-300 text-purple-900', // H5
      'bg-teal-100 border-teal-300 text-teal-900', // H6
    ];
    return colors[level] || 'bg-gray-100 border-gray-300 text-gray-900';
  };

  return (
    <div className="ml-6 my-2">
      <div
        className={`border-l-4 rounded-r-lg p-3 ${
          hasIssues ? 'border-red-500 bg-red-50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold border ${getLevelColor(
                    node.level
                  )}`}
                >
                  H{node.level}
                </span>
                <span className="font-medium text-gray-900">{node.text}</span>
                {hasIssues && (
                  <span className="text-red-600 text-sm font-semibold">
                    {node.issues.length} issue{node.issues.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Show issues for this heading */}
              {hasIssues && (
                <div className="mt-3 space-y-2">
                  {node.issues.map((issue, idx) => (
                    <IssueCard key={idx} issue={issue} />
                  ))}
                </div>
              )}

              {/* Show HTML preview in collapsed form */}
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  View HTML
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  <code>{node.html}</code>
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Render children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.items.map((child, index) => (
            <TreeNode key={`${child.id}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeadingTree({ hierarchy }: HeadingTreeProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Heading Hierarchy</h2>
      <div className="space-y-2">
        <TreeNode node={hierarchy} />
      </div>
    </div>
  );
}
