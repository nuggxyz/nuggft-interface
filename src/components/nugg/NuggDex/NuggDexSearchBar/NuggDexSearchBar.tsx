import { useSpring } from '@react-spring/core';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { CornerRightDown, CornerRightUp, Search, X } from 'react-feather';

import useDebounce from '@src/hooks/useDebounce';
import usePrevious from '@src/hooks/usePrevious';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import NuggDexState from '@src/state/nuggdex';
import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import client from '@src/client';

import styles from './NuggDexSearchBar.styles';

type Props = {};

const NuggDexSearchBar: FunctionComponent<Props> = () => {
    const viewing = NuggDexState.select.viewing();
    const view = AppState.select.view();

    const isViewOpen = client.live.isViewOpen;
    const filters = NuggDexState.select.searchFilters();
    const prevFilters = usePrevious(filters);

    const [searchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);

    const debouncedValue = useDebounce(searchValue, 100);
    const [sortAsc, setSortAsc] = useState(filters.sort.asc);

    useEffect(() => {
        if (isViewOpen) {
            NuggDexState.dispatch.setSearchFilters({
                searchValue: debouncedValue,
            });
        } else {
            setSearchValue('');
        }
    }, [debouncedValue, view, isViewOpen]);

    useEffect(() => {
        if (filters.sort.asc !== sortAsc && isUserInput) {
            setIsUserInput(false);
            NuggDexState.dispatch.setSearchFilters({
                sort: {
                    by: 'id',
                    asc: sortAsc,
                },
            });
        } else {
            setSortAsc(filters.sort.asc);
        }
    }, [sortAsc, filters, isUserInput]);

    useEffect(() => {
        if (
            filters.searchValue === '' &&
            prevFilters &&
            prevFilters.searchValue !== filters.searchValue
        ) {
            setSearchValue('');
        }
    }, [filters]);

    const styleInput = useSpring({
        width: isViewOpen ? '100%' : '0%',
    });
    const style = useSpring({
        ...styles.searchBar,
        margin: isViewOpen ? '0% 5% 0% 5%' : '0% 100% 0% 0%',
        borderRadius: isViewOpen ? '7px' : '20px',
    });

    return (
        <TextInput
            onFocus={() => viewing === 'home' && NuggDexState.dispatch.setViewing('all nuggs')}
            placeholder={`Search ${viewing === 'home' ? 'all nuggs' : viewing}`}
            value={searchValue}
            setValue={setSearchValue}
            className="placeholder-blue"
            style={style}
            styleInputContainer={styleInput}
            leftToggles={[
                <Button
                    buttonStyle={styles.searchBarButton}
                    onClick={() => client.actions.toggleView()}
                    rightIcon={<Search style={styles.searchBarIcon} />}
                />,
            ]}
            rightToggles={
                isViewOpen
                    ? [
                          !isUndefinedOrNullOrStringEmpty(searchValue) && (
                              <Button
                                  buttonStyle={styles.searchBarButton}
                                  onClick={() => setSearchValue('')}
                                  rightIcon={<X style={styles.searchBarIcon} />}
                              />
                          ),
                          viewing !== 'home' && (
                              <Button
                                  buttonStyle={styles.filterButton}
                                  rightIcon={
                                      sortAsc ? (
                                          <CornerRightUp size={14} color={Colors.nuggBlueText} />
                                      ) : (
                                          <CornerRightDown size={14} color={Colors.nuggBlueText} />
                                      )
                                  }
                                  onClick={() => {
                                      setSortAsc(!sortAsc);
                                      setIsUserInput(true);
                                  }}
                              />
                          ),
                      ]
                    : []
            }
        />
    );
};

export default React.memo(NuggDexSearchBar);
