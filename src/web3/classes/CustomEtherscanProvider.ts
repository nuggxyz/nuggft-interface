/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BlockTag, TransactionResponse } from '@ethersproject/abstract-provider';
import { EtherscanProvider } from '@ethersproject/providers';

interface EtherscanTransactionResponse {
    blockNumber: string;
    timeStamp: string;
    hash: string;
    nonce: string;
    blockHash: string;
    transactionIndex: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    isError: string;
    txreceipt_status: string;
    input: string;
    contractAddress: string;
    cumulativeGasUsed: string;
    gasUsed: string;
    creates: string;
    confirmations: string;
    errorCode: string;
}

export class CustomEtherscanProvider extends EtherscanProvider {
    // async getEtherPrice(): Promise<number> {
    //     await this.getNetwork();

    //     const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${
    //         process.env.NUGG_APP_ETHERSCAN_KEY || ''
    //     }`;

    //     console.log(url);
    //     const response = await fetch(url, { method: 'GET' });

    //     console.log({ response });
    //     return 0;
    // }

    // Note: The `page` page parameter only allows pagination within the
    //       10,000 window available without a page and offset parameter
    //       Error: Result window is too large, PageNo x Offset size must
    //              be less than or equal to 10000
    async getHistory(
        addressOrName: string | Promise<string>,
        startBlock?: BlockTag,
        endBlock?: BlockTag,
    ): Promise<Array<TransactionResponse & { isError: boolean; errorCode: string | null }>> {
        const params = {
            action: 'txlist',
            address: await this.resolveName(addressOrName),
            startblock: startBlock == null ? 0 : startBlock,
            endblock: endBlock == null ? 99999999 : endBlock,
            sort: 'asc',
        };

        const result = (await this.fetch('account', params)) as Array<EtherscanTransactionResponse>;

        return result.map((tx) => {
            ['contractAddress' as const, 'to' as const].forEach(function (key) {
                if (tx[key] === '') {
                    delete tx[key];
                }
            });
            if (tx.creates == null && tx.contractAddress != null) {
                tx.creates = tx.contractAddress;
            }
            const item = this.formatter.transactionResponse(tx);

            Object.assign(item, {
                isError: Number(tx.isError) === 1,
                errorCode: tx.errorCode ?? null,
            });

            if (tx.timeStamp) {
                item.timestamp = parseInt(tx.timeStamp, 10);
            }

            return item as typeof item & { isError: boolean; errorCode: string | null };
        });
    }
}
