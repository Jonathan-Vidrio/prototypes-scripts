import axios from 'axios';
import { performance } from "node:perf_hooks";

async function getData(apiEndpoint: string, times: number = 30): Promise<void> {
    try {
        let responseTimes = [];

        for (let i = 0; i < times; i++) {
            try {
                const startTime = performance.now();
                await axios.get(apiEndpoint);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                responseTimes.push(responseTime);
            } catch (error) {
                console.error(`Error getting data from endpoint: ${apiEndpoint}`, error);
            }
        }

        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const totalResponseTime = responseTimes.reduce((a, b) => a + b, 0);

        console.log(`Data fetched successfully from endpoint: ${apiEndpoint}`);
        console.log(`Total response time: ${totalResponseTime} ms`);
        console.log(`Min response time: ${minResponseTime} ms`);
        console.log(`Max response time: ${maxResponseTime} ms`);
        console.log(`Average response time: ${avgResponseTime} ms\n\n`);

    } catch (err) {
        console.error(`Error fetching data from endpoint: ${apiEndpoint}`, err);
    }
}

const apiEndpoints = [
    //'http://localhost:3000/status/',
    //'http://localhost:3000/language/',
    //'http://localhost:3000/category/',
    //'http://localhost:3000/editorial/',
    //'http://localhost:3000/author/',
    'http://localhost:3000/book/',
];

apiEndpoints.forEach(endpoint => getData(endpoint));