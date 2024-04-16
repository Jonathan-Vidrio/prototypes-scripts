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

async function performGetTest(apiEndpoint: string, numberOfTests: number = 30): Promise<PerformanceMetrics> {
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

    for (let i = 0; i < numberOfTests; i++) {
        const startUsage = await pidusage(process.pid);
        const startTime = performance.now();
        try {
            await axios.get(apiEndpoint);
        } catch (error) {
            console.error(`Error getting data from ${apiEndpoint} on test ${i+1}: ${error}`);
            detectedProblems.push(`Error at endpoint: ${apiEndpoint} on test ${i+1} - ${error}`);
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

const apiEndpoints = {
    statuses: 'http://localhost:3000/status/',
    languages: 'http://localhost:3000/language/',
    editorials: 'http://localhost:3000/category/',
    categories: 'http://localhost:3000/editorial/',
    authors: 'http://localhost:3000/author/',
    books: 'http://localhost:3000/book/',
};

async function runTests() {
    const types = ['statuses', 'languages', 'categories', 'editorials', 'authors', 'books'] as const;
    for (const type of types) {
        console.log(`Testing ${type}`);
        const metrics = await performGetTest(apiEndpoints[type as keyof typeof apiEndpoints], 30);
        console.log(`Results for ${type}:`, JSON.stringify(metrics, null, 2), '\n\n');
    }
}

runTests();

