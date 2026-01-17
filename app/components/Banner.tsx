"use client";

import { Activity, useState } from "react";

export default function Banner() {
    const [visible, setVisible] = useState(false);

    return <>
        <button className="btn btn-neutral" onClick={function () {
            setVisible(!visible);
        }}>Show banner</button>

        <Activity mode={visible ? "visible" : "hidden"}>
            <div role="alert" className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>We are amazing at React!</span>
            </div>
        </Activity>
    </>;
}