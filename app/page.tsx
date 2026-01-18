import Banner from "./components/Banner";
import CategoryCreator from "./components/CategoryCreator";
import CSVUpload from "./components/CSVUpload";

import Dock from "./components/Dock"; 


export default function Home() {

  

    return (
        <>
            <Banner />


            <CategoryCreator />
            <Dock />
            <CSVUpload />


        </>
    );
}
