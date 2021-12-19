// import { StaticImage } from 'gatsby-plugin-image';
import React, { FunctionComponent } from 'react';

type Props = {
    image: NLStaticImageKey;
};

export type NLStaticImageKey = 'nugglabs' | 'metamask' | 'eth';

const NLStaticImage: FunctionComponent<Props> = ({ image }) => {
    return <div>IMAGE</div>
    // switch (image) {
    //     case 'nugglabs':
    //         return (
    //             <StaticImage
    //                 alt="nugglabs image"
    //                 src="../../assets/images/nugg/nugglabs.png"
    //                 placeholder="blurred"
    //             />
    //         );
    //     case 'metamask':
    //         return (
    //             <StaticImage
    //                 src="../../assets/images/nugg/metamask.png"
    //                 alt="metamask"
    //                 placeholder="blurred"
    //             />
    //         );
    //     case 'eth':
    //         return (
    //             <StaticImage
    //                 src="../../assets/images/currency/eth.svg"
    //                 alt="eth"
    //                 placeholder="blurred"
    //                 width={17}
    //             />
    //         );
    //     default:
    //         return (
    //             <StaticImage
    //                 alt="nugglabs image"
    //                 src="../../assets/images/nugg/nugglabs.png"
    //                 placeholder="blurred"
    //             />
    //         );
    // }
};

export default NLStaticImage;
