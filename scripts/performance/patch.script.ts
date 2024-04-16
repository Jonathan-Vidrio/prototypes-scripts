import axios from 'axios';
import { performance, PerformanceObserver } from "perf_hooks";
import pidusage from 'pidusage';

interface PerformanceMetrics {
    maxCpu: number;
    minCpu: number;
    avgCpu: number;
    maxMemory: number;
    minMemory: number;
    avgMemory: number;
    totalDuration: number;
    eventLoopDelays: number[];
    detectedProblems: string[];
}

async function updateStatusId(apiEndpoint: string, times: number = 10000): Promise<PerformanceMetrics> {
    let cpuUsages: number[] = [];
    let memoryUsages: number[] = [];
    let durations: number[] = [];
    let eventLoopDelays: number[] = [];
    let detectedProblems: string[] = [];

    const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            eventLoopDelays.push(entry.duration);
        }
    });
    obs.observe({ entryTypes: ['function'], buffered: true });

    for (let i = 0; i < times; i++) {
        const startUsage = await pidusage(process.pid);
        const startTime = performance.now();
        try {
            const newStatusId = Math.floor(Math.random() * 8) + 1;
            await axios.patch(`${apiEndpoint}/${i + 1}`, { StatusId: newStatusId });
        } catch (error) {
            console.error(`Error updating StatusId for book at endpoint: ${apiEndpoint} on iteration ${i}`, error);
            detectedProblems.push(`Error on iteration ${i}: ${error}`);
        }
        const endTime = performance.now();
        const endUsage = await pidusage(process.pid);

        const cpuUsage = endUsage.cpu - startUsage.cpu;
        cpuUsages.push(cpuUsage > 0 ? cpuUsage : 0);
        memoryUsages.push(endUsage.memory / 1024 / 1024);
        durations.push(endTime - startTime);
    }

    obs.disconnect();

    return {
        maxCpu: Math.max(...cpuUsages),
        minCpu: Math.min(...cpuUsages),
        avgCpu: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
        maxMemory: Math.max(...memoryUsages),
        minMemory: Math.min(...memoryUsages),
        avgMemory: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
        totalDuration: durations.reduce((a, b) => a + b, 0),
        eventLoopDelays,
        detectedProblems
    };
}

const apiEndpoint = 'http://localhost:3000/book';

async function runTests() {
    console.log(`Testing status updates for books`);
    const metrics = await updateStatusId(apiEndpoint);
    console.log(`Results for book status updates:`, JSON.stringify(metrics, null, 2));
}

runTests();
