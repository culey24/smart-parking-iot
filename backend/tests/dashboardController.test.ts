import request from 'supertest';
import express from 'express';
import { DashboardController } from '../src/controllers/DashboardController';
import { NavigationService } from '../src/services/NavigationService';

jest.mock('../src/services/NavigationService');

const app = express();
app.get('/zones', DashboardController.getZonesByUsage);

describe('DashboardController', () => {
  it('GET /zones should return zones', async () => {
    (NavigationService.getZonesByUsage as jest.Mock).mockResolvedValue([
      { zoneId: 'A', zoneName: 'Zone A', capacity: 10, currentUsage: 2 }
    ]);

    const response = await request(app).get('/zones');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].zoneId).toBe('A');
  });
});
