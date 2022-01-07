import React, { FunctionComponent } from 'react';

import NuggList from '../../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import NuggDexState from '../../../state/nuggdex';

type Props = {};

const Recents: FunctionComponent<Props> = () => {
    const recents = NuggDexState.select.recents();
    return (
        <div>
            <NuggList
                values={recents}
                style={{
                    height: '100%',
                    zIndex: 0,
                    width: '100%',
                    position: 'fixed',
                    background: 'transparent',
                }}
            />
        </div>
    );
};

export default Recents;
