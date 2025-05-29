import { NextPage } from 'next';
import BasicLayout from '@/components/BasicLayout';
import Link from 'next/link';

const Page: NextPage = () => {
    return (
        <>
            <BasicLayout brand="rica" paragraphTitle="Modulo sottoscrizione carta fedeltà">
                <div className="flex flex-col border border-t-0 shadow min-h-[500px]">
                    <div className="flex flex-col gap-24 grow p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue overflow-hidden">
                        <div className="flex justify-center text-2xl">
                            Seleziona la nazione per iniziare
                        </div>
                        <div className="grow flex flex-row gap-32 items-start justify-center flex-wrap gap-y-1 text-2xl">
                            <Link href="/store/it">
                                <div className="flex flex-col justify-center items-center gap-4 cursor-pointer">
                                    <img src='/italy.svg' className='h-32'/>
                                    <span>Italia</span>
                                </div>
                            </Link>
                            <Link href="/store/ch">
                                <div className="flex flex-col justify-center items-center gap-4 cursor-pointer">
                                    <img src='/swiss.svg' className='h-32'/>
                                    <span>Svizzera</span>
                                </div>
                            </Link>
                            <Link href="/store/mt">
                                <div className="flex flex-col justify-center items-center gap-4 cursor-pointer">
                                    <img src='/malta.svg' className='h-32'/>
                                    <span>Malta</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </BasicLayout>
        </>
    );
};

export default Page;
