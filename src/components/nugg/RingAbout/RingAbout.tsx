import React, { FunctionComponent, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { animated, useSpring } from 'react-spring';
import { BigNumber } from 'ethers';

import Text from '../../general/Texts/Text/Text';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import SwapState from '../../../state/swap';
import Button from '../../general/Buttons/Button/Button';
import AppState from '../../../state/app';
import Web3State from '../../../state/web3';
import { Address, EnsAddress } from '../../../classes/Address';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../lib';
import { fromEth } from '../../../lib/conversion';
import Colors from '../../../lib/colors';

import styles from './RingAbout.styles';

type Props = {};

const RingAbout: FunctionComponent<Props> = ({}) => {
    const eth = SwapState.select.eth();
    const address = Web3State.select.web3address();
    const ethUsd = SwapState.select.ethUsd();
    const leader = SwapState.select.leader();
    const offers = SwapState.select.offers();

    const status = SwapState.select.status();

    const [open, setOpen] = useState(false);

    const leaderEns = Web3State.hook.useEns(leader?.id);

    const hasBids = useMemo(
        () =>
            !isUndefinedOrNullOrObjectEmpty(leader) &&
            !isUndefinedOrNullOrStringEmpty(eth) &&
            !isUndefinedOrNullOrNumberZero(+eth),
        [eth, leader],
    );

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? '500px' : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '1rem' : '0rem',
    });

    return (
        <animated.div
            style={{
                ...(AppState.isMobile && styles.mobile),
                ...styles.container,
            }}>
            <div style={styles.bodyContainer}>
                <div style={styles.leaderContainer}>
                    <Text textStyle={styles.title}>
                        {status === 'ongoing' && hasBids
                            ? 'Highest Offer'
                            : status === 'ongoing' && !hasBids
                            ? 'No offers yet'
                            : status === 'waiting'
                            ? 'Place offer to begin auction'
                            : 'Winner'}
                    </Text>
                    {hasBids && (
                        <div style={styles.leadingOfferContainer}>
                            <div style={styles.leadingOfferAmount}>
                                <CurrencyText
                                    image="eth"
                                    textStyle={styles.leadingOffer}
                                    value={+fromEth(eth)}
                                />
                                {/* <CurrencyText
                                    textStyle={styles.leadingOffer}
                                    value={+ethUsd}
                                /> */}
                                <Text textStyle={styles.code}>{leaderEns}</Text>
                            </div>
                            {!AppState.isMobile && offers.length > 1 && (
                                <Button
                                    rightIcon={
                                        !open ? (
                                            <ChevronUp
                                                color={Colors.nuggBlueText}
                                                size={14}
                                            />
                                        ) : (
                                            <ChevronDown
                                                color={Colors.nuggBlueText}
                                                size={14}
                                            />
                                        )
                                    }
                                    onClick={() => setOpen(!open)}
                                    buttonStyle={styles.allOffersButton}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/*//@ts-ignore*/}
            <animated.div style={springStyle}>
                {offers.map(
                    (offer, index) =>
                        index !== 0 && (
                            <OfferRenderItem
                                {...{ offer, index }}
                                key={index}
                            />
                        ),
                )}
            </animated.div>

            {status !== 'over' && !isUndefinedOrNullOrStringEmpty(address) && (
                <Button
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                    onClick={() =>
                        AppState.dispatch.setModalOpen({
                            name: 'OfferOrSell',
                            modalData: {
                                type: 'Offer',
                            },
                        })
                    }
                    label="Place offer..."
                />
            )}
        </animated.div>
    );
};

export default React.memo(RingAbout);

const OfferRenderItem = ({
    offer,
    index,
}: {
    offer: NL.GraphQL.Fragments.Offer.Bare;
    index: number;
}) => {
    const ens = Web3State.hook.useEns(offer.user.id);
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={+fromEth(offer.eth)} />
            <Text textStyle={styles.code}>{ens}</Text>
        </div>
    );
};
