import React from 'react';
import { BsCircle, BsCheckCircleFill } from 'react-icons/bs';
import { IoIosArrowForward } from 'react-icons/io';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page, NuggBookPageProps } from '@src/interfaces/nuggbook';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';

const ListItem = ({
    text,
    onClick,
    visited,
}: {
    text: string;
    onClick: () => void;
    visited: boolean;
}) => {
    return (
        <Button
            aria-hidden="true"
            buttonStyle={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '.7rem',
            }}
            onClick={onClick}
            rightIcon={
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                marginRight: '.5rem',
                                alignItems: 'center',
                                display: 'flex',
                            }}
                        >
                            {visited ? (
                                <BsCheckCircleFill color={lib.colors.green} />
                            ) : (
                                <BsCircle color={lib.colors.grey} />
                            )}
                        </div>

                        <Text
                            textStyle={{ fontFamily: lib.layout.font.sf.regular, fontSize: '20px' }}
                        >
                            {text}
                        </Text>
                    </div>
                    <IoIosArrowForward color={lib.colors.darkerGray} />
                </>
            }
        />
    );
};

const ListItemGroup = ({
    header,
    items,
    setPage,
    visits,
}: {
    header: string;
    items: ListItemDescription[];
    visits: NuggBookPageProps['visits'];
    setPage: NuggBookPageProps['setPage'];
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                width: '100%',
                marginTop: '1rem',
            }}
        >
            <Text size="large">{header}</Text>
            {items.map((x) => (
                <ListItem
                    text={x.header}
                    onClick={() => setPage(x.page)}
                    visited={visits[x.page]}
                />
            ))}
        </div>
    );
};
type ListItemDescription = {
    header: string;
    page: Page;
};

const TableOfContents: NuggBookPage = ({ setPage, visits, clear }) => {
    const rundown: ListItemDescription[] = [
        {
            header: 'who makes money off nuggft?',
            page: Page.WhatIsDefi,
        },
        {
            header: 'where are the images stored?',
            page: Page.WhatIsAWallet,
        },
    ];

    const weeds: ListItemDescription[] = [
        {
            header: 'what are dynamic items?',
            page: Page.WhatIsDefi,
        },
        {
            header: 'where are the images stored?',
            page: Page.WhatIsAWallet,
        },
    ];

    const wut: ListItemDescription[] = [
        {
            header: 'what are dynamic items?',
            page: Page.WhatIsDefi,
        },
        {
            header: 'where are the images stored?',
            page: Page.WhatIsAWallet,
        },
    ];
    // const defi: ListItemDescription[] = [
    //     {
    //         header: 'what is defi',
    //         page: Page.WhatIsDefi,
    //     },
    //     {
    //         header: 'what is a wallet',
    //         page: Page.WhatIsAWallet,
    //     },
    // ];

    // const nft: ListItemDescription[] = [
    //     {
    //         header: 'what is an nft',
    //         page: Page.WhatIsAnNFT,
    //     },
    // ];

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Text size="larger" textStyle={{ padding: '10px' }}>
                welcome to nuggft
            </Text>

            <ListItemGroup header="the rundown" items={rundown} setPage={setPage} visits={visits} />

            {/* <ListItemGroup header="intro to defi" items={defi} setPage={setPage} visits={visits} /> */}

            <ListItemGroup
                header="into the weeds"
                items={weeds}
                setPage={setPage}
                visits={visits}
            />

            <ListItemGroup header="lol wut" items={wut} setPage={setPage} visits={visits} />

            {__DEV__ && (
                <Button
                    label="[DEV] clear local storage"
                    buttonStyle={{
                        marginTop: '20px',
                        background: lib.colors.red,
                        color: lib.colors.white,
                    }}
                    onClick={() => {
                        clear();
                    }}
                />
            )}
        </div>
    );
};

export default TableOfContents;
