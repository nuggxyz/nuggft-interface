import React, { FunctionComponent } from 'react';

import NuggList from '@src/components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import NuggDexState from '@src/state/nuggdex';

type Props = Record<string, never>;

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
