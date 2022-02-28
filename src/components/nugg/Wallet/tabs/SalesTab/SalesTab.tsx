import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import ProtocolState from '@src/state/protocol';
import WalletState from '@src/state/wallet';
import Text from '@src/components/general/Texts/Text/Text';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import listStyles from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import myActiveSalesQuery from '@src/state/wallet/queries/myActiveSalesQuery';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import TransactionState from '@src/state/transaction';
import TokenViewer from '@src/components/nugg/TokenViewer';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { fromEth } from '@src/lib/conversion';
import FontSize from '@src/lib/fontSize';
import swapStyles from '@src/components/nugg/Wallet/tabs/SwapTab.styles';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
type Props = { isActive?: boolean };

const SalesTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = web3.hook.usePriorityAccount();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const connector = web3.hook.usePriorityConnector();

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await myActiveSalesQuery(
                chainId,
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
        if (isActive) {
            setLoadingNuggs(true);
            setTimeout(() => {
                getMyNuggs();
            }, 500);
        }
    }, [address, txnToggle]);

    return (
        <div style={styles.container}>
            <List
                data={myNuggs}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
                )}
                label="Sales"
                loading={loadingNuggs}
                style={listStyles.list}
                extraData={[address]}
                listEmptyText="No Nuggs on sale..."
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
                TitleButton={
                    !isUndefinedOrNullOrArrayEmpty(myNuggs)
                        ? () => (
                              <FeedbackButton
                                  feedbackText="Check Wallet..."
                                  buttonStyle={{
                                      ...swapStyles.button,
                                      margin: '0rem',
                                      padding: '.2rem 1rem',
                                  }}
                                  textStyle={{
                                      color: Colors.nuggRedText,
                                      fontSize: FontSize.h6,
                                      fontFamily: Layout.font.sf.light,
                                  }}
                                  label="Reclaim all"
                                  onClick={() =>
                                      WalletState.dispatch.multiClaim({
                                          address,
                                          provider,
                                          chainId,
                                          tokenIds: myNuggs.map((offer) => (offer as any).nugg.id),
                                      })
                                  }
                              />
                          )
                        : undefined
                }
            />
        </div>
    );
};

export default React.memo(SalesTab);

const RenderItem: FunctionComponent<ListRenderItemProps<NL.GraphQL.Fragments.Swap.Thumbnail>> = ({
    item,
    index,
    extraData,
}) => {
    const parsedTitle = useMemo(() => {
        if (!isUndefinedOrNullOrObjectEmpty(item)) {
            let parsed = item.id.split('-');
            if (!isUndefinedOrNullOrArrayEmpty(parsed)) {
                return {
                    nugg: parsed[0],
                    swap: parsed[1],
                };
            }
        }
        return { swap: '', nugg: '' };
    }, [item]);

    const isWinner = useMemo(() => {
        return item.endingEpoch === null; //item && item.leader.id === extraData[0];
    }, [item]);

    const swapText = useMemo(() => (item.num === '0' ? 'Mint' : `Swap #${item.num}`), [item]);

    return (
        !isUndefinedOrNullOrObjectEmpty(item) && (
            <div key={index} style={listStyles.render}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        // flexDirection: 'column',
                    }}
                >
                    {isWinner ? (
                        <TokenViewer
                            tokenId={parsedTitle.nugg}
                            data={(item as any).nugg.dotnuggRawCache}
                            style={{ width: '60px', height: '50px' }}
                        />
                    ) : (
                        <NLStaticImage
                            image="eth"
                            style={{
                                width: '60px',
                                height: '30px',
                                margin: '.6rem 0rem',
                            }}
                        />
                    )}
                    <div>
                        <Text
                            textStyle={listStyles.renderTitle}
                            size="small"
                            // type="text"
                        >
                            {isWinner ? `Nugg #${parsedTitle.nugg}` : `${fromEth(item.eth)} ETH`}
                        </Text>
                        <Text textStyle={{ color: Colors.textColor }} size="smaller" type="text">
                            {isWinner
                                ? item.endingEpoch === null
                                    ? 'Awaiting offer'
                                    : swapText
                                : `Nugg #${parsedTitle.nugg} | ${swapText}`}
                        </Text>
                    </div>
                </div>
                <FeedbackButton
                    type="text"
                    feedbackText="Check Wallet..."
                    textStyle={listStyles.textWhite}
                    buttonStyle={listStyles.renderButton}
                    label={`Reclaim`}
                    onClick={() => {}}
                    // onClick={() => WalletState.dispatch.claim({ tokenId: item.nugg.id })}
                />
            </div>
        )
    );
};
