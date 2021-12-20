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
import TokenDispatches from '../../../../../state/token/dispatches';
import NuggDexSelectors from '../../../../../state/nuggdex/selectors';
import NuggDexDispatches from '../../../../../state/nuggdex/dispatches';

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
    const thumbnails = NuggDexSelectors.thumbnails();
    const results = NuggDexSelectors.searchResults();
    const loading = NuggDexSelectors.loading();
    const continueSearch = NuggDexSelectors.continueSearch();

    useLayoutEffect(() => {
        if (viewing !== 'home') {
            setView(viewing);
        }
    }, [viewing]);

    const updateContinueSearch = useCallback(() => {
        NuggDexDispatches.setContinueSearch(
            continueSearch === 'yes_' ? 'yes' : 'yes_',
        );
    }, [continueSearch]);

    const listData = useMemo(
        () => (!isUndefinedOrNullOrArrayEmpty(results) ? results : values),
        [values, results],
    );

    const onClick = useCallback((item) => {
        batch(() => {
            TokenDispatches.setTokenFromId(item);
            NuggDexDispatches.addToRecents({
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
                            NuggDexDispatches.setContinueSearch(
                                continueSearch === 'no' ? 'no_' : 'no',
                            );
                            setLocalViewing('home');
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
                    action={onClick}
                />
            </animated.div>
        </div>
    );
};

export default React.memo(NuggList);
