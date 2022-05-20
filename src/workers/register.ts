export const worker: Worker = new Worker(new URL('./main.worker.ts', import.meta.url));

worker.postMessage({
    question: 'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
});

worker.onmessage = ({ data }) => {
    console.log('[APP] ', data);
};

console.log('[App] MyWorker instance:', worker);
