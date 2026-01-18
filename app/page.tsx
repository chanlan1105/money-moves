import TransactionTable from "./components/ui/TransactionTable";

export default function Home() {
  const transactions = [
    {
      id: 1,
      date: "2024-01-15",
      category: "Groceries",
      description: "Whole Foods",
      amount: 52.45,
    },
    {
      id: 2,
      date: "2024-01-14",
      category: "Transport",
      description: "Gas",
      amount: 45.00,
    },
    {
      id: 3,
      date: "2024-01-13",
      category: "Entertainment",
      description: "Movie tickets",
      amount: 30.00,
    },
  ];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <TransactionTable transactions={transactions} />
    </main>
  );
}
