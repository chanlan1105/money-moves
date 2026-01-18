import { redirect } from 'next/navigation';

export default function App() {
    redirect('/expenses');

    return <p>Redirecting&hellip;</p>;
}



