import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import BradPittList from '@src/components/general/List/BradPittList';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';

import { NuggListRenderItemMobileBig, NuggListRenderItemMobile } from './NuggListRenderItemMobile';

// const INFINITE_INTERVAL = 100;

export const AllNuggs = () => {
    const goto = client.nuggbook.useGoto();

    const nuggs = client.all.useNuggs();
    const loadMoreNuggs = client.all.usePollNuggs();

    React.useEffect(() => {
        loadMoreNuggs();
    }, []);

    const id = React.useId();
    const reff = React.useRef(null);
    return (
        <div
            ref={reff}
            style={{
                overflow: 'scroll',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '600px',
            }}
        >
            <BradPittList
                id={`${id}-of-brad`}
                listStyle={{
                    overflow: 'hidden',
                    position: 'relative',
                    justifyContent: 'flex-start',
                    // padding: '0 20px',
                    height: '100%',
                    width: '100%',
                }}
                headerStyle={{
                    marginTop: 20,
                }}
                style={{
                    width: '100%',
                }}
                Title={
                    <Button
                        label={t`back`}
                        onClick={() => goto(Page.Search, false)}
                        buttonStyle={{
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            left: '1.4rem',
                            zIndex: 1000,
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                        }}
                        textStyle={{ color: 'white' }}
                    />
                }
                offsetListRef={false}
                data={nuggs}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                disableScroll
                coreRef={reff}
                onScrollEnd={loadMoreNuggs}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
                floaterColor={lib.colors.transparentWhite}
            />
        </div>
    );
};

export const AllItems = () => {
    const goto = client.nuggbook.useGoto();

    const items = client.all.useItems();
    const loadMoreItems = client.all.usePollItems();

    React.useEffect(() => {
        loadMoreItems();
    }, []);

    const id = React.useId();
    const reff = React.useRef(null);
    return (
        <div
            ref={reff}
            style={{
                overflow: 'scroll',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '600px',
            }}
        >
            <BradPittList
                id={`${id}-of-brad`}
                listStyle={{
                    overflow: 'hidden',
                    position: 'relative',
                    justifyContent: 'flex-start',
                    // padding: '0 20px',
                    height: '100%',
                    width: '100%',
                }}
                headerStyle={{
                    marginTop: 20,
                }}
                style={{
                    width: '100%',
                }}
                Title={
                    <Button
                        label="back"
                        onClick={() => goto(Page.Search, false)}
                        buttonStyle={{
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            left: '1.4rem',
                            zIndex: 1000,
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                        }}
                        textStyle={{ color: 'white' }}
                    />
                }
                offsetListRef={false}
                data={items}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                disableScroll
                coreRef={reff}
                onScrollEnd={loadMoreItems}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
                floaterColor={lib.colors.transparentWhite}
            />
        </div>
    );
};

const NuggDexSearchListMobile2 = () => {
    const goto = client.nuggbook.useGoto();
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Button
                label={t`view all nuggs`}
                onClick={() => goto(Page.AllNuggs, true)}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background: lib.colors.primaryColor,
                    marginRight: '10px',
                    marginBottom: '20px',
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 24,
                }}
            />
            <Button
                label={t`view all items`}
                onClick={() => goto(Page.AllItems, true)}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background: lib.colors.primaryColor,
                    marginRight: '10px',
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 24,
                }}
            />
        </div>
    );
};

export default NuggDexSearchListMobile2;
