import React, { SVGProps } from 'react';
import { t } from '@lingui/macro';
import { BsGithub } from 'react-icons/bs';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import client from '@src/client';
import eth from '@src/assets/images/app_logos/eth.png';
import packages from '@src/packages';

const Basic = (props?: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 377.94 563.82" {...props}>
            <path d="M167.54,563.82h-10c-12.71-.46-23.25-8.69-35.47-10.28C96.39,553.84,80.32,535,60.56,522,52.29,517.52,45,512.1,41,503.48,20,467,.49,463.12,8.33,413.86,9.61,381.48-9.38,371.71,6.12,332,8.36,326,8.74,320,6.39,314c-7.67-19.37-7.24-38.86-2-58.74,4.11-15.77,6.85-31.75,7-48.24a289.63,289.63,0,0,1,3-41.61c5.33-30.43-10-67.86,30.94-82.2,31-7.42,39.32-47.63,74.58-44.35,11.81.57,20.73-5,28.72-12.7,20.71-22.7,51.77-8.77,76.82-21,44.3-16.82,45.06,11.83,76.4,20.53,17.15,3.95,28.7,14.92,34.47,30.91,5.3,17.62,20,30.33,23.21,48.42,1,12.48-1.44,26.33,2.64,38.41,9.24,25,9.95,50.38,5.12,76.16a58.19,58.19,0,0,0,1.58,29.05c8.07,20.91-2.62,42.12,2.48,63.17,4,13,5.73,26.39,3.4,39.89-1.82,10.55.05,20.47,3.19,30.37v14c-9.11,26.17-10.23,56.45-32.87,75.2-6.36,6-10.13,12.84-13.19,20.65-9.9,29-36.32,37.7-61.92,48C240.28,564.81,202.13,555,167.54,563.82Zm31.82-38.47c22.76,1.88,40.19-2.76,55.66-15,20.2-10.62,40.56-9.56,48.45-36.29,6.31-22,31.43-30.83,34.16-54.94,2.86-13.49,9.53-26.14,6-40.27-4.74-18.8,1.74-38.23-3.28-56.79a85.14,85.14,0,0,1-2.23-39.33,58.39,58.39,0,0,0-1.1-27.12c-4.29-14.8-4-29.53-1.57-44.8,9.67-38.48-12.91-59.15-8.5-93.62,2.36-15.25-16.72-26.65-19.67-44.58-2.64-9.91-9.53-15.28-19.39-17C263.76,54,258.2,24.1,234.16,37c-12.82,4.38-25.68,9.26-39.66,7.63C183.92,43.34,175,46.19,167,54c-25.19,26.41-48.7,8.18-64.33,28.35C91.2,96.62,77.52,107.82,59.61,113.11c-11,3.24-12.61,11.24-11.18,19.71,1.91,11.62,1.08,23-1.26,34.61-4,19.44-2.44,39.77-4.07,59.41-2.35,24.59-15.27,49.34-6.47,74,6,15.77,4.73,31.4-1,47.17-8.83,30.21,13.09,38.93,4.26,84.3a34.1,34.1,0,0,0,8,23.81c8.11,10,14.91,21.06,22.39,31.57a12.57,12.57,0,0,0,4.58,4.17c9.74,4.33,17.72,10.89,25.23,18.32,13.56,12.71,34,11.62,50.78,17.74,15.22,5.22,35.46-1.32,48.49-2.53Z" />
        </svg>
    );
};

const Welcome_0: NuggBookPage = ({ setPage }) => {
    const setInit = client.nuggbook.useSetInit();

    const spring4 = packages.spring.useSpring({
        from: {
            opacity: 0,
            width: '100%',
        },
        to: {
            opacity: 1,
            width: '0%',
        },
        delay: 500 + 1500 + 1 * 1000,
        config: packages.spring.config.default,
    });

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <img
                alt="ethereum logo"
                src={eth}
                height={150}
                style={{
                    objectFit: 'cover',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.4rem 1rem .8rem',
                    textAlign: 'center',
                    verticalAlign: 'center',
                    marginBottom: '.4rem',
                    backgroundColor: 'transparent',
                }}
            >
                <span
                    style={{
                        marginLeft: 10,
                        fontSize: '20px',
                        color: lib.colors.transparentPrimaryColor,
                        ...lib.layout.presets.font.main.semibold,
                    }}
                >
                    {t`every image you see is 100% computed on ethereum`}
                </span>
            </div>

            <div
                aria-hidden="true"
                role="button"
                style={{
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.5rem .9rem',
                    background: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                <BsGithub
                    style={{
                        color: lib.colors.semiTransparentPrimaryColor,
                    }}
                    size={25}
                />
                <span
                    style={{
                        marginLeft: 10,
                        fontSize: '25px',
                        color: lib.colors.semiTransparentPrimaryColor,
                        ...lib.layout.presets.font.main.semibold,
                    }}
                >
                    {t`check it out`}
                </span>
            </div>

            <Basic
                height={150}
                fill="white"
                style={{
                    color: 'white',
                    objectFit: 'cover',
                }}
            />

            <packages.spring.animated.div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 10,
                    ...spring4,
                }}
            >
                <Button
                    className="mobile-pressable-div"
                    label={t`i got time ⌛️`}
                    onClick={() => {
                        setInit();
                        setPage(Page.TableOfContents);
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,
                        padding: '.7rem 1.3rem',
                        background: lib.colors.gradient3,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 15,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
            </packages.spring.animated.div>
        </div>
    );
};

export default Welcome_0;
