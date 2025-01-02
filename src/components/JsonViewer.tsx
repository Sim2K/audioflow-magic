import React from 'react';
import { cn } from '@/lib/utils';

interface JsonViewerProps {
  data: any;
  level?: number;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, level = 0 }) => {
  const renderValue = (value: any, key?: string): JSX.Element => {
    if (typeof value === 'string') {
      return (
        <div className={cn(
          "py-2",
          key === 'title' && "text-xl font-semibold text-primary",
          key === 'summary' && "text-base text-muted-foreground leading-relaxed",
        )}>
          {value}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-6 space-y-2 py-2">
          {value.map((item, index) => (
            <li key={index} className="text-base">
              {renderValue(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className={cn(
          "space-y-4",
          level > 0 && "pl-4 border-l-2 border-muted"
        )}>
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="space-y-2">
              {k !== 'title' && k !== 'summary' && (
                <h3 className="text-lg font-medium capitalize">
                  {k.replace(/_/g, ' ')}
                </h3>
              )}
              {renderValue(v, k)}
            </div>
          ))}
        </div>
      );
    }

    return <div>{String(value)}</div>;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {renderValue(data)}
    </div>
  );
};

export default JsonViewer;
