import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';

import { EnsAddress } from '../../../classes/Address';
import { isUndefinedOrNullOrStringEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import { fromEth } from '../../../lib/conversion';
import AppState from '../../../state/app';
import TokenState from '../../../state/token';
import nuggThumbnailQuery from '../../../state/token/queries/nuggThumbnailQuery';
import swapHistoryQuery from '../../../state/token/queries/swapHistoryQuery';
import Web3State from '../../../state/web3';
import Button from '../../general/Buttons/Button/Button';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../general/Texts/Text/Text';
import TokenViewer from '../TokenViewer';

import styles from './ViewingNugg.styles';

type Props = {};

const ViewingNugg: FunctionComponent<Props> = () => {
    const tokenId = TokenState.select.tokenId();
    const address = Web3State.select.web3address();
    const [owner, setOwner] = useState('');
    const [swaps, setSwaps] = useState([]);

    const [items, setItems] = useState([tokenId]);

    useEffect(() => {
        setItems([items[1], tokenId]);
    }, [tokenId]);

    const getSwapHistory = useCallback(
        async (addToResult?: boolean, direction = 'asc') => {
            const history = await swapHistoryQuery(
                tokenId,
                direction,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                addToResult ? swaps.length : 0,
            );
            setSwaps((res) => (addToResult ? [...res, ...history] : history));
        },
        [swaps, tokenId],
    );

    const getThumbnail = useCallback(async () => {
        const thumbnail = await nuggThumbnailQuery(tokenId);
        setOwner(thumbnail?.user?.id);
    }, [tokenId]);

    useEffect(() => {
        setSwaps([]);
        setOwner('');
        getThumbnail();
        getSwapHistory();
    }, [tokenId]);

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) && (
            <div
                style={{
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: AppState.isMobile ? 'column' : 'row',
                }}>
                <Swaps swaps={swaps} />
                <div style={styles.container}>
                    <TokenViewer tokenId={tokenId} showLabel />

                    {owner === address ? (
                        <div style={{ display: 'flex' }}>
                            <Button
                                textStyle={styles.textWhite}
                                buttonStyle={{
                                    ...styles.button,
                                    background: Colors.gradient3Transparent,
                                }}
                                label="Burn"
                                onClick={() =>
                                    AppState.dispatch.setModalOpen({
                                        name: 'LoanOrBurn',
                                        modalData: {
                                            targetId: tokenId,
                                            type: 'Burn',
                                            backgroundStyle: {
                                                background: Colors.gradient3,
                                            },
                                        },
                                    })
                                }
                            />
                            <Button
                                textStyle={styles.textWhite}
                                buttonStyle={{
                                    ...styles.button,
                                    background: Colors.gradient3Transparent,
                                }}
                                label="Loan"
                                onClick={() =>
                                    AppState.dispatch.setModalOpen({
                                        name: 'LoanOrBurn',
                                        modalData: {
                                            targetId: tokenId,
                                            type: 'Loan',
                                            backgroundStyle: {
                                                background: Colors.gradient3,
                                            },
                                        },
                                    })
                                }
                            />
                            <Button
                                textStyle={styles.textWhite}
                                buttonStyle={{
                                    ...styles.button,
                                    background: Colors.gradient2Transparent,
                                }}
                                label="Sell"
                                onClick={() =>
                                    AppState.dispatch.setModalOpen({
                                        name: 'OfferOrSell',
                                        modalData: {
                                            targetId: tokenId,
                                            type: 'StartSale',
                                        },
                                    })
                                }
                            />
                        </div>
                    ) : (
                        <div style={styles.owner}>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.nuggBlueText,
                                }}>
                                {owner && 'Purchased by'}
                            </Text>
                            <Text textStyle={{ color: 'white' }}>
                                {owner && new EnsAddress(owner).short}
                            </Text>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

/* <Button */
//         textStyle={listStyle.textWhite}
//         buttonStyle={listStyle.renderButton}
//         label="Sell"
//         onClick={() =>
//             AppState.dispatch.setModalOpen({
//                 name: 'OfferOrSell',
//                 modalData: {
//                     targetId: item.id,
//                     type: 'StartSale',
//                     backgroundStyle: {
//                         background: Colors.gradient3,
//                     },
//                 },
//             })
//         }
//     />
//     <Button
//         textStyle={listStyle.textWhite}
//         buttonStyle={listStyle.renderButton}
//         label="Loan"
//         onClick={() =>
//             AppState.dispatch.setModalOpen({
//                 name: 'LoanOrBurn',
//                 modalData: {
//                     targetId: item.id,
//                     type: 'Loan',
//                     backgroundStyle: {
//                         background: Colors.gradient3,
//                     },
//                 },
//             })
//         }
//     />
//     <Button
//         textStyle={listStyle.textWhite}
//         buttonStyle={listStyle.renderButton}
//         label="Burn"
//         onClick={() =>
//             AppState.dispatch.setModalOpen({
//                 name: 'LoanOrBurn',
//                 modalData: {
//                     targetId: item.id,
//                     type: 'Burn',
//                     backgroundStyle: {
//                         background: Colors.gradient3,
//                     },
//                 },
//             })
//         }
//     />

const Swaps = ({ swaps }) => (
    <div style={styles.swaps}>
        {swaps.map((swap, index) => {
            const awaitingBid = swap.id.split('-')[1] === '0';
            return (
                <Button
                    buttonStyle={styles.owner}
                    key={index}
                    onClick={() => AppState.onRouteUpdate(`#/swap/${swap.id}`)}
                    rightIcon={
                        <>
                            <div
                                style={{
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    display: 'flex',
                                }}>
                                <Text>
                                    {awaitingBid
                                        ? 'Awaiting bid!'
                                        : `Swap ${swap.id.split('-')[1]}`}
                                </Text>
                                <CurrencyText
                                    image="eth"
                                    value={+fromEth(swap.eth)}
                                />
                            </div>
                            <div>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{
                                        color: Colors.nuggBlueText,
                                    }}>
                                    {awaitingBid
                                        ? 'On sale by'
                                        : 'Purchased from'}
                                </Text>
                                <Text
                                    textStyle={{
                                        color: 'white',
                                    }}>
                                    {new EnsAddress(swap.owner.id).short}
                                </Text>
                            </div>
                        </>
                    }
                />
            );
        })}
    </div>
);
export default React.memo(ViewingNugg);
