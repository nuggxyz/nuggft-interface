import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { animated, config, useTransition } from 'react-spring';

import { EnsAddress } from '../../../classes/Address';
import { isUndefinedOrNullOrStringEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import { fromEth } from '../../../lib/conversion';
import AppState from '../../../state/app';
import TokenState from '../../../state/token';
import Web3Selectors from '../../../state/web3/selectors';
import Button from '../../general/Buttons/Button/Button';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../general/Texts/Text/Text';
import TokenViewer from '../TokenViewer';

import styles from './ViewingNugg.styles';

type Props = {};

const ViewingNugg: FunctionComponent<Props> = () => {
    const tokenId = TokenState.select.tokenId();
    const address = Web3Selectors.web3address();
    const owner = TokenState.select.owner();
    const swaps = TokenState.select.swaps();

    const [items, setItems] = useState([tokenId]);

    useEffect(() => {
        setItems([items[1], tokenId]);
    }, [tokenId]);

    const animatedContainer = useTransition(tokenId, {
        from: {
            position: 'absolute',
            opacity: 0,
        },
        enter: {
            opacity: 1,
        },
        leave: {
            opacity: 0,
        },
        config: config.default,
    });

    const Swaps = useCallback(
        () => (
            <div style={styles.swaps}>
                {swaps.map((swap, index) => {
                    return (
                        <Button
                            buttonStyle={styles.owner}
                            key={index}
                            onClick={() =>
                                AppState.onRouteUpdate(`#/swap/${swap.id}`)
                            }
                            rightIcon={
                                <>
                                    <div
                                        style={{
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            display: 'flex',
                                        }}>
                                        <Text>
                                            Swap {swap.id.split('-')[1]}
                                        </Text>
                                        <CurrencyText
                                            image="eth"
                                            value={+fromEth(swap.eth)}
                                        />
                                    </div>
                                    <div>
                                        <Text
                                            type="text"
                                            size="smaller"
                                            textStyle={{
                                                color: Colors.nuggBlueText,
                                            }}>
                                            Purchased from
                                        </Text>
                                        <Text
                                            textStyle={{
                                                color: 'white',
                                            }}>
                                            {
                                                new EnsAddress(swap.owner.id)
                                                    .short
                                            }
                                        </Text>
                                    </div>
                                </>
                            }
                        />
                    );
                })}
            </div>
        ),
        [swaps],
    );

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) &&
        animatedContainer(
            (style, item) =>
                item && (
                    <animated.div
                        //@ts-ignore
                        style={{
                            ...style,
                            display: 'flex',
                            justifyContent: 'center',
                            transform: style.opacity.to(
                                (y) => `translate3d(${y * -100}px,0,0)`,
                            ),
                        }}>
                        <div style={styles.container}>
                            <div style={styles.owner}>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{ color: Colors.nuggBlueText }}>
                                    {owner && 'Purchased by'}
                                </Text>
                                <Text textStyle={{ color: 'white' }}>
                                    {owner && new EnsAddress(owner).short}
                                </Text>
                            </div>
                            <TokenViewer tokenId={tokenId} showLabel />
                            <Swaps />
                        </div>
                        {owner === address && (
                            <div>
                                <Button
                                    textStyle={styles.textWhite}
                                    buttonStyle={{
                                        ...styles.button,
                                        background: Colors.gradient3Transparent,
                                    }}
                                    label="Withdraw"
                                    onClick={() =>
                                        AppState.dispatch.setModalOpen({
                                            name: 'StartSale',
                                            modalData: {
                                                targetId: item,
                                                type: 'Burn',
                                                backgroundStyle: {
                                                    background:
                                                        Colors.gradient3,
                                                },
                                            },
                                        })
                                    }
                                />
                                <Button
                                    textStyle={styles.textWhite}
                                    buttonStyle={{
                                        ...styles.button,
                                        background: Colors.gradient2Transparent,
                                    }}
                                    label="Sell"
                                    onClick={() =>
                                        AppState.dispatch.setModalOpen({
                                            name: 'StartSale',
                                            modalData: {
                                                targetId: item,
                                                type: 'StartSale',
                                            },
                                        })
                                    }
                                />
                            </div>
                        )}
                    </animated.div>
                ),
        )
    );
};

export default React.memo(ViewingNugg);
