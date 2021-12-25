import React, { FunctionComponent, useMemo } from 'react';
import { ChevronDown } from 'react-feather';

import Text from '../../general/Texts/Text/Text';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import SwapState from '../../../state/swap';
import Button from '../../general/Buttons/Button/Button';
import AppState from '../../../state/app';
import Web3State from '../../../state/web3';
import { Address } from '../../../classes/Address';
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

    const status = SwapState.select.status();

    const safeLeaderEns = useMemo(() => {
        return !isUndefinedOrNullOrObjectEmpty(leader)
            ? leader.id
            : Address.ZERO.hash;
    }, [leader]);

    const ens = Web3State.hook.useEns(safeLeaderEns);

    const hasBids = useMemo(
        () =>
            !isUndefinedOrNullOrObjectEmpty(leader) &&
            !isUndefinedOrNullOrStringEmpty(eth) &&
            !isUndefinedOrNullOrNumberZero(+eth),
        [eth, leader],
    );

    return (
        <div
            style={{
                ...styles.container,
                ...(AppState.isMobile && styles.mobile),
            }}>
            <div style={styles.bodyContainer}>
                <div style={styles.leaderContainer}>
                    <Text textStyle={styles.title}>
                        {status === 'ongoing' && hasBids
                            ? 'Highest Offer'
                            : status === 'ongoing' && !hasBids
                            ? 'No offers yet'
                            : status === 'waiting'
                            ? 'Place offer to initialize auction'
                            : 'Winner'}
                    </Text>
                    {hasBids && (
                        <div style={styles.leadingOfferContainer}>
                            {!AppState.isMobile && (
                                <Button
                                    rightIcon={
                                        <ChevronDown
                                            color={Colors.nuggBlueText}
                                            size={14}
                                        />
                                    }
                                    onClick={() => console.log('All offers')}
                                    buttonStyle={styles.allOffersButton}
                                />
                            )}
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
                                <Text textStyle={styles.code}>
                                    {ens ? ens.short : 'Loading...'}
                                </Text>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
        </div>
    );
};

export default React.memo(RingAbout);
