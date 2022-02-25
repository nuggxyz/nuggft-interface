import config from './config';

const useActiveWeb3React = () => {
    return config.priority.usePriorityProvider();
};

export default {
    useActiveWeb3React,
};
