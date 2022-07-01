import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { Fraction } from '@src/classes/Fraction';
import lib from '@src/lib';
import { buildTokenIdFactory } from '@src/prototypes';
import { NuggftV1 } from '@src/typechain/NuggftV1';
import web3 from '@src/web3';
import { ADDRESS_ZERO, DEFAULT_CONTRACTS } from '@src/web3/constants';

export const nuggBackup = async (tokenId: NuggId, nuggft: NuggftV1, epoch: number) => {
	const rawId = tokenId.toRawIdNum();
	const agency = lib.parse.agency(await nuggft['agencyOf(uint24)'](rawId));

	const items = lib.parse
		.proof(await nuggft.proofOf(rawId))
		.map((x) => buildTokenIdFactory({ ...x, activeSwap: undefined }));

	if (agency.flag === 0x0) {
		if (
			rawId >= DEFAULT_CONTRACTS.MintOffset &&
			rawId < DEFAULT_CONTRACTS.PreMintTokens + DEFAULT_CONTRACTS.MintOffset
		) {
			agency.flag = 0x3;
		} else if (rawId === epoch) {
			agency.epoch = epoch;
			agency.flag = 0x3;
			agency.address = nuggft.address as AddressString;
		}
	}

	if (agency.flag === 0x0 && agency.address === ADDRESS_ZERO && rawId === epoch) {
		agency.flag = 0x3;
		agency.epoch = epoch;
		agency.address = nuggft.address as AddressString;
	}

	const owner =
		agency.flag === 0x0
			? (ADDRESS_ZERO as AddressString)
			: agency.flag === 0x3 && agency.epoch >= epoch
			? (nuggft.address as AddressString)
			: (agency.address as AddressString);

	const activeSwap =
		agency.flag === 0x3 && (agency.epoch >= epoch || agency.epoch === 0)
			? buildTokenIdFactory({
					tokenId,
					eth: agency.eth,
					leader: agency.address as AddressString,
					owner,
					endingEpoch: agency.epoch === 0 ? null : agency.epoch,
					num: Number(0),
					bottom: BigNumber.from(0),
					isBackup: true,
					listDataType: 'swap' as const,
					canceledEpoch: null,
					commitBlock: web3.config.calculateStartBlock(agency.epoch - 1),
					numOffers: 1,
					offers: [
						buildTokenIdFactory({
							eth: agency.eth,
							isBackup: true,
							sellingTokenId: null,
							tokenId,
							account: agency.address as AddressString,
							txhash: null,
							agencyEpoch: agency.epoch,
						}),
					],
			  })
			: undefined;

	console.log(agency, owner);

	return buildTokenIdFactory({
		tokenId,
		activeLoan: null,
		owner,
		items,
		pendingClaim: null,
		lastTransfer: null,
		swaps: [],
		activeSwap,
		isBackup: true,
		recent: null,
		_pickups: [],
		unclaimedOffers: [],
	});
};

export const itemBackup = async (tokenId: ItemId, nuggft: NuggftV1, epoch: number) => {
	const items = lib.parse.lastItemSwap(await nuggft.lastItemSwap(tokenId.toRawId()));

	const active = items.find((x) => x.endingEpoch === epoch || x.endingEpoch === epoch + 1);

	if (!active) return undefined;

	const agency = lib.parse.agency(
		await nuggft.itemAgency(active.tokenId.toRawId(), BigNumber.from(tokenId.toRawId())),
	);
	const check =
		agency.flag === 0x3
			? buildTokenIdFactory({
					tokenId,
					eth: agency.eth,
					leader: agency.addressAsBigNumber.toString().toNuggId(),
					nugg: nuggft.address,
					endingEpoch: agency.epoch === 0 ? null : agency.epoch,
					num: Number(0),
					bottom: BigNumber.from(0),
					isTryout: false,
					owner: 'nugg-0' as NuggId,
					count: 0,
					isBackup: true,
					listDataType: 'swap' as const,
					commitBlock: web3.config.calculateStartBlock(agency.epoch - 1),
					numOffers: 1,
					canceledEpoch: null,
					offers: [
						buildTokenIdFactory({
							eth: agency.eth,
							tokenId,
							sellingTokenId: 'nugg-0' as NuggId,
							isBackup: true,
							account: agency.addressAsBigNumber.toString().toNuggId(),
							txhash: null,
							agencyEpoch: agency.epoch,
						}),
					],
			  })
			: undefined;

	return buildTokenIdFactory({
		tokenId,
		...(check ? { activeSwap: check, swaps: [check] } : { activeSwap: undefined, swaps: [] }),
		activeSwap: check,
		count: 0,
		rarity: new Fraction(0),
		tryout: {
			count: 0,
			swaps: [],
		},
		isBackup: true,
	});
};

export const stakeBackup = async (nuggft: NuggftV1) => {
	return lib.parse.stake(await nuggft.stake());
};
