import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import gql from 'graphql-tag';
import { Promise } from 'bluebird';

import { EthInt } from '../../../../../classes/Fraction';
import NuggFTHelper from '../../../../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    toGwei,
} from '../../../../../lib';
import constants from '../../../../../lib/constants';
import ProtocolState from '../../../../../state/protocol';
import TransactionState from '../../../../../state/transaction';
import WalletState from '../../../../../state/wallet';
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import NuggListRenderItem from '../../../NuggDex/NuggDexSearchList/components/NuggListRenderItem';
import NumberStatistic from '../../../Statistics/NumberStatistic';
import TextStatistic from '../../../Statistics/TextStatistic';
import swapStyles from '../SwapTab.styles';
import listStyle from '../HistoryTab.styles';
import Text from '../../../../general/Texts/Text/Text';
import Colors from '../../../../../lib/colors';
import AppState from '../../../../../state/app';
import LinkAccountButton from '../../../../general/Buttons/LinkAccountButton/LinkAccountButton';
import styles from '../Tabs.styles';
import useAsyncState from '../../../../../hooks/useAsyncState';
import loanedNuggsQuery from '../../../../../state/wallet/queries/loanedNuggsQuery';
import myActiveSalesQuery from '../../../../../state/wallet/queries/myActiveSalesQuery';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import TokenViewer from '../../../TokenViewer';
import { executeQuery } from '../../../../../graphql/helpers';
import InfiniteList from '../../../../general/List/InfiniteList';

type Props = {};

const MintTab: FunctionComponent<Props> = () => {
    const userShares = WalletState.select.userShares();
    // const [images, setImages] = useState([]);
    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const loans = useAsyncState(
        () => loanedNuggsQuery(address, 'desc', '', 1000, 0),
        [address, epoch],
    );
    const sales = useAsyncState(
        () => myActiveSalesQuery(address, 'desc', '', 1000, 0),
        [address, epoch],
    );

    const claims = useAsyncState(
        () => unclaimedOffersQuery(address, epoch?.id),
        [address, epoch],
    );

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await myNuggsQuery(
                address,
                'desc',
                '',
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                myNuggs.length,
            );

            if (!isUndefinedOrNullOrArrayEmpty(nuggResult)) {
                const ids = nuggResult.map((nugg) => nugg.id);
                setMyNuggs((res) => [...res, ...ids]);
            }
        } else {
            setMyNuggs([]);
        }
        setLoadingNuggs(false);
    }, [address, epoch, myNuggs]);

    useEffect(() => {
        setLoadingNuggs(true);
        setTimeout(() => {
            getMyNuggs();
        }, 500);
    }, [address]);

    // useEffect(() => {
    //     const get = async () => {
    //         const list = myNuggs.slice(images.length);
    //         if (list.length > 0) {
    //             const newNuggs = await Promise.map(list, (nugg) =>
    //                 NuggFTHelper.optimizedDotNugg(nugg),
    //             );
    //             setImages((old) => [...old, ...newNuggs]);
    //         }
    //     };
    //     (myNuggs.length !== images.length ||
    //         (myNuggs.length !== 0 && images.length === 0)) &&
    //         get();
    // }, [myNuggs, images]);

    return (
        <div style={styles.container}>
            {AppState.isMobile && <LinkAccountButton />}
            <div style={{ margin: '.5rem' }}>
                <div>
                    <NumberStatistic
                        style={{
                            alignItems: 'center',
                            width: '',
                            margin: '0rem',
                        }}
                        label="TVL"
                        value={new EthInt(`${+valuePerShare * userShares}`)}
                        image="eth"
                    />
                </div>
                <div style={swapStyles.statisticContainer}>
                    <TextStatistic
                        label="Nuggs"
                        value={'' + (userShares || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                    <TextStatistic
                        label="Claims"
                        value={'' + (claims?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                    <TextStatistic
                        label="Sales"
                        value={'' + (sales?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                    <TextStatistic
                        label="Loans"
                        value={'' + (loans?.length || 0)}
                        style={{
                            width: '23%',
                            marginLeft: '0rem',
                            marginRight: '0rem',
                        }}
                    />
                </div>
            </div>
            <Button
                buttonStyle={swapStyles.button}
                textStyle={{ color: Colors.nuggRedText }}
                label="Mint a Nugg"
                onClick={() =>
                    NuggFTHelper.instance
                        .connect(Web3State.getLibraryOrProvider())
                        .minSharePrice()
                        .then((minPrice) =>
                            executeQuery(
                                gql`
                                    {
                                        nuggs(
                                            where: {
                                                idnum_gt: ${constants.PRE_MINT_STARTING_EPOCH}
                                                idnum_lt: ${constants.PRE_MINT_ENDING_EPOCH}
                                            }
                                            first: 1
                                            orderDirection: desc
                                            orderBy: idnum
                                        ) {
                                            idnum
                                        }
                                    }
                                `,
                                'nuggs',
                            ).then((res) => {
                                res &&
                                    res[0].idnum &&
                                    +res[0].idnum + 1 <
                                        constants.PRE_MINT_ENDING_EPOCH &&
                                    NuggFTHelper.instance
                                        .connect(
                                            Web3State.getLibraryOrProvider(),
                                        )
                                        .mint(+res[0].idnum + 1, {
                                            value: minPrice,
                                            gasLimit: 81000,
                                        })
                                        .then((_pendingtx) =>
                                            TransactionState.dispatch.initiate({
                                                _pendingtx,
                                            }),
                                        );
                            }),
                        )
                        .catch((e) => console.log(e))
                }
            />
            <InfiniteList
                labelStyle={styles.listLabel}
                data={myNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                label="My Nuggs"
                loading={loadingNuggs}
                style={listStyle.list}
                listEmptyStyle={listStyle.textWhite}
                // extraData={[images]}
                listEmptyText="You don't have any Nuggs yet!"
                loaderColor="white"
                onScrollEnd={getMyNuggs}
                itemHeight={108}
            />
        </div>
    );
};

export default MintTab;

const RenderItem: FunctionComponent<ListRenderItemProps<string>> = React.memo(
    ({ item, extraData, style, index }) => {
        return (
            !isUndefinedOrNullOrStringEmpty(item) && (
                <Button
                    key={JSON.stringify(item)}
                    onClick={() => AppState.onRouteUpdate(`#/nugg/${item}`)}
                    buttonStyle={{ ...styles.listNuggButton, ...style }}
                    rightIcon={
                        <>
                            <TokenViewer
                                tokenId={item || ''}
                                style={styles.listNugg}
                                // data={extraData[0][index]}
                            />

                            <Text textStyle={{ color: Colors.nuggRedText }}>
                                Nugg #{item || ''}
                            </Text>
                        </>
                    }
                />
            )
        );
    },
    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
);
