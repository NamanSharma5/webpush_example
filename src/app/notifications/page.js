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
      <Head>
        <title>WebPush iOS Example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
        <link rel="apple-touch-icon" href="/images/favicon.png" />
        <style>{`
          body { background-color: #cfc7e2; font-family: Arial, sans-serif; font-size: 18px; padding-bottom: 50px; }
          .wrapper { max-width: 800px; margin: 0 auto; }
          @supports (-webkit-touch-callout: none) { #scan-qr-code { display: none; } }
          #add-to-home-screen { display: none; background-color: bisque; padding: 10px; }
          #add-to-home-screen img { display: block; margin: 0 auto; padding-top: 10px; max-height: 500px; max-width: 100%; }
          #scan-qr-code img { display: block; max-width: 100%; }
          #subscribe_btn, #test_send_btn { display: none; width: 100%; line-height: 2; font-size: 20px; margin-top: 10px; }
          #active_sub { background-color: #e7e7ff; padding: 20px; word-wrap: break-word; }
          #source_link { position: fixed; bottom: 10px; color: #fff; background-color: rgba(0,0,0,0.5); padding: 5px; left: 10px; }
          button {
            display: block;
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            font-size: 18px;
            color: #fff;
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
          }
          button:hover {
            background-color: #0056b3;
          }
        `}</style>
      </Head>

      <div className="wrapper">
        <h1>WebPush iOS Example</h1>
        <div id="content">
          {showAddToHomeScreen && (
            <div id="add-to-home-screen">
              For WebPush to work on iOS, you may need to add this website to the Home Screen (window.navigator is not standalone).
              <img src="/images/webpush-add-to-home-screen.jpg" alt="Add to home screen" />
            </div>
          )}

          <div id="scan-qr-code">
            Open this page on your iPhone/iPad:
            <img src="/images/qrcode.png" alt="QR Code" />
          </div>

          {(permissionState === null || permissionState === 'prompt') && (
            <button id="subscribe_btn" onClick={subscribeToPush}>
              Subscribe to Notifications
            </button>
          )}

          {subscriptionInfo && (
            <div id="active_sub">
              <b>Active subscription:</b>
              <pre>{JSON.stringify(subscriptionInfo.toJSON(), null, 2)}</pre>
            </div>
          )}

          {permissionState === 'granted' && (
            <button id="test_send_btn" onClick={testSend}>
              Send Test Push
            </button>
          )}
        </div>
      </div>
    </>
  );
}
