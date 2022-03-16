import { BaseContract, ContractInterface } from 'ethers';
import { useMemo } from 'react';

import web3 from '@src/web3';
import { NuggftV1__factory } from '@src/typechain/factories/NuggftV1__factory';
import { Chain } from '@src/web3/core/interfaces';

import { NuggftV1 } from '../typechain/NuggftV1';

function useContract<C extends BaseContract>(address: string, abi: ContractInterface) {
    const provider = web3.hook.usePriorityProvider();

    return useMemo(() => {
        return new BaseContract(address, abi, provider?.getSigner()) as C;
    }, [address, provider, abi]);
}

export default function useNuggftV1() {
    const chainId = web3.hook.usePriorityChainId();

    const address = useMemo(() => {
        return web3.config.CONTRACTS[chainId ?? Chain.MAINNET].NuggftV1;
    }, [chainId]);

    return useContract<NuggftV1>(address, NuggftV1__factory.abi);
}

// export function getContractTransactions<C extends BaseContract>(contract: C) {
//     return (Object.keys(contract.functions) as GetContractFunctions<C>[]).reduce((prev, curr) => {
//         // eslint-disable-next-line react-hooks/rules-of-hooks
//         return { ...prev, [curr]: () => useContractTransaction<C>(contract, curr) };
//     }, {}) as { [key in GetContractFunctions<C>]: () => ReturnType<typeof useContractTransaction> };
// }

// export type Min<S extends string, ARGS> = {
//     functions: { [key in S]: (ContractFunction<infer ARGS> ? ARGS : never) };
// };
// export type TryGetFunc<F> = F extends Min<any, any> ? F['functions'] : never;

// export type GetContractFunctions<F> = F extends Min<infer C, any> ? C : never;

// function useContractTransaction<C extends BaseContract>(
//     contract: C,
//     frag: GetContractFunctions<C>,
// ) {
//     const [receipt, setReceipt] = useState<TransactionReceipt>();
//     const [response, setActiveResponse] = useState<TransactionResponse>();

//     const send = useCallback(
//         (...args: Parameters<TryGetFunc<C>[typeof frag]>) => {
//             if (!receipt) {
//                 void contract.functions[frag](args).then((x: TransactionResponse) => {
//                     setActiveResponse(x);
//                 });
//             }
//         },
//         [receipt],
//     );

//     useEffect(() => {
//         if (response) {
//             void contract.provider.waitForTransaction(response.hash).then((result) => {
//                 setReceipt(result);
//             });
//         }
//         return () => undefined;
//     }, [response]);

//     return { response, receipt, send };
// }
