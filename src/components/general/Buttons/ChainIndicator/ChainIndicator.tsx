import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';

import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import NextSwap from '@src/components/nugg/NextSwap/NextSwap';

import styles from './ChainIndicator.styles';

type Props = {
    onClick?: () => void;
    style?: CSSProperties;
    textStyle?: CSSProperties;
};

const ChainIndicator: FunctionComponent<Props> = ({ onClick, style, textStyle }) => {
    const epoch__id = client.live.epoch__id();
    const epoch__endblock = client.live.epoch__endblock();

    const epoch = client.live.epoch();

    const blocknum = client.live.blocknum();
    const provider = web3.hook.usePriorityProvider();
    const error = web3.hook.usePriorityError();

    const springStyle = useSpring({
        display: 'flex',
        alignItems: 'center',
        opacity: epoch__id ? 1 : 0,
    });

    const [ref, hover] = useOnHover(() => undefined);

    const style2 = useMemo(() => {
        return {
            ...(hover ? { filter: 'brightness(.8)' } : {}),
            ...{
                ...styles.buttonDefault,
                ...styles.button,
                ...(error ? styles.warning : styles.normal),
                ...style,
            },
        };
    }, [hover]);

    return (
        <div style={{ display: 'flex' }}>
            <animated.div style={springStyle}>
                <div
                    ref={ref}
                    onClick={() => {
                        client.actions.routeTo(epoch.id.toString(), false);
                    }}
                    style={style2}
                >
                    {error ? (
                        <AlertCircle size={24} style={{ paddingRight: 0.5 + 'rem' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TokenViewer
                                tokenId={epoch__id.toString()}
                                style={{
                                    width: '37px',
                                    height: '37px',
                                    marginTop: '0.2rem',
                                    margin: '0rem .5rem 0rem 0rem',
                                }}
                            />
                        </div>
                    )}

                    <Text
                        textStyle={{
                            fontFamily: lib.layout.font.code.regular,
                            ...textStyle,
                        }}
                    >
                        {epoch__id + ' | ' + (epoch__endblock - blocknum)}
                    </Text>
                </div>
            </animated.div>
            <NextSwap />
        </div>
    );
};

export default React.memo(ChainIndicator);
