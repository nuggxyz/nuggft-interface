import React, { CSSProperties, FunctionComponent } from 'react';

import AppState from '@src/state/app';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';

import Flyout from './components/Flyout';
import content from './content';

export type HappyTipperItem = {
    comp?: ({ isActive }: { isActive: boolean }) => JSX.Element;
};

type Props = {
    tip: keyof typeof content.tips;

    containerStyle?: CSSProperties;
    bodyStyle?: CSSProperties;
    headerTextStyle?: CSSProperties;
};

const WIDTH = 350;

const HappyTipper: FunctionComponent<Props> = ({ tip }) => {
    const screenType = AppState.select.screenType();

    return (
        <Flyout
            containerStyle={{}}
            button={
                <Button
                    buttonStyle={{ background: 'transparent' }}
                    textStyle={{ fontSize: '15px' }}
                    onClick={undefined}
                    label={content.tips[tip].label}
                />
            }
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'black',
                    width: '250px',
                    // width: '100%',
                    // height: '100%',
                    padding: '5px',
                    // position: 'relative',
                }}
            >
                <Text>{content.tips[tip].title}</Text>
                <p>{content.tips[tip].body}</p>
                <InteractiveText
                    textStyle={{ fontSize: '15px' }}
                    action={() => content.gotoLink(content.tips[tip].link)}
                >
                    learn more
                </InteractiveText>
                <Button
                    onClick={undefined}
                    label={content.getRandomSlang()}
                    buttonStyle={{ background: lib.colors.gradient3 }}
                    textStyle={{ color: 'white' }}
                />
            </div>
        </Flyout>
    );
};

export default React.memo(HappyTipper);
