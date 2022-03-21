/* eslint-disable max-classes-per-file */

export type Revert = `Revert(${number | string})`;

export class RevertError extends Error {
    constructor(message: string, input: string) {
        if (input.startsWith('0x7e863b48')) {
            const code = `0x${input.slice(10)}`;
            super(`Revert(${code})`);
        } else {
            super(`Unknown(${message})`);
        }
    }
}

// eslint-disable-next-line import/prefer-default-export
export function parseJsonRpcError(input: unknown): Error | RevertError {
    if (input instanceof Error) {
        try {
            const { error } = JSON.parse(
                (input as unknown as { error: { body: string } }).error.body,
            ) as {
                error: {
                    data: string;
                    message: string;
                };
            };

            if (error.message === 'execution reverted') {
                return new RevertError(error.message, error.data);
            }
        } catch (err) {
            return input;
        }
    }
    return Error(input as string);
}

export default { parseJsonRpcError, RevertError };
