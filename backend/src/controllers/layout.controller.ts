import { Request, Response } from 'express';
import MappingConfig from '../models/MappingConfig';

export const getLayoutMapping = async (req: Request, res: Response) => {
  try {
    const facilityId = String(req.query.facilityId || 'CAMPUS_PARKING_ALPHA');
    let config = await MappingConfig.findOne({ facilityId });
    
    if (!config) {
      // Return empty layout if not found, don't error
      return res.status(200).json({ layout: [] });
    }
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving layout mapping', error });
  }
};

export const updateLayoutMapping = async (req: Request, res: Response) => {
  try {
    const facilityId = String(req.body.facilityId || 'CAMPUS_PARKING_ALPHA');
    const { layout } = req.body;
    
    if (!layout || !Array.isArray(layout)) {
      return res.status(400).json({ message: 'Invalid layout data' });
    }

    const config = await MappingConfig.findOneAndUpdate(
      { facilityId },
      { layout, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Layout synced successfully', config });
  } catch (error) {
    res.status(500).json({ message: 'Error updating layout mapping', error });
  }
};
