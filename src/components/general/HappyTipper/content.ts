type Tips = 'wallet-1';

type TipLink = `https://www.nugg.xyz/learn/${Tips | string}`;

const tips: {
    [key in Tips]: {
        label: string;
        title: string;
        body: string;
        link: TipLink;
    };
} = {
    'wallet-1': {
        label: "what's a wallet?",
        title: 'your key to web3 🔐',
        body: `a wallet is used to make changes to the blockchain. only you have access to it, so its important to keep it safe`,
        link: 'https://www.nugg.xyz/learn/wallet-1',
    },
};

const gotoLink = (link: TipLink) => {
    const win = window.open(link, '_blank');
    win && win.focus();
};

const slang = [
    'Okey dokey',
    'Okaley dokaley',
    'Yuppers',
    'Totes',
    'You betcha',
    'Alrighty',
    'Alrighty then',
    'Aye aye, captain!',
    'Alright',
    'Cool',
    'For sure',
    'I’d love to',
    'No doubt',
    'No problem',
    'No worries',
    'Roger ',
    'Roger that',
    'Sounds like a plan',
    'Sounds good',
    'Sure',
    'Sure, sure',
    'Sure, sure, sure',
    'Sure thing',
    'Totally',
    'Without a doubt',
    'Ya',
    'Yeah',
    'Yeah, yeah',
    'Yeah, yeah, yeah',
    'Yep',
    'You bet',
    'You got it',
    'Yup',
    '👊',
    '👍',
    '🤠',
];

const getRandomSlang = () => {
    return slang[Math.floor(Math.random() * slang.length)];
};

export default { tips, slang, getRandomSlang, gotoLink };
