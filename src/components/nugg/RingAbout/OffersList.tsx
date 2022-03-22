import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { IoAdd, IoRemove } from 'react-icons/io5';

import List from '@src/components/general/List/List';
import client from '@src/client';
import web3 from '@src/web3';
import lib, { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import state from '@src/state';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle } from '@src/client/interfaces';

import OfferRenderItem from './OfferRenderItem';
import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OffersList: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastSwap.tokenId();
    const offers = client.live.offers(tokenId).slice(1);
    const token = client.live.token(tokenId);

    const type = client.live.lastSwap.type();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const screenType = state.app.select.screenType();

    const [open, setOpen] = useState(screenType === 'tablet');

    useEffect(() => {
        if (offers && offers.length === 0 && open && screenType !== 'tablet') {
            setOpen(false);
        }
    }, [open, offers, screenType]);

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? (screenType === 'tablet' ? '100%' : '300px') : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
    });

    const shouldShow = useMemo(() => {
        return (
            token &&
            token.lifecycle !== Lifecycle.Bench &&
            token.lifecycle !== Lifecycle.Tryout &&
            token.lifecycle !== Lifecycle.Stands &&
            !isUndefinedOrNullOrArrayEmpty(offers)
        );
    }, [token, offers]);

    return shouldShow ? (
        <>
            {offers.length >= 1 && screenType === 'tablet' ? (
                <Text
                    size="small"
                    type="text"
                    textStyle={{ color: 'white', ...styles.showMoreButton }}
                >
                    previous offers
                </Text>
            ) : (
                <Button
                    size="small"
                    type="text"
                    textStyle={{ color: 'white' }}
                    label={`${open ? 'hide' : 'show'} previous offers`}
                    rightIcon={
                        <div style={styles.allOffersButton}>
                            {open ? (
                                <IoRemove color={lib.colors.nuggBlueText} size={14} />
                            ) : (
                                <IoAdd color={lib.colors.nuggBlueText} size={14} />
                            )}
                        </div>
                    }
                    onClick={() => setOpen(!open)}
                    buttonStyle={styles.showMoreButton}
                />
            )}
            <animated.div style={springStyle}>
                <List
                    data={offers}
                    RenderItem={OfferRenderItem}
                    extraData={{ type, provider, chainId }}
                />
            </animated.div>
        </>
    ) : null;
};

export default OffersList;
