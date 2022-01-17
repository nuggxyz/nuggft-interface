import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../../lib';
import ProtocolState from '../../../../../state/protocol';
import WalletState from '../../../../../state/wallet';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import Text from '../../../../general/Texts/Text/Text';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import listStyles from '../HistoryTab.styles';
import Colors from '../../../../../lib/colors';
import styles from '../Tabs.styles';
import swapStyles from '../SwapTab.styles';
import TransactionState from '../../../../../state/transaction';
import FeedbackButton from '../../../../general/Buttons/FeedbackButton/FeedbackButton';
import TokenViewer from '../../../TokenViewer';
import { fromEth } from '../../../../../lib/conversion';
import NLStaticImage from '../../../../general/NLStaticImage';
import FontSize from '../../../../../lib/fontSize';
import Layout from '../../../../../lib/layout';

type Props = { isActive?: boolean };

const ClaimTab: FunctionComponent<Props> = ({ isActive }) => {
    const txnToggle = TransactionState.select.toggleCompletedTxn();
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [unclaimedOffers, setUnclaimedOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);

    const getUnclaimedOffers = useCallback(async () => {
        setLoadingOffers(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const offersRes = await unclaimedOffersQuery(address, epoch.id);
            setUnclaimedOffers(offersRes);
        } else {
            setUnclaimedOffers([]);
        }
        setLoadingOffers(false);
    }, [address, epoch]);

    useEffect(() => {
        if (isActive) {
            setLoadingOffers(true);
            setTimeout(() => {
                getUnclaimedOffers();
            }, 500);
        }
    }, [address, txnToggle]);

    return (
        <div style={styles.container}>
            <List
                data={unclaimedOffers}
                RenderItem={React.memo(
                    RenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                TitleButton={
                    !isUndefinedOrNullOrArrayEmpty(unclaimedOffers)
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
                                      fontFamily: Layout.font.inter.light,
                                  }}
                                  label="Claim all"
                                  onClick={() =>
                                      WalletState.dispatch.multiClaim({
                                          tokenIds: unclaimedOffers.map(
                                              (offer) =>
                                                  (offer as any).swap.nugg.id,
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
                extraData={[address]}
                listEmptyText="No Nuggs or ETH to claim..."
            />
        </div>
    );
};

export default React.memo(ClaimTab);

const RenderItem: FunctionComponent<
    ListRenderItemProps<NL.GraphQL.Fragments.Offer.Thumbnail>
> = ({ item, index, extraData }) => {
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
                    }}>
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
                            {isWinner
                                ? `Nugg #${parsedTitle.nugg}`
                                : `${fromEth(item.eth)} ETH`}
                        </Text>
                        <Text
                            textStyle={{ color: Colors.textColor }}
                            size="smaller"
                            type="text">
                            {isWinner
                                ? swapText
                                : `Nugg #${parsedTitle.nugg} | ${swapText}`}
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
                            tokenId: parsedTitle.nugg,
                        })
                    }
                />
            </div>
        )
    );
};
