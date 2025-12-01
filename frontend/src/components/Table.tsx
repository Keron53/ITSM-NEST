import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    keyField?: keyof T;
}

const Table = <T extends { id: number | string }>({
    data,
    columns,
    onEdit,
    onDelete,
    onView
}: TableProps<T>) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {(onEdit || onDelete || onView) && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            {columns.map((col, index) => (
                                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {onView && (
                                            <button
                                                onClick={() => onView(item)}
                                                className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(item)}
                                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
