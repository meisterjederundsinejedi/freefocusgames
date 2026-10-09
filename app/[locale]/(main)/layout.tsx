import type { Metadata, Viewport } from "next";
import "../globals.css";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "next-themes";
import { Atkinson_Hyperlegible } from "next/font/google";
// import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getTranslations, getMessages, setRequestLocale } from 'next-intl/server';

// Atkinson Hyperlegible: free (OFL), designed for low-vision readers.
// next/font downloads it at build time and serves it from our own site,
// so it also works offline.
const atkinson = Atkinson_Hyperlegible({
    weight: ["400", "700"],
    subsets: ["latin", "latin-ext"],
    display: "swap",
    variable: "--font-atkinson",
});

export const dynamic = "force-static";

// Generate static params for all locales
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata' });

    return {
        title: {
            template: '%s | MamahJong',
            default: t('title'),
        },
        description: t('description'),
        // A private collection: keep it out of search engines.
        robots: { index: false, follow: false },
        applicationName: 'MamahJong',
        appleWebApp: {
            capable: true,
            title: 'MamahJong',
            statusBarStyle: 'default',
        },
    };
}

// 单独的 viewport 配置
export const generateViewport = (): Viewport => {
    return {
        width: 'device-width',
        initialScale: 1,
        // Never block zooming: some people need it.
    };
};

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // 确保 params 是已解析的对象
    const resolvedParams = await params;
    const { locale } = resolvedParams;

    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                {/* PWA primary color */}
                <meta name="theme-color" content="#f9f6ef" />
                {/* Windows */}
                <meta name="msapplication-TileColor" content="#f9f6ef" />

                {/* Polyfill for esbuild's keepNames/minification artifact in injected scripts */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.__name = window.__name || function(f){return f;};`,
                    }}
                />
            </head>
            <body
                className={cn(
                    atkinson.variable,
                    "min-h-screen bg-background font-sans antialiased"
                )}
            >
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                    >
                        <Layout>
                            {children}
                        </Layout>
                        <Toaster />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
