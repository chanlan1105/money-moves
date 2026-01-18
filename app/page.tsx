import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/expenses');
}

import CategoryCreator from "./budget/CategoryCreator";
import CSVUpload from "./components/CSVUpload";

import Dock from "./components/Dock"; 



