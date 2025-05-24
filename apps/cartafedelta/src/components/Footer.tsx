import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="pb-6 mx-auto mt-6 text-center sm:mt-10">
            <p className="text-xs text-black sm:text-sm">
                © {year} Risparmio Casa Invest Srl - P. IVA 04389071004
            </p>
        </footer>
    );
};

export default Footer;
