import axios from 'axios';
import { promises as fsPromises } from 'fs';
import path from 'path';
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

async function performTest(apiEndpoint: string, filePath: string): Promise<PerformanceMetrics> {
    try {
        const data = await fsPromises.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);
        let cpuUsages: number[] = [];
        let memoryUsages: number[] = [];
        let eventLoopDelays: number[] = [];
        let detectedProblems: string[] = [];

        const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                eventLoopDelays.push(entry.duration);
            }
        });
        obs.observe({entryTypes: ['function'], buffered: true});

        const startTime = performance.now();
        for (const item of items) {
            const startUsage = await pidusage(process.pid);
            try {
                await axios.post(apiEndpoint, item);
            } catch (error) {
                console.error(`Error posting data to ${apiEndpoint}: ${error}`);
                detectedProblems.push(`Error with item: ${JSON.stringify(item)} - ${error}`);
            }
            const endUsage = await pidusage(process.pid);
            const cpuDelta = endUsage.cpu - startUsage.cpu;
            cpuUsages.push(cpuDelta > 0 ? cpuDelta : 0);
            memoryUsages.push(endUsage.memory / 1024 / 1024);
        }
        const endTime = performance.now();
        obs.disconnect();

        return {
            maxCpu: Math.max(...cpuUsages),
            minCpu: Math.min(...cpuUsages),
            avgCpu: cpuUsages.reduce((a, b) => a + b, 0) / cpuUsages.length,
            maxMemory: Math.max(...memoryUsages),
            minMemory: Math.min(...memoryUsages),
            avgMemory: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
            totalDuration: (endTime - startTime),
            eventLoopDelays,
            detectedProblems
        };
    } catch (error) {
        console.error(`Error performing test: ${error}`);
        return {
            maxCpu: 0,
            minCpu: 0,
            avgCpu: 0,
            maxMemory: 0,
            minMemory: 0,
            avgMemory: 0,
            totalDuration: 0,
            eventLoopDelays: [],
            detectedProblems: []
        };
    }
}

const apiEndpoints = {
    statuses: 'http://localhost:3000/status/',
    languages: 'http://localhost:3000/language/',
    editorials: 'http://localhost:3000/editorial/',
    categories: 'http://localhost:3000/category/',
    authors: 'http://localhost:3000/author/',
    books: 'http://localhost:3000/book/',
};

const filePaths = {
    statuses: path.join(__dirname, '../..', 'json', 'statuses.json'),
    languages: path.join(__dirname, '../..', 'json', 'languages.json'),
    editorials: path.join(__dirname, '../..', 'json', 'editorials.json'),
    categories: path.join(__dirname, '../..', 'json', 'categories.json'),
    authors: path.join(__dirname, '../..', 'json', 'authors.json'),
    books: path.join(__dirname, '../..', 'json', 'books.json'),
};

async function runTests() {
    const types = ['statuses', 'languages', 'editorials', 'categories', 'authors', 'books'] as const;
    for (const type of types) {
        console.log(`Testing ${type}`);
        const metrics = await performTest(apiEndpoints[type as keyof typeof apiEndpoints], filePaths[type as keyof typeof filePaths]);
        console.log(`Results for ${type}:`, JSON.stringify(metrics, null, 2), '\n\n');
    }
}

runTests();