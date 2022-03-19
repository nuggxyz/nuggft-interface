import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring, animated } from '@react-spring/web';

import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import NextSwap from '@src/components/nugg/NextSwap/NextSwap';

import styles from './ChainIndicator.styles';

type Props = {
    style?: CSSProperties;
    textStyle?: CSSProperties;
    onClick?: () => void;
};

const ChainIndicator: FunctionComponent<Props> = ({ style, textStyle, onClick }) => {
    const epoch__id = client.live.epoch.id();
    const epoch__endblock = client.live.epoch.endblock();

    const blocknum = client.live.blocknum();
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
    }, [hover, error, style]);

    return (
        <div style={{ display: 'flex' }}>
            <animated.div style={springStyle}>
                <div
                    ref={ref}
                    aria-hidden="true"
                    role="button"
                    onClick={() => {
                        if (onClick) onClick();
                        client.actions.routeTo(epoch__id!.toString(), false);
                    }}
                    style={style2}
                >
                    {error ? (
                        <AlertCircle size={24} style={{ paddingRight: `${0.5}rem` }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {epoch__id ? (
                                <TokenViewer
                                    tokenId={epoch__id.toString()}
                                    style={{
                                        width: '37px',
                                        height: '37px',
                                        marginTop: '0.2rem',
                                        margin: '0rem .5rem 0rem 0rem',
                                    }}
                                    subscribe
                                />
                            ) : null}
                        </div>
                    )}

                    {epoch__id && epoch__endblock && blocknum ? (
                        <Text
                            textStyle={{
                                fontFamily: lib.layout.font.code.regular,
                                ...textStyle,
                            }}
                        >
                            {`${epoch__id} | ${epoch__endblock - blocknum}`}
                        </Text>
                    ) : null}
                </div>
            </animated.div>
            <NextSwap />
        </div>
    );
};

export default React.memo(ChainIndicator);
