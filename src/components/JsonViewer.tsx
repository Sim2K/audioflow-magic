import React from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  level?: number;
  searchTerm?: string;
  itemsPerPage?: number;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  level = 0,
  searchTerm = '',
  itemsPerPage = 50
}) => {
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);
  const [expandAll, setExpandAll] = React.useState(true);
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(() => {
    // Initialize with all paths expanded
    const getAllInitialPaths = (obj: any, currentPath: string = ''): string[] => {
      if (typeof obj !== 'object' || obj === null) return [];
      
      // Always include the current path, even if empty
      let paths: string[] = currentPath ? [currentPath] : [''];
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
          paths.push(newPath);
          if (typeof item === 'object' && item !== null) {
            paths = [...paths, ...getAllInitialPaths(item, newPath)];
          }
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          paths.push(newPath);
          if (typeof value === 'object' && value !== null) {
            paths = [...paths, ...getAllInitialPaths(value, newPath)];
          }
        });
      }
      
      return paths;
    };

    return new Set(getAllInitialPaths(data));
  });
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [visibleItems, setVisibleItems] = React.useState<Record<string, number>>({});

  // Function to collect all possible paths in the data
  const getAllPaths = React.useCallback((obj: any, currentPath: string = ''): string[] => {
    if (typeof obj !== 'object' || obj === null) return [];
    
    // Always include the current path, even if empty
    let paths: string[] = currentPath ? [currentPath] : [''];
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
        paths.push(newPath);
        if (typeof item === 'object' && item !== null) {
          paths = [...paths, ...getAllPaths(item, newPath)];
        }
      });
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        paths.push(newPath);
        if (typeof value === 'object' && value !== null) {
          paths = [...paths, ...getAllPaths(value, newPath)];
        }
      });
    }
    
    return paths;
  }, []);

  // Get root level paths for collapse state
  const getRootPaths = React.useCallback((obj: any): string[] => {
    if (typeof obj !== 'object' || obj === null) return [];
    return ['', ...Object.keys(obj)]; // Include empty path for root
  }, []);

  const handleExpandAll = React.useCallback(() => {
    setExpandAll(true);
    setExpandedNodes(new Set());
  }, []);

  const handleCollapseAll = React.useCallback(() => {
    setExpandAll(false);
    setExpandedNodes(new Set());
  }, []);

  const toggleNode = React.useCallback((path: string) => {
    if (expandAll) {
      // When in expanded state, collapsing a node adds it to expandedNodes (marking it as collapsed)
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (!next.has(path)) {
          next.add(path);
        } else {
          next.delete(path);
        }
        return next;
      });
    } else {
      // When in collapsed state, expanding a node adds it to expandedNodes (marking it as expanded)
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (!next.has(path)) {
          next.add(path);
        } else {
          next.delete(path);
        }
        return next;
      });
    }
  }, [expandAll]);

  const handleExpand = React.useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      next.add(path);
      return next;
    });
  }, []);

  const handleCollapse = React.useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (searchTerm) {
      const paths = new Set<string>(['']); // Include empty path for root
      const searchInObject = (obj: any, currentPath: string = '') => {
        if (typeof obj === 'object' && obj !== null) {
          paths.add(currentPath);
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            if (
              key.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase()))
            ) {
              let parentPath = newPath.split('.');
              while (parentPath.length > 0) {
                paths.add(parentPath.join('.'));
                parentPath.pop();
              }
            }
            searchInObject(value, newPath);
          });
        }
      };
      searchInObject(data);
      setExpandedPaths(paths);
    } else {
      const paths = getAllPaths(data);
      setExpandedPaths(new Set(paths));
    }
  }, [data, searchTerm, getAllPaths]);

  const loadMoreItems = React.useCallback((path: string) => {
    setVisibleItems(prev => ({
      ...prev,
      [path]: (prev[path] || itemsPerPage) + itemsPerPage
    }));
  }, [itemsPerPage]);

  const renderLazyList = (items: any[], path: string) => {
    const currentVisible = visibleItems[path] || itemsPerPage;
    const visibleData = items.slice(0, currentVisible);
    const hasMore = currentVisible < items.length;

    return (
      <>
        {visibleData.map((item, index) => (
          <li key={index} className="text-base">
            {renderValue(item, undefined, `${path}[${index}]`)}
          </li>
        ))}
        {hasMore && (
          <li>
            <button
              onClick={() => loadMoreItems(path)}
              className="text-primary hover:text-primary/80 text-sm"
            >
              Load more ({items.length - currentVisible} remaining)
            </button>
          </li>
        )}
      </>
    );
  };

  const renderValue = (value: any, key?: string, path: string = ''): JSX.Element => {
    if (typeof value === 'object' && value !== null) {
      const hasChildren = Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0;
      const isNodeExpanded = expandedNodes.has(path);
      const shouldShowChildren = expandAll 
        ? !isNodeExpanded 
        : (path === '' || isNodeExpanded);

      if (Array.isArray(value)) {
        return (
          <div className="group">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(path);
                  }}
                  className="mr-2 text-muted-foreground hover:text-foreground"
                >
                  {shouldShowChildren ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
              {key && key !== 'title' && key !== 'theFlowTitle' && (
                <h3 className="text-lg font-medium capitalize mr-2">
                  {key.replace(/_/g, ' ')}
                </h3>
              )}
              <span className="text-muted-foreground">[{value.length} items]</span>
              {renderCopyButton(value, path)}
            </div>
            {shouldShowChildren && hasChildren && (
              <ul className="list-disc pl-6 space-y-2 py-2">
                {renderLazyList(value, path)}
              </ul>
            )}
          </div>
        );
      }

      return (
        <div className={cn("space-y-4", level > 0 && "pl-4 border-l-2 border-muted")}>
          <div className="group">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(path);
                  }}
                  className="mr-2 text-muted-foreground hover:text-foreground"
                >
                  {shouldShowChildren ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
              {key && key !== 'title' && key !== 'theFlowTitle' && (
                <h3 className={cn(
                  "text-lg font-medium capitalize",
                  key === 'summary' && "text-base text-muted-foreground"
                )}>
                  {key.replace(/_/g, ' ')}
                </h3>
              )}
              {(key === 'title' || key === 'theFlowTitle') && value.title && (
                <h3 className="text-xl font-semibold text-primary">
                  {value.title}
                </h3>
              )}
              {renderCopyButton(value, path)}
            </div>
            {shouldShowChildren && hasChildren && (
              <div className="mt-2">
                {Object.entries(value).map(([k, v]) => (
                  <div key={k} className="space-y-2">
                    {renderValue(v, k, path ? `${path}.${k}` : k)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (typeof value === 'string') {
      return (
        <div className={cn(
          "py-2 group",
          key === 'title' && "text-xl font-semibold text-primary",
          key === 'theFlowTitle' && "text-xl font-semibold text-primary",
          key === 'summary' && "text-base text-muted-foreground leading-relaxed",
        )}>
          {key && key !== 'title' && key !== 'theFlowTitle' && (
            <span className="font-medium mr-2">
              {key.replace(/_/g, ' ')}:
            </span>
          )}
          {highlightText(value)}
          {renderCopyButton(value, path)}
        </div>
      );
    }

    return (
      <div className="group">
        {key && key !== 'title' && key !== 'theFlowTitle' && (
          <span className="font-medium mr-2">
            {key.replace(/_/g, ' ')}:
          </span>
        )}
        {String(value)}
        {renderCopyButton(value, path)}
      </div>
    );
  };

  const handleCopy = async (value: any, path: string) => {
    const textToCopy = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    await navigator.clipboard.writeText(textToCopy);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const renderCopyButton = (value: any, path: string) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(value, path);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-muted rounded"
      title="Copy value"
    >
      {copiedPath === path ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={handleExpandAll}
            className={cn(
              "px-2 py-1 text-sm rounded hover:bg-muted",
              expandAll && "bg-muted"
            )}
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className={cn(
              "px-2 py-1 text-sm rounded hover:bg-muted",
              !expandAll && "bg-muted"
            )}
          >
            Collapse All
          </button>
        </div>
      </div>
      {renderValue(data, undefined, '')}
    </div>
  );
};

export default JsonViewer;
