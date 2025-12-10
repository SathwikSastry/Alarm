/**
 * AwakenX Cloud Functions
 * Firebase Cloud Functions for push notifications and analytics
 */

import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ==================== USER MANAGEMENT ====================

/**
 * Create a new user document when user signs up
 */
export const registerUser = onCall(async (request) => {
  const { uid, email, displayName } = request.data;

  if (!uid || !email) {
    throw new HttpsError('invalid-argument', 'Missing required fields: uid and email');
  }

  try {
    await db.collection('users').doc(uid).set({
      uid,
      email,
      displayName: displayName || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'dark',
        defaultChallengeLevel: 'medium',
        hapticFeedback: true,
        bedtimeReminder: false,
      },
      isPremium: false,
      premiumExpiresAt: null,
    });

    return { success: true, uid };
  } catch (error) {
    console.error('Error registering user:', error);
    throw new HttpsError('internal', 'Failed to register user');
  }
});

// ==================== ALARM MANAGEMENT ====================

/**
 * Get all alarms for a user
 */
export const getAlarms = onCall(async (request) => {
  const { userId } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'Missing userId');
  }

  try {
    const snapshot = await db
      .collection('alarms')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const alarms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { alarms };
  } catch (error) {
    console.error('Error getting alarms:', error);
    throw new HttpsError('internal', 'Failed to get alarms');
  }
});

/**
 * Create a new alarm
 */
