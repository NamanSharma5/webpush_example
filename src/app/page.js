'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NotificationsPage() {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [permissionState, setPermissionState] = useState(null);
  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(false);

  const VAPID_PUBLIC_KEY = 'BAwUJxIa7mJZMqu78Tfy2Sb1BWnYiAatFCe1cxpnM-hxNtXjAwaNKz1QKLU8IYYhjUASOFzSvSnMgC00vfsU0IM';

  // Initialize Service Worker and Push Notifications
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker is not supported in this browser.');
      return;
    }

    async function initServiceWorker() {
      try {
        const swRegistration = await navigator.serviceWorker.register('/serviceworker.js');
        console.log('Service Worker registered:', swRegistration);

        const pushManager = swRegistration.pushManager;
        if (!isPushManagerActive(pushManager)) return;

        const state = await pushManager.permissionState({ userVisibleOnly: true });
        setPermissionState(state);

        if (state === 'granted') {
          console.log('Permission has been granted in initSW.');
          const subscription = await pushManager.getSubscription();
          setSubscriptionInfo(subscription);
        } else if (state === 'prompt') {
          console.log('Permission is in prompt state in initSW.');
        } else if (state === 'denied') {
          console.warn('Permission has been denied in initSW.');
        }
      } catch (error) {
        console.error('Error initializing Service Worker:', error);
      }
    }

    function isPushManagerActive(pushManager) {
      if (!pushManager) {
        if (!window.navigator.standalone) {
          setShowAddToHomeScreen(true);
        } else {
          console.error('PushManager is not active.');
        }
        return false;
      }
      return true;
    }

    initServiceWorker();
  }, []);

  // Subscribe to Push Notifications
  async function subscribeToPush() {
    try {
      const swRegistration = await navigator.serviceWorker.getRegistration();
      const pushManager = swRegistration.pushManager;
      if (!pushManager) return;

      const subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      };
      const subscription = await pushManager.subscribe(subscriptionOptions);
      setSubscriptionInfo(subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  // Test sending push notification
  async function testSend() {
    const title = 'Push title';
    const options = {
      body: 'Additional text with some description',
      icon: '/images/push_icon.jpg',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/1920px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg',
      data: {
        url: '/?page=success',
        message_id: 'your_internal_unique_message_id_for_tracking',
      },
    };
    const serviceWorker = await navigator.serviceWorker.ready;
    await serviceWorker.showNotification(title, options);
    console.log('Test push notification sent.');
  }

  return (
    <>
      <html>
        <Head>
          <title>WebPush iOS Example</title>
          <link rel="manifest" href="/manifest.json" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <link rel="apple-touch-icon" href="/images/favicon.png" />
        </Head>
          <body>
          {/* A wrapper div that can set the background color, font, etc.
              If you prefer, move these classes to your global stylesheet or layout. */}
          <div className="min-h-screen bg-[#cfc7e2] font-sans text-lg pb-12">
            <div className="max-w-3xl mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">WebPush iOS Example</h1>
              <div id="content">
                {showAddToHomeScreen && (
                  <div
                    id="add-to-home-screen"
                    className="bg-orange-100 p-4 mb-4 rounded"
                  >
                    <p>
                      For WebPush to work on iOS, you may need to add this website to the
                      Home Screen (window.navigator is not standalone).
                    </p>
                    <img
                      src="/images/webpush-add-to-home-screen.jpg"
                      alt="Add to home screen"
                      className="block mx-auto pt-2 max-h-[500px] max-w-full"
                    />
                  </div>
                )}

                {/* This normally hides itself on iOS Safari due to @supports(-webkit-touch-callout) logic.
                    If you still need that, consider adding a custom CSS or a media query for iOS. */}
                <div id="scan-qr-code" className="mb-4">
                  <p>Open this page on your iPhone/iPad:</p>
                  <img
                    src="/images/qrcode.png"
                    alt="QR Code"
                    className="block max-w-full h-auto"
                  />
                </div>

                {/* Conditionally show Subscribe button if permission is 'prompt' or null */}
                {(permissionState === null || permissionState === 'prompt') && (
                  <button
                    id="subscribe_btn"
                    onClick={subscribeToPush}
                    className="block w-full p-3 mt-4 text-white bg-blue-600 hover:bg-blue-700 rounded text-base"
                  >
                    Subscribe to Notifications
                  </button>
                )}

                {/* If a subscription exists, display it */}
                {subscriptionInfo && (
                  <div
                    id="active_sub"
                    className="bg-[#e7e7ff] p-4 my-4 rounded break-words whitespace-pre-wrap"
                  >
                    <b>Active subscription:</b>
                    <pre className="mt-2 text-sm">
                      {JSON.stringify(subscriptionInfo.toJSON(), null, 2)}
                    </pre>
                  </div>
                )}

                {/* If permission is granted, show the test send button */}
                {permissionState === 'granted' && (
                  <button
                    id="test_send_btn"
                    onClick={testSend}
                    className="block w-full p-3 mt-4 text-white bg-green-600 hover:bg-green-700 rounded text-base"
                  >
                    Send Test Push
                  </button>
                )}
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  );
}