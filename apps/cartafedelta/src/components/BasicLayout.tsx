import Head from "next/head";
import Footer from "./Footer";
import { ReactElement } from "react";
import resources from '../pages/customer/[brand]/index.resources.json';
import globalLocales from '@/dictionaries/global.locales.json';

export default function BasicLayout({ brand, children, ...pageProps }: { brand: string, children: ReactElement, paragraphTitle: string }) {
    return (
        <>
        <Head>
            <title>{globalLocales[brand]?.basicWindowTitle}</title>
            <link rel="icon" href={resources[brand].favicon} />
        </Head>
        <div className={`w-screen min-h-screen flex flex-col brand-${brand}`}>
            <header className="h-[110px] bg-brand-primary border-b border-gray-500">
                <img src={resources[brand].logo} alt={`${globalLocales[brand].brandName} logo`} className="mx-auto min-h-[107px]" />
            </header>
            <div className="container mx-auto grow flex flex-col">
                <div className="mx-auto mt-5 mb-5">
                    <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                        {pageProps.paragraphTitle}
                    </h1>
                </div>
                {children}
                <Footer brand={brand} />
            </div>
        </div>
      </>
    )
}