import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useState,
} from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';

import Button from '@src/components/general/Buttons/Button/Button';
import Layout from '@src/lib/layout';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';

import styles from './ChainIndicator.styles';

type Props = {
    onClick?: () => void;
    style?: CSSProperties;
    textStyle?: CSSProperties;
};

const ChainIndicator: FunctionComponent<Props> = ({ onClick, style, textStyle }) => {
    const epoch = client.live.epoch();
    const blocknum = client.live.blocknum();
    const provider = web3.hook.usePriorityProvider();
    const error = web3.hook.usePriorityError();
    const router = client.router.useRouter();
    const [blocksRemaining, setBlocksRemaining] = useState(0);

    const getBlocksRemaining = useCallback(async () => {
        let remaining = 0;

        if (epoch && blocknum) {
            remaining = epoch.endblock - blocknum;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        setBlocksRemaining(remaining);
    }, [blocknum, epoch]);

    useLayoutEffect(() => {
        getBlocksRemaining();
    }, [getBlocksRemaining]);

    const springStyle = useSpring({
        display: 'flex',
        alignItems: 'center',
        opacity: epoch && +epoch.id ? 1 : 0,
    });

    const LeftIcon = useCallback(
        () =>
            false ? (
                <AlertCircle size={24} style={{ paddingRight: 0.5 + 'rem' }} />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <ChainIndicatorPulse /> */}
                    <TokenViewer
                        tokenId={epoch?.id.toString()}
                        style={{
                            width: '37px',
                            height: '37px',
                            marginTop: '0.2rem',
                            margin: '0rem .5rem 0rem 0rem',
                        }}
                    />
                </div>
            ),
        [provider, epoch],
    );

    return (
        // <SVG>
        <animated.div style={springStyle}>
            <Button
                textStyle={{
                    fontFamily: Layout.font.code.regular,
                    ...textStyle,
                }}
                onClick={() => {
                    router.routeTo(epoch.id.toString(), false);
                }}
                buttonStyle={{
                    ...styles.button,
                    ...(error ? styles.warning : styles.normal),
                    ...style,
                }}
                leftIcon={<LeftIcon />}
                label={epoch?.id + ' | ' + blocksRemaining}
            />
        </animated.div>
    );
};

export default React.memo(ChainIndicator);
