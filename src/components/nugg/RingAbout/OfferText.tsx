import React, { CSSProperties, useMemo } from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import useLifecycle from '@src/client/hooks/useLifecycle';

import styles from './RingAbout.styles';

const OfferText = ({ tokenId, textStyle }: { tokenId?: TokenId; textStyle?: CSSProperties }) => {
	const token = client.live.token(tokenId);
	const lifecycle = useLifecycle(tokenId);

	const hasBids = client.live.offers(tokenId).length !== 0;

	const text = useMemo(() => {
		if (!token || !lifecycle) return '';
		if (lifecycle === Lifecycle.Tryout && token.isItem()) {
			return t`${token.tryout.count} Nugg${token.tryout.count > 1 ? 's' : ''} ${
				token.tryout.count > 1 ? 'are' : 'is'
			} swapping`;
		}
		if (
			lifecycle === Lifecycle.Deck ||
			lifecycle === Lifecycle.Bat ||
			lifecycle === Lifecycle.Bunt
		) {
			return hasBids ? t`Highest offer` : t`Place the first offer!`;
		}
		if (lifecycle === Lifecycle.Bench || lifecycle === Lifecycle.Minors) {
			return t`Place offer to begin auction`;
		}
		if (lifecycle === Lifecycle.Shower) {
			return hasBids ? t`Winner` : t`This sale is over`;
		}
		return '';
	}, [token, hasBids, lifecycle]);

	return text ? (
		<Text
			textStyle={{
				...styles.title,
				...textStyle,
			}}
		>
			{text}
		</Text>
	) : (
		<></>
	);
};

// export const BuntOfferText = ({ tokenId }: { tokenId: TokenId }) => {
//     const token = client.live.token(tokenId);

//     const provider = web3.hook.usePriorityProvider();

//     // const vfo = useAsyncState(
//     //     () => {
//     //         if (token && provider && tokenId && lifecycle === Lifecycle.Bunt) {
//     //             return nuggft
//     //                 .connect(provider)
//     //                 ['vfo(address,uint24)'](Address.NULL.hash, tokenId.toRawId())
//     //                 .then((x) => {
//     //                     return new EthInt(x);
//     //                 });
//     //         }
//     //         return undefined;
//     //     },
//     //     [token, nuggft, tokenId, provider] as const,
//     //     // (prev, curr) => {
//     //     //     return !!(prev[0] && prev[1] && prev[2] && prev[3] && prev[3] === curr[3]);
//     //     // },
//     // );

//     const offers = client.live.offers(tokenId);

//     const leader = React.useMemo(() => {
//         return offers.first() as unknown as OfferData | undefined;
//     }, [offers]);

//     const leaderEns = web3.hook.usePriorityAnyENSName(
//         token && token.type === 'item' ? 'nugg' : provider,
//         leader?.account,
//     );
//     const swap = client.v2.useSwap(tokenId);
//     const potential = client.v3.useSwap(tokenId);
//     const minTryoutCurrency = client.usd.useUsdPair(
//         swap?.isItem()
//             ? swap.top
//             : potential
//             ? potential.min?.eth || MIN_SALE_PRICE
//             : MIN_SALE_PRICE,
//     );

//     const msp = client.stake.useMsp();

//     const leaderCurrency = client.usd.useUsdPair(
//         swap
//             ? swap.top.gt(0)
//                 ? swap.top
//                 : msp
//             : potential
//             ? potential.min?.eth.gt(0)
//                 ? potential.min?.eth
//                 : msp
//             : 0,
//     );

//     const currencyData = React.useMemo(() => {
//         if (potential && tokenId?.isNuggId() && !swap) {
//             return {
//                 currency: leaderCurrency,
//                 text: `seller`,
//                 user: leaderEns || potential.owner || '',
//             };
//         }
//         if (potential && potential.isItem()) {
//             return {
//                 currency: minTryoutCurrency,
//                 text: t`being sold by`,
//                 user: plural(potential.count, {
//                     1: '# nugg',
//                     other: '# nuggs',
//                 }),
//             };
//         }
//         if (!swap) return undefined;
//         return {
//             currency: leaderCurrency,
//             text: new EthInt(swap?.top || potential?.min?.eth || 0).number
//                 ? (swap?.numOffers || 0) > 1
//                     ? t`leader of ${swap?.numOffers || 0} bidders`
//                     : t`leader`
//                 : t`live`,
//             subtext:
//                 (swap?.numOffers || 0) !== 0 &&
//                 plural(swap?.numOffers || 0, {
//                     1: '# other bidder',
//                     other: '# other bidders',
//                 }),
//             user: leaderEns || swap.leader || t`minting`,
//         };
//     }, [leaderCurrency, minTryoutCurrency, leaderEns, swap, potential, tokenId]);

//     return (
//         <div
//             style={{
//                 alignItems: 'center',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 marginTop: '-40px',
//             }}
//         >
//             <Text textStyle={{ fontSize: '13px', color: 'white', marginTop: 5 }}>
//                 {t`${currencyData?.text} ${currencyData?.user}`}
//             </Text>
//         </div>
//     );
// };

export default OfferText;
