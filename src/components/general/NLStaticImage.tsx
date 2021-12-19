import React, { FunctionComponent } from 'react';

import eth from '../../assets/images/currency/eth.svg';
import metamask from '../../assets/images/nugg/metamask.png';

type Props = {
    image: NLStaticImageKey;
};

export type NLStaticImageKey = 'nugglabs' | 'metamask' | 'eth';

const NLStaticImage: FunctionComponent<Props> = ({ image }) => {
    return image === 'eth' ? (
        <img src={eth} height={20} width={20} />
    ) : (
        <img src={metamask} height={20} width={20} />
    );
};

export default NLStaticImage;
