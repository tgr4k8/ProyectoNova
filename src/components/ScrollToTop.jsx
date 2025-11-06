import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API, BASE } from '../config';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;