import React from 'react';

const COUNTER_IN_SECONDS = 60;
const useCountDown = () => {
    const [counter, setCounter] = React.useState(COUNTER_IN_SECONDS);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCounter((counter) => {
                if (counter > 0) {
                    return counter - 1;
                }
            });
        }, 1000);

        return () => interval && clearInterval(interval);
    }, []);

    const resetCounter = () => {
        setCounter(COUNTER_IN_SECONDS);
    };

    return [counter, resetCounter] as const;
};

export default useCountDown;
