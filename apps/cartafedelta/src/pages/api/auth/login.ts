import type { NextApiRequest, NextApiResponse } from 'next'
import * as jose from 'jose'
import * as cookie from 'cookie';

const countryCredentialsMap = new Map<string, string>([
    [ 'it', process.env.STORE_IT_PWD ],
    [ 'ch', process.env.STORE_CH_PWD ],
    [ 'mt', process.env.STORE_MT_PWD ]
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { password, countryCode } = req.body
    if (!countryCredentialsMap.has(countryCode) || (password != countryCredentialsMap.get(countryCode)))
        throw new Error('WrongCredentials');
 
    const currentDate = new Date();
    const jwtExpirationDate = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0) + (24 * 60 * 60 * 1000); // Date.now() + (5 * 60 * 1000);
    const refreshJWTExpirationDate = Date.now() + (5 * 24 * 60 * 60 * 1000);
    const secret = new TextEncoder().encode(process.env.JWT_SIGN_PRIVATE_KEY);
    const alg = 'HS256'; 
    const authToken = await new jose.SignJWT({ pseudoUser: 'store', countryCode, refreshUntil: refreshJWTExpirationDate })
        .setProtectedHeader({ alg })
        .setExpirationTime(new Date(jwtExpirationDate))
        .sign(secret);
    const authRefreshToken = await new jose.SignJWT({ pseudoUser: 'store', countryCode })
        .setProtectedHeader({ alg })
        .setExpirationTime(new Date(refreshJWTExpirationDate))
        .sign(secret);

    res.setHeader('Set-Cookie', [
        cookie.serialize('rica-auth-jwt', authToken, { path: '/', httpOnly: true, expires: new Date(jwtExpirationDate) }), 
        cookie.serialize('rica-auth-refresh-jwt', authRefreshToken, { path: '/api/auth', httpOnly: true, expires: new Date(refreshJWTExpirationDate) }),
        cookie.serialize('rica-auth-expiration', jwtExpirationDate.toString(), { path: '/', expires: new Date(refreshJWTExpirationDate) })
    ]);
    res.status(200).json({ success: true, data: { expirationDate: jwtExpirationDate } });
  } catch (error) {
    console.log(error);
    if (error.message === 'WrongCredentials') {
      res.status(401).json({ error: 'Invalid credentials.' })
    } else {
      res.status(500).json({ error: 'Something went wrong.' })
    }
  }
}