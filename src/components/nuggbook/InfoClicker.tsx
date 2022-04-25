import React, { CSSProperties } from 'react';
import { IoInformationCircle } from 'react-icons/io5';

import { Page } from '@src/interfaces/nuggbook';
import client from '@src/client';

export default ({ to, style }: { to: Page; style?: CSSProperties }) => {
    const openNuggBook = client.nuggbook.useOpenNuggBook();

    return (
        // <div
        //     className="mobile-pressable-div"
        //     onClick={() => openNuggBook(to)}
        // style={{display:}}
        //     // divStyle={{ padding: 0, borderRadius: 0 }}
        //     aria-hidden="true"
        // >
        <IoInformationCircle
            size={25}
            onClick={() => openNuggBook(to)}
            color="rgba(255,255,255, .9)"
            className="info-clicker mobile-pressable-div"
            style={style}
        />
        // </div>
    );
};
