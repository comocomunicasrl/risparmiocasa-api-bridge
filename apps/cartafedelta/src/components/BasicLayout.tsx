import Head from "next/head";
import Footer from "./Footer";
import { ReactElement } from "react";

export default function BasicLayout({ children, ...pageProps }: { children: ReactElement, paragraphTitle: string }) {
    return (
        <>
        <Head>
            <title>Risparmio Casa</title>
            <link rel="icon" href="/favicon.png" />
        </Head>
        <div className="w-screen min-h-screen flex flex-col">
            <header className="h-[110px] bg-risparmiocasa-blue border-b border-gray-500">
                <img src="/logo.png" alt="Risparmiocasa logo" className="mx-auto" />
            </header>
            <div className="container mx-auto grow flex flex-col">
                <div className="mx-auto mt-5 mb-5">
                    <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                        {pageProps.paragraphTitle}
                    </h1>
                </div>
                {children}
                <Footer />
            </div>
        </div>
      </>
    )
}