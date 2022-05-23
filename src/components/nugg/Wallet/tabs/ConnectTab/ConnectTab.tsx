import React, { FunctionComponent } from 'react';
import curriedLighten from 'polished/lib/color/lighten';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import HappyTipper from '@src/components/general/HappyTipper/HappyTipper';
import useDimensions from '@src/client/hooks/useDimensions';
import lib from '@src/lib';

import styles from './ConnectTab.styles';

type Props = Record<string, never>;

const ConnectTab: FunctionComponent<Props> = () => {
    const { isPhone } = useDimensions();

    const [forceDesktopAction, setForceDesktopAction] = React.useState(false);

    return (
        <div style={styles.container}>
            <div
                style={{
                    ...styles.disclaimerContainer,
                    background: isPhone
                        ? styles.walletsContainer.background
                        : styles.disclaimerContainer.background,
                }}
            >
                <Text type="text" size="smaller" textStyle={{ color: lib.colors.textColor }}>
                    {t`By connecting a wallet, you agree to nugg.xyz's Terms of Service and acknowledge
                    that you have read and understood the nugg.xyz Protocol Disclaimer.`}
                </Text>
            </div>
            <div style={{ ...styles.walletsContainer, overflow: isPhone ? 'hidden' : 'scroll' }}>
                {isPhone && __DEV__ && (
                    <Button
                        label={
                            forceDesktopAction
                                ? `[DEV] QR forced - turn off`
                                : `[DEV] QR not forced - turn on`
                        }
                        buttonStyle={{
                            marginTop: '20px',
                            background: lib.colors.red,
                            color: lib.colors.white,
                        }}
                        onClick={() => {
                            setForceDesktopAction(!forceDesktopAction);
                        }}
                    />
                )}
                {Object.values(web3.config.peers).map(
                    (peer) =>
                        !peer.fallback && (
                            <Button
                                key={peer.name}
                                buttonStyle={{
                                    ...styles.walletButton,
                                    border: `5px solid ${curriedLighten(0.1)(peer.color)}`,
                                }}
                                rightIcon={<NLStaticImage image={peer.peer} />}
                                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                onClick={async () => {
                                    const check = web3.config.connector_instances[peer.type];

                                    if (check) {
                                        if (check.store.getState().activating)
                                            await check.connector.deactivate();
                                        void check.connector.activate(
                                            undefined,
                                            peer.peer,
                                            __DEV__ && forceDesktopAction,
                                        );
                                    }
                                }}
                            />
                        ),
                )}
                <HappyTipper tip="wallet-1" />
            </div>
        </div>
    );
};

export default ConnectTab;
