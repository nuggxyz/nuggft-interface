import React, { FunctionComponent, useMemo } from 'react';

import { parseTokenId } from '@src/lib';
import WalletState from '@src/state/wallet';
import Text from '@src/components/general/Texts/Text/Text';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import listStyles from '@src/components/nugg/Wallet/tabs/HistoryTab.styles';
import Colors from '@src/lib/colors';
import styles from '@src/components/nugg/Wallet/tabs/Tabs.styles';
import swapStyles from '@src/components/nugg/Wallet/tabs/SwapTab.styles';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import TokenViewer from '@src/components/nugg/TokenViewer';
import NLStaticImage from '@src/components/general/NLStaticImage';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';
import web3 from '@src/web3';
import client from '@src/client';
import { DefaultExtraData, UnclaimedOffer } from '@src/client/core';
type Props = { isActive?: boolean };

const ClaimTab: FunctionComponent<Props> = ({ isActive }) => {
    const sender = web3.hook.usePriorityAccount();
    const epoch__id = client.live.epoch.id();
    const provider = web3.hook.usePriorityProvider();

    const chainId = web3.hook.usePriorityChainId();

    const unclaimedOffers = client.live.myUnclaimedOffers();

    return sender && chainId && provider ? (
        <div style={styles.container}>
            <List
                data={unclaimedOffers
                    .filter((x) => x.endingEpoch !== null && epoch__id && x.endingEpoch < epoch__id)
                    .sort((a, b) => (a.endingEpoch ?? 0 > (b.endingEpoch ?? 0) ? -1 : 1))}
                RenderItem={React.memo(RenderItem)}
                TitleButton={
                    unclaimedOffers.filter(
                        (x) => x.endingEpoch !== null && epoch__id && x.endingEpoch < epoch__id,
                    ).length > 0
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
                                  onClick={() => {
                                      let addresses: string[] = [],
                                          tokenIds: string[] = [];
                                      unclaimedOffers.forEach((x) => {
                                          tokenIds.push(x.claimParams.tokenId);
                                          addresses.push(x.claimParams.address);
                                      });
                                      WalletState.dispatch.multiClaim({
                                          addresses,
                                          sender,
                                          chainId,
                                          provider,
                                          tokenIds,
                                      });
                                  }}
                              />
                          )
                        : undefined
                }
                label="Claims"
                labelStyle={styles.listLabel}
                listEmptyStyle={listStyles.textWhite}
                loaderColor="white"
                style={listStyles.list}
                extraData={{ sender, chainId, provider }}
                listEmptyText="No Nuggs or ETH to claim..."
                action={() => undefined}
            />
        </div>
    ) : (
        <></>
    );
};

export default React.memo(ClaimTab);

const RenderItem: FunctionComponent<
    ListRenderItemProps<UnclaimedOffer, DefaultExtraData, undefined>
> = ({ item, index, extraData }) => {
    const swapText = useMemo(
        () =>
            item.type === 'item'
                ? //@ts-ignore
                  `For Nugg #${item.nugg}`
                : `From epoch ${item.endingEpoch}`,
        [item],
    );

    return item ? (
        <div key={index} style={listStyles.render}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    // flexDirection: 'column',
                }}
            >
                {item.leader ? (
                    <TokenViewer tokenId={item.tokenId} style={{ width: '60px', height: '50px' }} />
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
                        {item.leader
                            ? `${parseTokenId(item.tokenId, true)}`
                            : `${item.eth.num} ETH`}
                    </Text>
                    <Text textStyle={{ color: Colors.textColor }} size="smaller" type="text">
                        {item.leader
                            ? swapText
                            : `${parseTokenId(item.tokenId, true)} | ${swapText}`}
                    </Text>
                </div>
            </div>
            <FeedbackButton
                feedbackText="Check Wallet..."
                textStyle={listStyles.textWhite}
                buttonStyle={listStyles.renderButton}
                label={`Claim`}
                onClick={() => {
                    console.log({
                        ...item.claimParams,
                        ...extraData,
                    });
                    WalletState.dispatch.claim({
                        ...item.claimParams,
                        ...extraData,
                    });
                }}
            />
        </div>
    ) : (
        <></>
    );
};
