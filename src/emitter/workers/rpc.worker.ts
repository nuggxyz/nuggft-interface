import type { Log } from '@ethersproject/abstract-provider';

import { InterfacedEvent } from '@src/interfaces/events';
import { InfuraWebSocketProvider } from '@src/web3/classes/CustomWebSocketProvider';
import type emitter from '@src/emitter';
import { Chain, DEFAULT_CONTRACTS } from '@src/web3/constants';
import { CustomEtherscanProvider } from '@src/web3/classes/CustomEtherscanProvider';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';
import { EmitEventNames } from '@src/emitter/interfaces';

// @ts-ignore
const ctx: Worker & {
	emitMessage: typeof emitter.emit;
} =
	// eslint-disable-next-line no-restricted-globals
	self as DedicatedWorkerGlobalScope;

// @ts-ignore
ctx.emitMessage = (event: EmitEventNames, data: object) =>
	ctx.postMessage.call(ctx, { type: event, ...data });

export default {} as typeof Worker & { new (): Worker };

console.log('[rpc.worker] Worker running');

let socket: InfuraWebSocketProvider;

const etherscan = new CustomEtherscanProvider(Chain.MAINNET);

let lastBlockTime: number = new Date().getTime();
let lastBlock = 0;

const blockListener = (log: number) => {
	if (lastBlock !== log) {
		console.log('block ', log);

		lastBlock = log;

		lastBlockTime = new Date().getTime();

		ctx.emitMessage(EmitEventNames.IncomingRpcBlock, {
			data: log,
		});

		if (lastBlock === 0 || log % 5 === 0) {
			void etherscan
				.getCustomEtherPrice()
				.then((price) => {
					ctx.emitMessage(EmitEventNames.IncomingEtherscanPrice, {
						data: price,
					});
				})
				.catch(() => {
					ctx.emitMessage(EmitEventNames.IncomingEtherscanPrice, {
						data: null,
					});
				});
		}
	}
};
const inter = NuggftV1__factory.createInterface();
const eventListener = (log: Log) => {
	try {
		const event = inter.parseLog(log) as unknown as InterfacedEvent;

		ctx.emitMessage(EmitEventNames.IncomingRpcEvent, {
			data: event,
			log,
		});
	} catch (e) {
		console.error(e);
	}
};

let lastBuild = 0;

const buildSocket = () => {
	if (socket && new Date().getTime() - lastBuild < 30000) {
		return;
	}

	lastBuild = new Date().getTime();

	if (socket) void socket.destroy();

	console.log('BUILDSOCKET');

	socket = new InfuraWebSocketProvider();
	void socket.getBlockNumber().then(blockListener);
	socket.on(
		{
			address: DEFAULT_CONTRACTS.NuggftV1,
			topics: [],
		},
		eventListener,
	);
	socket.on('block', blockListener);
};

buildSocket();

setInterval(() => {
	ctx.emitMessage(EmitEventNames.WorkerIsRunning, {
		label: 'rpc',
	});
	if (
		socket._websocket.readyState === socket._websocket.CLOSED ||
		new Date().getTime() - lastBlockTime > 30000
	) {
		buildSocket();
	}
}, 4000);

// ctx.addEventListener('message', ({ data }: MessageEvent<EmitEvents>) => {
//     console.log('HIIIIIIII', data);
//     if (
//         (data.type as EmitEventNames.V2Request) ===
//         ('worker.request.rpc.V2Request' as EmitEventNames.V2Request)
//     ) {
//         const { blocknum } = data as { blocknum: number };
//         console.log('socket.io: V2Request', socket);
//         void socket
//             .call({
//                 to: DEFAULT_CONTRACTS.NuggftV1,
//                 data: inter.encodeFunctionData('loop'),
//             })
//             .then((x) => {
//                 console.log('loop', x);
//                 rpcFormatter(x, blocknum);
//             });
//     }
// });

// setTimeout(() => {
//     socket._websocket.close();
// }, 3000);
