import { Table } from 'lucide-react';

interface ResultsTableProps {
  data: unknown;
}

export function ResultsTable({ data }: ResultsTableProps) {
  if (!data) return null;

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderData = () => {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return (
          <div className="text-center py-8 text-gray-500">
            No data to display
          </div>
        );
      }

      const keys = Object.keys(data[0]);
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {keys.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {keys.map((key) => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderValue(row[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {key}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {renderValue(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <pre className="text-left bg-gray-50 p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Table className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Results</h3>
          <p className="text-sm text-gray-600">Extracted data from document</p>
        </div>
      </div>
      {renderData()}
    </div>
  );
}
