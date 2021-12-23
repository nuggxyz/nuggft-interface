import React, { FunctionComponent, useState } from 'react';
import { ChevronLeft } from 'react-feather';

import Button from '../../components/general/Buttons/Button/Button';
import TransitionText from '../../components/general/Texts/TransitionText/TransitionText';
import NuggList from '../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import ViewingNugg from '../../components/nugg/ViewingNugg/ViewingNugg';
import { ucFirst } from '../../lib';
import TokenState from '../../state/token';

type Props = {};

const SearchView: FunctionComponent<Props> = () => {
    const [localViewing, setLocalViewing] =
        useState<NL.Redux.NuggDex.SearchViews>('all nuggs');
    const selected = TokenState.select.tokenId();
    return (
        <div style={{ height: '100%', width: '100%' }}>
            {!selected ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-around',
                        }}>
                        <Button
                            label="All nuggs"
                            onClick={() => setLocalViewing('all nuggs')}
                            buttonStyle={{
                                background:
                                    localViewing === 'all nuggs'
                                        ? 'white'
                                        : 'transparent',
                            }}
                        />
                        <Button
                            label="On sale"
                            onClick={() => setLocalViewing('on sale')}
                            buttonStyle={{
                                background:
                                    localViewing === 'on sale'
                                        ? 'white'
                                        : 'transparent',
                            }}
                        />
                    </div>
                    <NuggList
                        values={[]}
                        localViewing={localViewing}
                        setLocalViewing={setLocalViewing}
                        style={{
                            height: '95%',
                            width: '100%',
                            position: 'relative',
                        }}
                    />
                </>
            ) : (
                <>
                    <TransitionText
                        Icon={ChevronLeft}
                        style={{
                            marginTop: '.12rem',
                        }}
                        text={ucFirst(localViewing)}
                        transitionText="Go back"
                        onClick={() => {
                            TokenState.dispatch.setTokenFromId('');
                        }}
                    />
                    <ViewingNugg />
                </>
            )}
        </div>
    );
};

export default SearchView;
