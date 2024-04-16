import axios from 'axios';
import { performance } from 'perf_hooks';

async function deleteBooks(apiEndpoint: string, times: number = 10000): Promise<void> {
    try {
        let responseTimes = [];

        for (let i = 1; i <= times; i++) {
            try {
                const startTime = performance.now();
                await axios.delete(`${apiEndpoint}/${i}`);
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                responseTimes.push(responseTime);
            } catch (error) {
                console.error(`Error deleting book with id: ${i}`, error);
            }
        }

        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const totalResponseTime = responseTimes.reduce((a, b) => a + b, 0);

        console.log(`Books deleted successfully at endpoint: ${apiEndpoint}`);
        console.log(`Total response time: ${totalResponseTime} ms`);
        console.log(`Min response time: ${minResponseTime} ms`);
        console.log(`Max response time: ${maxResponseTime} ms`);
        console.log(`Average response time: ${avgResponseTime} ms`);

    } catch (err) {
        console.error(`Error deleting books at endpoint: ${apiEndpoint}`, err);
    }
}

const apiEndpoint = 'http://localhost:3000/book';

deleteBooks(apiEndpoint);