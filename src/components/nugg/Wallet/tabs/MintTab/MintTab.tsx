import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';

import { EthInt } from '../../../../../classes/Fraction';
import NuggFTHelper from '../../../../../contracts/NuggFTHelper';
import {
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
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

type Props = {};

const MintTab: FunctionComponent<Props> = () => {
    // const userShares = WalletState.select.userShares();

    const valuePerShare = ProtocolState.select.nuggftStakedEthPerShare();
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const loans = useAsyncState(
        () => loanedNuggsQuery(address, 'desc', '', 10000, 0),
        [address, epoch],
    );
    const sales = useAsyncState(
        () => myActiveSalesQuery(address, 'desc', '', 10000, 0),
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
                setMyNuggs((res) => [...res, ...nuggResult]);
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

    return (
        <div style={styles.container}>
            <div style={swapStyles.statisticContainer}>
                <TextStatistic
                    label="Nuggs"
                    value={'' + (myNuggs?.length || 0)}
                />
                <TextStatistic
                    label="Claims"
                    value={'' + (claims?.length || 0)}
                />
                <TextStatistic
                    label="Loans"
                    value={'' + (loans?.length || 0)}
                />
                <TextStatistic
                    label="Sales"
                    value={'' + (sales?.length || 0)}
                />
            </div>
            <div>
                <NumberStatistic
                    style={{ alignItems: 'center', width: '' }}
                    label="TVL"
                    value={new EthInt(`${+valuePerShare * myNuggs.length}`)}
                    image="eth"
                />
            </div>
            <Button
                buttonStyle={swapStyles.button}
                textStyle={{ color: Colors.nuggRedText }}
                label="Mint a nugg"
                onClick={() =>
                    NuggFTHelper.instance.minSharePrice().then((minPrice) =>
                        NuggFTHelper.instance
                            .mint(701, {
                                value: minPrice,
                            })
                            .then((_pendingtx) =>
                                TransactionState.dispatch.initiate({
                                    _pendingtx,
                                }),
                            ),
                    )
                }
            />
            {
                <List
                    labelStyle={styles.listLabel}
                    data={myNuggs}
                    RenderItem={React.memo(
                        RenderItem,
                        (prev, props) =>
                            JSON.stringify(prev.item) ===
                            JSON.stringify(props.item),
                    )}
                    label="My Nuggs"
                    loading={
                        loadingNuggs && isUndefinedOrNullOrArrayEmpty(myNuggs)
                    }
                    style={listStyle.list}
                    listEmptyStyle={listStyle.textWhite}
                    extraData={[address]}
                    listEmptyText="You don't have any Nuggs yet!"
                    loaderColor='white'
                />
            }
        </div>
    );
};

export default MintTab;

const RenderItem: FunctionComponent<
    ListRenderItemProps<NL.GraphQL.Fragments.General.Id>
> = ({ item, index, extraData }) => {
    console.log(item);
    return (
        !isUndefinedOrNullOrObjectEmpty(item) && (
            <div key={index} style={listStyle.render}>
                <div>
                    <Text textStyle={listStyle.renderTitle}>
                        Nugg #{item.id}
                    </Text>
                </div>
                <Button
                    textStyle={listStyle.textWhite}
                    buttonStyle={listStyle.renderButton}
                    label="Sell"
                    onClick={() =>
                        AppState.dispatch.setModalOpen({
                            name: 'OfferOrSell',
                            modalData: {
                                targetId: item.id,
                                type: 'StartSale',
                                backgroundStyle: {
                                    background: Colors.gradient3,
                                },
                            },
                        })
                    }
                />
                <Button
                    textStyle={listStyle.textWhite}
                    buttonStyle={listStyle.renderButton}
                    label="Loan"
                    onClick={() =>
                        AppState.dispatch.setModalOpen({
                            name: 'LoanOrBurn',
                            modalData: {
                                targetId: item.id,
                                type: 'Loan',
                                backgroundStyle: {
                                    background: Colors.gradient3,
                                },
                            },
                        })
                    }
                />
                <Button
                    textStyle={listStyle.textWhite}
                    buttonStyle={listStyle.renderButton}
                    label="Burn"
                    onClick={() =>
                        AppState.dispatch.setModalOpen({
                            name: 'LoanOrBurn',
                            modalData: {
                                targetId: item.id,
                                type: 'Burn',
                                backgroundStyle: {
                                    background: Colors.gradient3,
                                },
                            },
                        })
                    }
                />
            </div>
        )
    );
};
