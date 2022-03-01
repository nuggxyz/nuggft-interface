import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import eth from '@src/assets/images/currency/eth.svg';
import metamask from '@src/assets/images/app_logos/metamask.png';
import walletconnect from '@src/assets/images/app_logos/walletconnect.png';
import nugg from '@src/assets/images/nugg/nugg-white.png';
import coinbase from '@src/assets/images/app_logos/coinbase.png';
import rainbow from '@src/assets/images/app_logos/rainbow.png';
import trust from '@src/assets/images/app_logos/trust.svg';
import ledger from '@src/assets/images/app_logos/ledger.svg';
import cryptodotcom from '@src/assets/images/app_logos/cryptodotcom.png';

type Props = {
    image: NLStaticImageKey;
    style?: CSSProperties;
};

export type NLStaticImageKey =
    | 'nugg'
    | 'MetaMask'
    | 'eth'
    | 'WalletConnect'
    | 'Coinbase'
    | 'Trust'
    | 'Rainbow'
    | 'CryptoDotCom'
    | 'Rainbow'
    | 'Ledger';

const NLStaticImage: FunctionComponent<Props> = ({ image, style }) => {
    const img = useMemo(() => {
        switch (image) {
            case 'MetaMask':
                return (
                    <img
                        src={metamask}
                        height={48}
                        width={128}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            case 'WalletConnect':
                return (
                    <img
                        src={walletconnect}
                        height={48}
                        width={128}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            case 'eth':
                return <img src={eth} height={20} width={20} style={style} />;
            case 'nugg':
                return <img src={nugg} height={35} width={35} style={style} />;
            case 'Coinbase':
                return (
                    <img
                        src={coinbase}
                        height={48}
                        width={128}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            case 'Rainbow':
                return (
                    <img
                        src={rainbow}
                        height={48}
                        width={128}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            case 'Trust':
                return (
                    <img
                        src={trust}
                        // height={150}
                        width={170}
                        style={{ objectFit: 'cover', height: 23.8, ...style }}
                    />
                );
            case 'Ledger':
                return (
                    <img
                        src={ledger}
                        height={120}
                        width={100}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            case 'CryptoDotCom':
                return (
                    <img
                        src={cryptodotcom}
                        height={48}
                        width={128}
                        style={{ objectFit: 'contain', height: 23.8, ...style }}
                    />
                );
            default:
                return null;
        }
    }, [image]);
    return img;
};

export default React.memo(NLStaticImage);
