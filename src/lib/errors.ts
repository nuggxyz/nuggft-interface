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

export default { parseJsonRpcError, RevertError, prettify };

export function prettify(
    caller: 'offer-modal' | 'general',
    input: Error | RevertError | undefined,
) {
    if (input === undefined) return 'no error';

    if (caller === 'general') {
        switch (input.message) {
            default:
                return `general error [${input.message}]`;
        }
    }

    switch (input.message) {
        case 'Revert(0x99)': // Error__0x99__InvalidEpoch
        case 'Revert(0xa0)': {
            return 'auction is over';
        }
        case 'Revert(0x72)': // Error__0x72__IncrementTooLow
        case 'Revert(0x71)': {
            return 'value too low';
        }
        default:
            return `offer-modal error [${input.message}]`;
    }
}
