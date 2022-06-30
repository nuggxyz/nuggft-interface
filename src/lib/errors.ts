/* eslint-disable max-classes-per-file */

// export type CustomError = RejectionError | RevertError;

export type Revert = `Revert(${number | string})`;

export class CustomErrorBase extends Error {
	_custom = true;
}

export class RejectionError extends CustomErrorBase {
	constructor() {
		super('Reject()');
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

export type CustomError = RejectionError | RevertError | InsufficientFundsError;

// eslint-disable-next-line import/prefer-default-export
export function parseJsonRpcError(input: unknown): Error | CustomError {
	if (input instanceof Error) {
		if (input.message === 'User rejected the transaction') {
			return new RejectionError();
		}
		try {
			const { error } = JSON.parse(
				(input as unknown as { error: { body: string } }).error.body,
			) as {
				error: {
					data: string;
					message: string;
					code?: string;
				};
			};

			if (error.message === 'execution reverted') {
				return new RevertError(error.message, error.data);
			}

			if ((input as { code?: string })?.code === 'INSUFFICIENT_FUNDS') {
				return new InsufficientFundsError();
			}
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
		case 'Revert(0x65)': // Error__0x99__TokenNotMintable --- offer modal
		case 'Revert(0x99)': // Error__0x99__InvalidEpoch
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