export const createAlarm = onCall(async (request) => {
  const { userId, alarm } = request.data;

  if (!userId || !alarm) {
    throw new HttpsError('invalid-argument', 'Missing userId or alarm data');
  }

  try {
    const docRef = await db.collection('alarms').add({
      ...alarm,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, alarmId: docRef.id };
  } catch (error) {
    console.error('Error creating alarm:', error);
    throw new HttpsError('internal', 'Failed to create alarm');
  }
});

/**
 * Update an existing alarm
 */
export const updateAlarm = onCall(async (request) => {
  const { alarmId, updates } = request.data;

  if (!alarmId || !updates) {
    throw new HttpsError('invalid-argument', 'Missing alarmId or updates');
  }

  try {
    await db.collection('alarms').doc(alarmId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating alarm:', error);
    throw new HttpsError('internal', 'Failed to update alarm');
  }
});

/**
 * Delete an alarm
 */
export const deleteAlarm = onCall(async (request) => {
  const { alarmId } = request.data;

  if (!alarmId) {
    throw new HttpsError('invalid-argument', 'Missing alarmId');
  }

  try {
    await db.collection('alarms').doc(alarmId).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting alarm:', error);
    throw new HttpsError('internal', 'Failed to delete alarm');
  }
});

// ==================== PUSH NOTIFICATIONS ====================

/**
 * Send push notification to a specific user
 */
export const sendPushNotification = onCall(async (request) => {
  const { userId, title, body, data } = request.data;

  if (!userId || !title) {
    throw new HttpsError('invalid-argument', 'Missing userId or title');
  }

  try {
    // Get user's push token
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const pushToken = userData?.pushToken;

    if (!pushToken) {
      throw new HttpsError('not-found', 'User has no push token registered');
    }

    const message = {
      token: pushToken,
      notification: {
        title,
        body: body || '',
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'alarms',
          priority: 'max' as const,
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new HttpsError('internal', 'Failed to send notification');
  }
});

/**
 * Register push token for a user
 */
export const registerPushToken = onCall(async (request) => {
  const { userId, token, platform } = request.data;

  if (!userId || !token) {
    throw new HttpsError('invalid-argument', 'Missing userId or token');
  }

  try {
    await db.collection('users').doc(userId).update({
      pushToken: token,
      pushTokenPlatform: platform || 'unknown',
      pushTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error registering push token:', error);
    throw new HttpsError('internal', 'Failed to register push token');
  }
});

// ==================== ANALYTICS ====================

/**
 * Save analytics event
 */
export const saveAnalytics = onCall(async (request) => {
  const { userId, event } = request.data;

  if (!userId || !event) {
    throw new HttpsError('invalid-argument', 'Missing userId or event data');
  }

  try {
    await db.collection('analytics').add({
      ...event,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving analytics:', error);
    throw new HttpsError('internal', 'Failed to save analytics');
  }
});

/**
 * Get personalized wake-up recommendations based on user analytics
 */
export const getRecommendations = onCall(async (request) => {
  const { userId } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'Missing userId');
  }

  try {
    // Get user's analytics from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analyticsSnapshot = await db
      .collection('analytics')
      .where('userId', '==', userId)
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();

    const analytics = analyticsSnapshot.docs.map((doc) => doc.data());

    // Calculate recommendations (simplified ML-like logic)
    const recommendations = calculateRecommendations(analytics);

    return { recommendations };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw new HttpsError('internal', 'Failed to get recommendations');
  }
});

/**
 * Calculate personalized recommendations based on analytics
 */
function calculateRecommendations(analytics: FirebaseFirestore.DocumentData[]) {
  if (analytics.length === 0) {
    return {
      suggestedTime: '07:00',
      reason: 'Start with a standard wake-up time',
      basedOn: ['default'],
      confidence: 0.5,
    };
  }

  // Calculate average dismiss time
  const avgDismissTime =
    analytics.reduce((sum, a) => sum + (a.timeTakenToDismiss || 0), 0) / analytics.length;

  // Calculate most successful challenge
  const challengeSuccess: Record<string, { success: number; total: number }> = {};
  analytics.forEach((a) => {
    const challenge = a.challengeUsed || 'math';
    if (!challengeSuccess[challenge]) {
      challengeSuccess[challenge] = { success: 0, total: 0 };
    }
    challengeSuccess[challenge].total++;
    if (a.successChallenge) {
      challengeSuccess[challenge].success++;
    }
  });

  const bestChallenge = Object.entries(challengeSuccess).sort(
    (a, b) => b[1].success / b[1].total - a[1].success / a[1].total
  )[0];

  // Calculate consistency
  const consistency = Math.min(1, analytics.length / 14); // 14 days of data = max consistency

  return {
    suggestedTime: '06:45',
    reason: `Based on your ${analytics.length} days of data, you wake up best with ${bestChallenge?.[0] || 'math'} challenges`,
    basedOn: ['analytics', 'challenge_success', 'wake_time_patterns'],
    confidence: consistency,
    stats: {
      averageDismissTime: Math.round(avgDismissTime),
      bestChallenge: bestChallenge?.[0] || 'math',
      totalDataPoints: analytics.length,
    },
  };
}

// ==================== SCHEDULED TASKS ====================

/**
 * Clean up old analytics data (run weekly)
 */
export const cleanupOldData = onSchedule('every sunday 03:00', async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180); // Keep 180 days of data

  try {
    const oldAnalytics = await db
      .collection('analytics')
      .where('createdAt', '<', cutoffDate)
      .get();

    const batch = db.batch();
    oldAnalytics.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${oldAnalytics.docs.length} old analytics records`);
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
});

// ==================== FIRESTORE TRIGGERS ====================

/**
 * When a new alarm is created, schedule a welcome notification
 */
export const onAlarmCreated = onDocumentCreated('alarms/{alarmId}', async (event) => {
  const alarm = event.data?.data();
  if (!alarm) return;

  const userId = alarm.userId;
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const pushToken = userData?.pushToken;

    if (pushToken && alarm.isEnabled) {
      // Send confirmation notification
      await messaging.send({
        token: pushToken,
        notification: {
          title: '⏰ Alarm Set!',
          body: `Your ${alarm.time} alarm is ready. Get some good sleep!`,
        },
        data: {
          alarmId: event.params.alarmId,
          type: 'alarm_created',
        },
      });
    }
  } catch (error) {
    console.error('Error sending alarm created notification:', error);
  }
});

/**
 * When an alarm is updated, log the change
 */
export const onAlarmUpdated = onDocumentUpdated('alarms/{alarmId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after) return;

  // Log significant changes
  if (before.isEnabled !== after.isEnabled) {
    console.log(
      `Alarm ${event.params.alarmId} ${after.isEnabled ? 'enabled' : 'disabled'}`
    );
  }
});

// ==================== HTTP ENDPOINTS ====================

/**
 * Health check endpoint
 */
export const healthCheck = onRequest((req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AwakenX Cloud Functions',
  });
});
