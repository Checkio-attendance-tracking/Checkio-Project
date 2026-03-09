import { Request, Response } from 'express';
import { CompanyRepository } from '../repositories/CompanyRepository';

const companyRepo = new CompanyRepository();

export class CompanyController {
  async getSettings(req: Request, res: Response) {
    try {
      if (!req.user?.companyId) {
        res.status(400).json({ message: "Company ID missing from token" });
        return;
      }
      
      const company = await companyRepo.findById(req.user!.companyId as string);
      
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      res.json({
        geofenceEnabled: company.geofenceEnabled,
        geofenceLat: company.geofenceLat,
        geofenceLng: company.geofenceLng,
        geofenceRadius: company.geofenceRadius
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching company settings" });
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      if (!req.user?.companyId) {
        res.status(400).json({ message: "Company ID missing from token" });
        return;
      }

      const { geofenceEnabled, geofenceLat, geofenceLng, geofenceRadius } = req.body;
      
      const updated = await companyRepo.update(req.user!.companyId as string, {
        geofenceEnabled: Boolean(geofenceEnabled),
        geofenceLat: geofenceLat !== undefined && geofenceLat !== null ? parseFloat(geofenceLat) : null,
        geofenceLng: geofenceLng !== undefined && geofenceLng !== null ? parseFloat(geofenceLng) : null,
        geofenceRadius: geofenceRadius ? parseInt(geofenceRadius) : 100
      });

      res.json({
        geofenceEnabled: updated.geofenceEnabled,
        geofenceLat: updated.geofenceLat,
        geofenceLng: updated.geofenceLng,
        geofenceRadius: updated.geofenceRadius
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating company settings" });
    }
  }
}
