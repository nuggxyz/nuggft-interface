import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import ProtocolState from '@src/state/protocol';
import WalletState from '@src/state/wallet';
import unclaimedOffersQuery from '@src/state/wallet/queries/unclaimedOffersQuery';
import Text from '@src/components/general/Texts/Text/Text';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import listStyles from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Colors from '@src/lib/colors';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import swapStyles from '@src/components/nugg/Wallet/tabs/SwapTab.styles';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { fromEth } from '@src/lib/conversion';
import NLStaticImage from '@src/components/general/NLStaticImage';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';
import SocketState from '@src/state/socket';
import web3 from '@src/web3';
type Props = { isActive?: boolean };

const ClaimTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = web3.hook.usePriorityAccount();
    const epoch = ProtocolState.select.epoch();
    const provider = web3.hook.usePriorityProvider();

    const [unclaimedOffers, setUnclaimedOffers] = useState<NL.GraphQL.Fragments.Offer.Thumbnail[]>(
        [],
    );
    const [loadingOffers, setLoadingOffers] = useState(false);
    const chainId = web3.hook.usePriorityChainId();

    const getUnclaimedOffers = useCallback(async () => {
        setLoadingOffers(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const offersRes = await unclaimedOffersQuery(chainId, address, epoch.id);
            console.log(offersRes);
            setUnclaimedOffers(offersRes);
        } else {
            setUnclaimedOffers([]);
        }
        setLoadingOffers(false);
    }, [address, epoch, chainId]);

    useEffect(() => {
        if (isActive) {
            setLoadingOffers(true);
            getUnclaimedOffers();
        }
    }, [address]);
    const socket = SocketState.select.Claim();

    useEffect(() => {
        setUnclaimedOffers(unclaimedOffers.filter((x) => x.id.split('-')[0] == socket.tokenId));
    }, [socket]);

    return (
        <div style={styles.container}>
            <List
                data={unclaimedOffers}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) => JSON.stringify(prev.item) === JSON.stringify(props.item),
                )}
                TitleButton={
                    !isUndefinedOrNullOrArrayEmpty(unclaimedOffers)
                        ? () => (
                              <FeedbackButton
                                  feedbackText="Check Wallet..."
                                  buttonStyle={{
                                      ...swapStyles.button,
                                      margin: '0rem',
                                      padding: '.2rem .6rem',
                                  }}
                                  textStyle={{
                                      color: Colors.nuggRedText,
                                      fontSize: FontSize.h6,
                                      fontFamily: Layout.font.sf.light,
                                  }}
                                  label="Claim all"
                                  onClick={() =>
                                      WalletState.dispatch.multiClaim({
                                          address,
                                          chainId,
                                          provider,
                                          tokenIds: unclaimedOffers.map(
                                              (offer) => (offer as any).swap.nugg.id,
                                          ),
                                      })
                                  }
                              />
                          )
                        : undefined
                }
                label="Claims"
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
                loading={loadingOffers}
                style={listStyles.list}
                extraData={[address, chainId, provider]}
                listEmptyText="No Nuggs or ETH to claim..."
            />
        </div>
    );
};

export default React.memo(ClaimTab);

const RenderItem: FunctionComponent<ListRenderItemProps<NL.GraphQL.Fragments.Offer.Thumbnail>> = ({
    item,
    index,
    extraData,
}) => {
    console.log({ item });
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
        return item && extraData[0] === item.swap.leader.id;
    }, [item, extraData]);

    const swapText = useMemo(
        () => (item.swap.num === '0' ? 'Mint' : `Swap #${item.swap.num}`),
        [item],
    );

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
                            data={(item as any).swap.nugg.dotnuggRawCache}
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
                        <Text textStyle={listStyles.renderTitle} size="small">
                            {isWinner ? `Nugg #${parsedTitle.nugg}` : `${fromEth(item.eth)} ETH`}
                        </Text>
                        <Text textStyle={{ color: Colors.textColor }} size="smaller" type="text">
                            {isWinner ? swapText : `Nugg #${parsedTitle.nugg} | ${swapText}`}
                        </Text>
                    </div>
                </div>
                <FeedbackButton
                    feedbackText="Check Wallet..."
                    textStyle={listStyles.textWhite}
                    buttonStyle={listStyles.renderButton}
                    label={`Claim`}
                    onClick={() =>
                        WalletState.dispatch.claim({
                            provider: extraData[2],
                            chainId: extraData[1],
                            tokenId: parsedTitle.nugg,
                            //@ts-ignore
                            address: item._addr ? item._addr : extraData[0],
                        })
                    }
                />
            </div>
        )
    );
};
