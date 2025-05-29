import { NextResponse, type NextRequest } from 'next/server'
import { managedCountryCodes } from './lib/_constants';
import * as jose from 'jose'
import * as cookie from 'cookie';

const publicStoreRoutes = ['/login', '/authRefresh'];

export async function middleware(request: NextRequest) {
    if ((request.nextUrl.pathname === '/store') || (request.nextUrl.pathname === '/store/'))
        return NextResponse.next();

    if (request.nextUrl.pathname.startsWith('/store') || request.nextUrl.pathname.startsWith('/uniprice/store')) {
        let brandPathPrefix = '';
        let pathname = request.nextUrl.pathname;
        if (pathname.startsWith('/uniprice/store')) {
            brandPathPrefix = '/uniprice';
            pathname = `/${pathname.split('/').slice(2).join('/')}`;
        }
        const countryCode = pathname.split('/')[2] ?? 'it';
        if (managedCountryCodes.indexOf(countryCode) === -1)
            return NextResponse.redirect(new URL('/404', request.nextUrl.origin));

        const relativeRoute = `/${pathname.split('/').slice(3).join('/')}`;
        console.log(relativeRoute);
        const cookies = cookie.parse(request.headers.get('cookie') ?? '');
        if (!publicStoreRoutes.includes(relativeRoute)) {
            try {
                const reqJWT = cookies['rica-auth-jwt'];

                if (!reqJWT)
                    throw new Error('NoJWT');

                const secret = new TextEncoder().encode(process.env.JWT_SIGN_PRIVATE_KEY);
                await jose.jwtVerify(reqJWT, secret);  
                
            } catch (err) {
                console.log(`${brandPathPrefix}/store/${countryCode}/login`);
                const response = NextResponse.redirect(new URL(`${brandPathPrefix}/store/${countryCode}/login`, request.nextUrl.origin));
                response.headers.set('Set-Cookie', cookie.serialize('rica-auth-jwt', null, { httpOnly: true, expires: new Date(Date.now() - (24 * 60 * 60 * 1000)) }));
                return response
            }
        }
    }

    return NextResponse.next();
}