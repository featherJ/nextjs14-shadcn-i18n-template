import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils";
import { serverSideTranslation } from '../i18n';
import { fallbackLng, languages } from '../i18n/settings';
import { Metadata } from 'next';
import { headers } from "next/headers";

import "@/styles/globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}


export async function generateMetadata({ params: { lng } }: { params: { lng: string } }): Promise<Metadata> {
  if (languages.indexOf(lng) < 0) lng = fallbackLng
  const { t } = await serverSideTranslation(lng)
  const headersList = headers();
  // read the custom x-url header
  let url = headersList.get('x-url') || "";
  let pathname = headersList.get('x-pathname') || "";
  let protocol = headersList.get('x-protocol') || "";
  let host = headersList.get('x-host') || "";
  for (let i = 0; i < languages.length; i++) {
    let l = languages[i];
    if (pathname.indexOf("/" + l) == 0) {
      pathname = pathname.slice(l.length + 1);
      break;
    }
  }

  let home = `${protocol}//${host}`;
  let ls: { [l: string]: string } = {};
  for (let i = 0; i < languages.length; i++) {
    let l = languages[i];
    ls[l] = `${home}/${l}${pathname}`;
  }
  const alternates = {
    canonical: url,
    languages: ls
  };

  return {
    title: t("home.title"),
    description: t("home.description"),
    keywords: t("home.keywords", { returnObjects: true }),
    authors: t("home.authors", { returnObjects: true }),
    creator: t("home.creator"),
    icons: t("home.icons", { returnObjects: true }),
    alternates: alternates,
    metadataBase: new URL(home),
    openGraph: {
      type: "website",
      locale: t("home.locale"),
      url: url,
      title: t("home.title"),
      description: t("home.description"),
      images: t("home.images", { returnObjects: true }),
      siteName: t("home.title"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("home.title"),
      description: t("home.description"),
      images: t("home.images", { returnObjects: true }),
      creator: t("home.creator")
    }
  };
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >{children}</body>
    </html>
  );
}
