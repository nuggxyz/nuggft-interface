import { useSpring } from '@react-spring/web';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { CornerRightDown, CornerRightUp, Search, X } from 'react-feather';
import { t } from '@lingui/macro';
import { useMatch, useNavigate } from 'react-router-dom';

import useDebounce from '@src/hooks/useDebounce';
import usePrevious from '@src/hooks/usePrevious';
import Colors from '@src/lib/colors';
import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import client from '@src/client';
import { SearchView } from '@src/client/interfaces';

import styles from './NuggDexSearchBar.styles';

type Props = Record<string, never>;

const NuggDexSearchBar: FunctionComponent<Props> = () => {
    const viewing = client.live.searchFilter.viewing();

    const isViewOpen = useMatch('view/*');
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();

    const prevSearchValue = usePrevious(searchValue);
    const [localSearchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();

    const debouncedValue = useDebounce(localSearchValue, 100);
    const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

    const navigate = useNavigate();
    // const location = useLocation();

    useEffect(() => {
        if (isViewOpen) {
            updateSearchFilterSearchValue(debouncedValue);
        } else {
            setSearchValue('');
        }
    }, [debouncedValue, isViewOpen, updateSearchFilterSearchValue]);

    useEffect(() => {
        if (sort) {
            if (sortAsc && (sort.direction === 'asc') !== sortAsc && isUserInput) {
                setIsUserInput(false);
                updateSearchFilterSort({
                    by: 'id',
                    direction: 'asc',
                });
            } else {
                setSortAsc(sort.direction === 'asc');
            }
        }
    }, [sortAsc, sort, isUserInput, updateSearchFilterSort]);

    useEffect(() => {
        if (localSearchValue === '' && prevSearchValue && prevSearchValue !== localSearchValue) {
            setSearchValue('');
        }
    }, [localSearchValue, prevSearchValue]);

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
            onFocus={() =>
                viewing === SearchView.Home && updateSearchFilterViewing(SearchView.AllNuggs)
            }
            placeholder={t`Search ${viewing === SearchView.Home ? SearchView.AllNuggs : viewing}`}
            value={localSearchValue || ''}
            setValue={setSearchValue}
            className="placeholder-blue"
            style={style}
            styleInputContainer={styleInput}
            leftToggles={[
                <Button
                    buttonStyle={styles.searchBarButton}
                    onClick={() => navigate('/view')}
                    rightIcon={<Search style={styles.searchBarIcon} />}
                />,
            ]}
            rightToggles={
                isViewOpen
                    ? [
                          ...(localSearchValue
                              ? [
                                    <Button
                                        buttonStyle={styles.searchBarButton}
                                        onClick={() => setSearchValue('')}
                                        rightIcon={<X style={styles.searchBarIcon} />}
                                    />,
                                ]
                              : []),
                          ...(viewing !== SearchView.Home
                              ? [
                                    <Button
                                        buttonStyle={styles.filterButton}
                                        rightIcon={
                                            sortAsc ? (
                                                <CornerRightUp
                                                    size={14}
                                                    color={Colors.nuggBlueText}
                                                />
                                            ) : (
                                                <CornerRightDown
                                                    size={14}
                                                    color={Colors.nuggBlueText}
                                                />
                                            )
                                        }
                                        onClick={() => {
                                            setSortAsc(!sortAsc);
                                            setIsUserInput(true);
                                        }}
                                    />,
                                ]
                              : []),
                      ]
                    : []
            }
        />
    );
};

export default React.memo(NuggDexSearchBar);
