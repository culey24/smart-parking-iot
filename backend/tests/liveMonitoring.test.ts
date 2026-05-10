import request from 'supertest';
import express from 'express';
import { DashboardController } from '../src/controllers/DashboardController';
import { NavigationService } from '../src/services/NavigationService';

// Mock NavigationService to avoid real DB
jest.mock('../src/services/NavigationService');

const app = express();
app.get('/dashboard/live-monitoring', DashboardController.getLiveMonitoring);

describe('DashboardController.getLiveMonitoring (SSE)', () => {
  it('should stream initial snapshot', async () => {
    // Mock snapshot data
    (NavigationService.streamLiveMonitoring as jest.Mock).mockImplementation(async (req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ type: 'snapshot', zones: [{ zoneId: 'A' }] })}\n\n`);
      res.end(); // end immediately for test
    });

    const response = await request(app).get('/dashboard/live-monitoring');

    expect(response.status).toBe(200);
    expect(response.text).toContain('"type":"snapshot"');
    expect(response.text).toContain('"zoneId":"A"');
  });
});
