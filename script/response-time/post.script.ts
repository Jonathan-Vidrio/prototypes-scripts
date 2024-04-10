import axios from 'axios';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { performance } from "node:perf_hooks";

async function insertData(apiEndpoint: string, filePath: string): Promise<void> {
    try {
        const data = await fsPromises.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);
        let responseTimes = [];

        for (const item of items) {
            try {
                const startTime = performance.now();
                await axios.post(apiEndpoint, item);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                responseTimes.push(responseTime);
            } catch (error) {
                console.error(`Error inserting register: ${item}`, error);
            }
        }

        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const totalResponseTime = responseTimes.reduce((a, b) => a + b, 0);

        console.log(`Data inserted successfully at endpoint: ${apiEndpoint}`);
        console.log(`Total response time: ${totalResponseTime} ms`);
        console.log(`Min response time: ${minResponseTime} ms`);
        console.log(`Max response time: ${maxResponseTime} ms`);
        console.log(`Average response time: ${avgResponseTime} ms\n\n`);

    } catch (err) {
        console.error(`Error reading file: ${filePath}`, err);
    }
}


const filePaths = {
    statuses: path.join(__dirname, '../..', 'json', 'statuses.json'),
    languages: path.join(__dirname, '../..', 'json', 'languages.json'),
    editorials: path.join(__dirname, '../..', 'json', 'editorials.json'),
    categories: path.join(__dirname, '../..', 'json', 'categories.json'),
    authors: path.join(__dirname, '../..', 'json', 'authors.json'),
    books: path.join(__dirname, '../..', 'json', 'books.json'),
};

const apiEndpoints = {
    statuses: 'http://localhost:3000/status/',
    languages: 'http://localhost:3000/language/',
    editorials: 'http://localhost:3000/editorial/',
    categories: 'http://localhost:3000/category/',
    authors: 'http://localhost:3000/author/',
    books: 'http://localhost:3000/book/',
};

insertData(apiEndpoints.books, filePaths.books);
