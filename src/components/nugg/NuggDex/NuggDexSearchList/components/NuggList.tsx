import React, {
    CSSProperties,
    Dispatch,
    FunctionComponent,
    SetStateAction,
    useCallback,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { animated, UseSpringProps } from 'react-spring';
import { ChevronLeft } from 'react-feather';
import { batch } from 'react-redux';

import { isUndefinedOrNullOrArrayEmpty, ucFirst } from '../../../../../lib';
import List from '../../../../general/List/List';
import TransitionText from '../../../../general/Texts/TransitionText/TransitionText';
import globalStyles from '../../../../../lib/globalStyles';
import NuggDexState from '../../../../../state/nuggdex';
import TokenState from '../../../../../state/token';

import styles from './NuggDexComponents.styles';
import NuggListRenderItem from './NuggListRenderItem';

type Props = {
    style: CSSProperties | UseSpringProps;
    values: string[];
    setLocalViewing: Dispatch<SetStateAction<NL.Redux.NuggDex.SearchViews>>;
    viewing: NL.Redux.NuggDex.SearchViews;
};

const NuggList: FunctionComponent<Props> = ({
    style,
    values,
    setLocalViewing,
    viewing,
}) => {
    const [view, setView] = useState('');
    const thumbnails = NuggDexState.select.thumbnails();
    const results = NuggDexState.select.searchResults();
    const loading = NuggDexState.select.loading();
    const continueSearch = NuggDexState.select.continueSearch();

    useLayoutEffect(() => {
        if (viewing !== 'home') {
            setView(viewing);
        }
    }, [viewing]);

    const updateContinueSearch = useCallback(() => {
        NuggDexState.dispatch.setContinueSearch(
            continueSearch === 'yes_' ? 'yes' : 'yes_',
        );
    }, [continueSearch]);

    const listData = useMemo(
        () => (!isUndefinedOrNullOrArrayEmpty(results) ? results : values),
        [values, results],
    );

    const onClick = useCallback((item) => {
        batch(() => {
            TokenState.dispatch.setTokenFromId(item);
            NuggDexState.dispatch.addToRecents({
                _localStorageValue: item,
                _localStorageTarget: 'recents',
                _localStorageExpectedType: 'array',
            });
        });
    }, []);
    // FIXME DANNY check out the backdrop filter
    return (
        <div style={styles.nuggListContainer}>
            <animated.div
                style={{
                    ...styles.nuggListDefault,
                    ...style,
                }}>
                <div
                    style={{
                        display: 'flex',
                        ...styles.nuggListTitle,
                        ...globalStyles.backdropFilter,
                        zIndex: 10,
                    }}>
                    <TransitionText
                        Icon={ChevronLeft}
                        style={{
                            marginTop: '.12rem',
                        }}
                        text={ucFirst(view)}
                        transitionText="Go back"
                        onClick={() => {
                            NuggDexState.dispatch.setContinueSearch(
                                continueSearch === 'no' ? 'no_' : 'no',
                            );
                            setLocalViewing('home');
                            // NuggDexState.dispatch.setViewing('home');
                        }}
                    />
                </div>
                <List
                    style={{
                        padding: '1.6rem 1rem',
                        zIndex: 0,
                    }}
                    data={listData}
                    RenderItem={NuggListRenderItem}
                    extraData={[thumbnails]}
                    loading={loading}
                    onScrollEnd={updateContinueSearch}
                    // selected={selected}
                    action={onClick}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
