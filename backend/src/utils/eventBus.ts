import { EventEmitter } from 'events';

/**
 * Central in-process event bus for SSE broadcasting.
 * 
 * Events:
 *   'monitoring:snapshot' — triggers a full data re-push to all SSE clients
 *   'monitoring:log'      — { logId, timestamp, level, source, message, sessionId?, deviceId? }
 *   'monitoring:vehicle'  — { event, sessionId, plateNumber, userType, path }
 */
export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100); // allow many SSE client registrations
