import csv from "csvtojson";
import { GoogleGenAI } from "@google/genai";


const jsonArray = await csv({
    noheader: true,
    headers: ["date", "detail", "amount", "payment"]
}).fromFile("./dev/cibc.csv");

const categories = [
    "Groceries",
    "Dining",
    "Education",
    "Entertainment",
    "Transportation",
    "Healthcare",
    "Uncategorized",
];



const ai = new GoogleGenAI({ apiKey: "" });

async function callGemini(prompt: string) {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text;
}

/*
const transactions = jsonArray.map(row => row.detail).join("\n");




const annotated = jsonArray.map(async row => {
    return { ...row, category: await callGemini("Categorize transaction details individually using only one of these categories: Groceries, Dining, Education, Entertainment, Transportation, Healthcare, Uncategorized.\n\nDetail: \"STARBUCKS 12345 VANCOUVER BC\"\n\nReturn only the single category name (exactly one of the options).") };
});

console.log(jsonArray);

*/