import React, { useEffect, useState } from 'react';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { IoAdd, IoOpenOutline, IoRemove } from 'react-icons/io5';
import { t } from '@lingui/macro';

import List from '@src/components/general/List/List';
import client from '@src/client';
import web3 from '@src/web3';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import state from '@src/state';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle } from '@src/client/interfaces';
import { NuggId, TokenId } from '@src/client/router';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import OfferRenderItem from './OfferRenderItem';
import styles from './RingAbout.styles';

export default ({ tokenId, sellingNuggId }: { tokenId?: TokenId; sellingNuggId?: NuggId }) => {
    const offers = client.live.offers(tokenId);
    const token = client.live.token(tokenId);
    const type = client.live.lastSwap.type();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const screenType = state.app.select.screenType();

    const [open, setOpen] = useState(screenType === 'tablet');

    const { leader, others } = React.useMemo(() => {
        const tmp =
            token?.type === 'item'
                ? offers.filter((x) => {
                      return (
                          x.type === 'item' &&
                          x.sellingNuggId === (sellingNuggId || token.activeSwap?.sellingNuggId)
                      );
                  })
                : [...offers];
        return {
            leader: tmp.shift(),
            others: tmp,
        };
    }, [offers, token, sellingNuggId]);

    useEffect(() => {
        if (offers && offers.length === 1 && open && screenType !== 'tablet') {
            setOpen(false);
        }
    }, [open, offers, screenType]);

    const springStyle = useSpring({
        ...styles.offersContainer,
        height: open ? (screenType === 'tablet' ? '100%' : '300px') : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
    });

    const [flashStyle] = useSpring(() => {
        return {
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentWhite,
                },
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentLightGrey,
                },
            ],
            from: {
                ...styles.leadingOfferAmount,
                background: lib.colors.transparentLightGrey,
            },
            config: springConfig.molasses,
        };
    });

    const ens = web3.hook.usePriorityAnyENSName(
        token && token.type === 'item' ? 'nugg' : provider,
        leader?.user || '',
    );

    return token &&
        token.lifecycle !== Lifecycle.Bench &&
        token.lifecycle !== Lifecycle.Tryout &&
        token.lifecycle !== Lifecycle.Stands ? (
        <>
            {leader && chainId && token ? (
                <div style={styles.leadingOfferAmountContainer}>
                    <animated.div style={flashStyle}>
                        <div style={styles.leadingOfferAmountBlock}>
                            <CurrencyText
                                size="small"
                                image="eth"
                                textStyle={styles.leadingOffer}
                                value={leader?.eth?.decimal?.toNumber()}
                            />
                        </div>
                        <div style={styles.leadingOfferAmountUser}>
                            <Text size="smaller" type="text">
                                {t`from`}
                            </Text>
                            <Text size="smaller">{ens}</Text>
                        </div>
                        <Button
                            buttonStyle={styles.etherscanBtn}
                            onClick={() =>
                                chainId && web3.config.gotoEtherscan(chainId, 'tx', leader.txhash)
                            }
                            rightIcon={<IoOpenOutline color={lib.colors.nuggBlueText} size={14} />}
                        />
                    </animated.div>
                </div>
            ) : null}
            {others.length > 0 &&
                (screenType === 'tablet' ? (
                    <Text
                        size="small"
                        type="text"
                        textStyle={{ color: 'white', ...styles.showMoreButton }}
                    >
                        {t`previous offers`}
                    </Text>
                ) : (
                    <Button
                        size="small"
                        type="text"
                        textStyle={{ color: 'white' }}
                        label={open ? t`hide previous offers` : t`show previous offers`}
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
                ))}
            <animated.div style={springStyle}>
                <List
                    data={others}
                    RenderItem={OfferRenderItem}
                    extraData={{ type, provider, chainId }}
                />
            </animated.div>
        </>
    ) : null;
};
