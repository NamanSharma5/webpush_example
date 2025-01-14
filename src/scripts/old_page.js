// pages/index.js
'use client'
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
    // If you want to run something on mount, or just let the script tag handle it
    // If you keep your same "frontend.js" code in /public/frontend.js,
    // you can load it with a Next.js <Script> below
  }, []);

  return (
    <>
      <Head>
        <title>WebPush iOS example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" href="/images/favicon.png"/>
        <link rel="apple-touch-icon" href="/images/favicon.png" />
        <style>{`
          body {background-color: #cfc7e2;font-family: Arial, sans-serif;font-size: 18px;padding-bottom: 50px;}
          .wrapper {max-width: 800px;margin: 0 auto;}
          @supports (-webkit-touch-callout: none) {#scan-qr-code {display: none;}}
          #add-to-home-screen {display: none;background-color: bisque;padding: 10px;}
          #add-to-home-screen img {display: block;margin: 0 auto;padding-top: 10px;max-height: 500px;max-width: 100%}
          #scan-qr-code img {display: block;max-width: 100%}
          #subscribe_btn, #test_send_btn {display: none;width: 100%;line-height: 2;font-size: 20px;margin-top: 10px;}
          #active_sub {display: none;background-color: #e7e7ff;padding: 20px;word-wrap: break-word;}
          #source_link {position: fixed;bottom: 10px;color: #fff;background-color: rgba(0,0,0,0.5);padding: 5px;left: 10px;}
        `}</style>
      </Head>

      <div className="wrapper">
        <h1>WebPush iOS example</h1>
        <div id="content">
          <div id="add-to-home-screen">
            For WebPush to work on iOS, you may need to add this website
            to the Home Screen (window.navigator is not standalone).
            <img src="/images/webpush-add-to-home-screen.jpg" alt="webpush add to home screen"/>
          </div>

          <div id="scan-qr-code">
            Open this page on your iPhone/iPad:
            <img src="/images/qrcode.png" alt="qrCode"/>
            <br/><br/>
          </div>

          <button id="subscribe_btn" onClick={() => { /* can also do subscribeToPush() directly here */ }}>
            Subscribe to notifications
          </button>

          <div id="active_sub"></div>

          <button id="test_send_btn" onClick={() => { /* call testSend() here or from window scope */ }}>
            Send test push
          </button>
        </div>
      </div>

      {/* Load your existing frontend.js from /public */}
      <Script src="/frontend.js" strategy="afterInteractive" />
    </>
  );
}
