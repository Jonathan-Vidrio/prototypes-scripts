import axios from 'axios';
import { performance } from "node:perf_hooks";

async function updateStatusId(apiEndpoint: string, times: number = 10000): Promise<void> {
    try {
        let responseTimes = [];

        for (let i = 0; i < times; i++) {
            try {
                const newStatusId = Math.floor(Math.random() * 8) + 1;
                const startTime = performance.now();
                await axios.patch(`${apiEndpoint}/${i + 1}`, { StatusId: newStatusId });
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                responseTimes.push(responseTime);
            } catch (error) {
                console.error(`Error updating StatusId for book at endpoint: ${apiEndpoint}`, error);
            }
        }

        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const totalResponseTime = responseTimes.reduce((a, b) => a + b, 0);

        console.log(`StatusId updated successfully for books at endpoint: ${apiEndpoint}`);
        console.log(`Total response time: ${totalResponseTime} ms`);
        console.log(`Min response time: ${minResponseTime} ms`);
        console.log(`Max response time: ${maxResponseTime} ms`);
        console.log(`Average response time: ${avgResponseTime} ms`);

    } catch (err) {
        console.error(`Error updating StatusId for books at endpoint: ${apiEndpoint}`, err);
    }
}

const apiEndpoint = 'http://localhost:3000/book';

updateStatusId(apiEndpoint);