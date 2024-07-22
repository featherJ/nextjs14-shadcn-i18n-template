import { cookieName, fallbackLng, languages } from '@/app/i18n/settings'
import acceptLanguage from 'accept-language'
import { NextRequest, NextResponse } from 'next/server'

acceptLanguage.languages(languages)

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|sw.js).*)']
}

function fixHeader(resp:NextResponse,req: NextRequest):void{
    resp.headers.set('x-url', req.url);
    resp.headers.set('x-pathname', req.nextUrl.pathname);
    resp.headers.set('x-protocol', req.nextUrl.protocol);
    resp.headers.set('x-host', req.nextUrl.host);
}

export function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.indexOf('icon') > -1 || 
    req.nextUrl.pathname.indexOf('chrome') > -1
  ){
    let response = NextResponse.next();
    fixHeader(response,req);
    return response;
  }
  
  
  let lng: string | undefined | null
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  // Redirect if lng in path is not supported
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    let response = NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url));
    fixHeader(response,req);
    return response
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer') || '')
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
    const response = NextResponse.next()
    if (lngInReferer){
      response.cookies.set(cookieName, lngInReferer)
    }
    fixHeader(response,req);
    return response
  }
  let response = NextResponse.next();
  fixHeader(response,req);
  return response;
}
