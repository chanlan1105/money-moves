'use client';

import React from 'react';

export interface Transaction {
  id?: string | number;
  category: string;
  date: string;
  amount: number;
  description: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    /* added dark:border-gray-700 and dark:bg-slate-900 */
    <div className="overflow-x-auto w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900">
      <table className="table w-full">
        {/* Added dark:bg-slate-800 and dark:text-gray-300 */}
        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        {/* Added dark:text-gray-200 */}
        <tbody className="text-gray-800 dark:text-gray-200">
          {transactions.map((transaction, index) => (
            /* Added dark:hover:bg-slate-800 */
            <tr key={transaction.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="font-medium">{transaction.date}</td>
              <td>
                {/* Added dark:border-gray-500 dark:text-gray-300 */}
                <span className="badge badge-outline badge-sm dark:border-gray-500 dark:text-gray-300">
                  {transaction.category}
                </span>
              </td>
              <td className="text-gray-600 dark:text-gray-400">{transaction.description}</td>
              <td className="text-right font-mono font-semibold">
                ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;