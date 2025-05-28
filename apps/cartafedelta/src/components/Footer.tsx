import React from 'react';
import locales from './Footer.locales.json';

interface Props {
    brand?: string;
}

const Footer = (props: Props) => {
    const year = new Date().getFullYear();
    const brandLocales = locales[props.brand ?? 'rica'];

    return (
        <footer className="pb-6 mx-auto mt-6 text-center sm:mt-10">
            <p className="text-xs text-black sm:text-sm">
                © {year} {brandLocales.footer_text}
            </p>
        </footer>
    );
};

export default Footer;
