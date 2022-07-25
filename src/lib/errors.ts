/* eslint-disable max-classes-per-file */

export type Revert = `Revert(${number | string})`;

export class CustomErrorBase extends Error {
	_custom = true;
}

export class RejectionError extends CustomErrorBase {
	constructor() {
		super('Reject()');
	}
}

export class ReplacementTooLowError extends CustomErrorBase {
	constructor() {
		super('ReplacementTooLow()');
	}
}

export class InsufficientFundsError extends CustomErrorBase {
	constructor() {
		super('InsufficientFunds()');
	}
}

export class RevertError extends CustomErrorBase {
	constructor(message: string, input: string) {
		if (input.startsWith('0x7e863b48')) {
			const code = `0x${input.slice(10)}`;
			super(`Revert(${code})`);
		} else {
			super(`Unknown(${message})`);
		}
	}
}

export class CallRevertError extends CustomErrorBase {
	constructor(public method: string, public args: string, public address: string) {
		super(`CallRevert("${method}")`);
	}
}

export class EstimateError extends RevertError {}

export class NetworkError extends CustomErrorBase {
	constructor(public parent: Error) {
		super('NetworkError()');
	}
}

export type CustomError =
	| RejectionError
	| RevertError
	| InsufficientFundsError
	| CallRevertError
	| NetworkError;

export function parseJsonRpcError(input: unknown): Error | CustomError {
	if (input instanceof Error) {
		if (input.message === 'User rejected the transaction') {
			return new RejectionError();
		}

		try {
			const maybeCallError = input as unknown as {
				code?: 'CALL_EXCEPTION';
				method?: string;
				args?: string;
				address?: string;
			};

			if (
				maybeCallError?.code === 'CALL_EXCEPTION' &&
				maybeCallError?.method &&
				maybeCallError?.args &&
				maybeCallError?.address
			) {
				return new CallRevertError(
					maybeCallError.method,
					maybeCallError.args,
					maybeCallError.address,
				);
			}

			const parsed = input as unknown as string as unknown as {
				error:
					| { body: string }
					| {
							code: number;
							response: string;
					  };
			};
			// console.log({ parsed });

			const { error } = JSON.parse(
				// @ts-ignore
				// eslint-disable-next-line
				parsed.error?.body ?? parsed.error?.response ?? parsed,
			) as {
				error: {
					data: string;
					message: string;
					code?: string;
				};
			};
			console.log({ error });

			if (error.message === 'execution reverted') {
				return new RevertError(error.message, error.data);
			}

			if (error.message === 'replacement transaction underpriced') {
				return new ReplacementTooLowError();
			}

			if (error.message.startsWith('cannot estimate gas')) {
				return new RevertError(error.message, error.data);
			}

			if ((input as { code?: string })?.code === 'INSUFFICIENT_FUNDS') {
				return new InsufficientFundsError();
			}

			console.log({ error });
		} catch (err) {
			return input;
		}
	}
	return Error(input as string);
}

export default { parseJsonRpcError, RevertError, prettify };

export function prettify(
	caller: 'offer-modal' | 'general' | 'claim-modal' | 'sell-modal',
	input: Error | CustomError | undefined,
) {
	if (input === undefined) return 'no error';

	if (input instanceof InsufficientFundsError) {
		return 'buy more eth';
	}

	if (caller === 'general') {
		switch (input.message) {
			default:
				return `general error [${input.message}]`;
		}
	}

	switch (input.message) {
		case 'InsufficientFunds()':
			return 'buy more eth';

		case 'Revert(0x65)': // Error__0x99__TokenNotMintable --- offer modal
		case 'Revert(0x99)': // Error__0x99__InvalidEpoch
		case 'Revert(0xa4)': // Error__0xA4__ExpiredEpoch -- comes from the active swap
		case 'Revert(0xa0)': {
			return 'auction is over';
		}
		case 'Revert(0x72)': // Error__0x72__IncrementTooLow
		case 'Revert(0x71)':
		case 'Revert(0x70)': {
			// Error__0x70__FloorTooLow
			return 'value too low';
		}
		case 'Revert(0x77)': // Error__xNuggftV1__NotOwner
		case 'Revert(0xa3)': {
			return 'must claim nugg';
		}
		case 'Revert(0xa5)': {
			return 'invalid claim';
		}
		default:
			return `${caller} error [${input.message}]`;
	}
}
