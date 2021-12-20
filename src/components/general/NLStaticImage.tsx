import React, { FunctionComponent, useMemo } from 'react';

import eth from '../../assets/images/currency/eth.svg';
import metamask from '../../assets/images/nugg/metamask.png';
import walletconnect from '../../assets/images/nugg/walletconnect.png';
import nugg from '../../assets/images/nugg/nugg.png';

type Props = {
    image: NLStaticImageKey;
};

export type NLStaticImageKey = 'nugg' | 'MetaMask' | 'eth' | 'WalletConnect';

const NLStaticImage: FunctionComponent<Props> = ({ image }) => {
    const img = useMemo(() => {
        switch (image) {
            case 'MetaMask':
                return <img src={metamask} height={20} width={20} />;
            case 'WalletConnect':
                return <img src={walletconnect} height={20} width={20} />;
            case 'eth':
                return <img src={eth} height={20} width={20} />;
            case 'nugg':
                return <img src={nugg} height={20} width={20} />;
            default:
                return null;
        }
    }, [image]);
    return img;
};

export default NLStaticImage;
