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

async function deleteRecords(apiEndpoint: string, times: number = 10000): Promise<PerformanceMetrics> {
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

    for (let i = 1; i <= times; i++) {
        const startUsage = await pidusage(process.pid);
        const startTime = performance.now();
        try {
            await axios.delete(`${apiEndpoint}/${i}`);
        } catch (error) {
            console.error(`Error deleting record at ${apiEndpoint}/${i}: ${error}`);
            detectedProblems.push(`Error at iteration ${i}: ${error}`);
        }
        const endUsage = await pidusage(process.pid);
        const endTime = performance.now();

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
    console.log(`Testing deletion of records`);
    const metrics = await deleteRecords(apiEndpoint);
    console.log(`Results for deletions:`, JSON.stringify(metrics, null, 2));
}

runTests();
