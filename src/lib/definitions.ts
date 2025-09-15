import { z } from 'zod';

export const propertyTypes = ['SingleFamily', 'Condo', 'Townhouse', 'MultiFamily', 'Land'] as const;
export const leadStatuses = ['New', 'Contacted', 'Showing', 'UnderContract', 'Closed', 'Lost'] as const;
export const leadTimelines = ['ASAP', 'OneThreeMonths', 'ThreeSixMonths', 'SixPlusMonths'] as const;

export type PropertyType = (typeof propertyTypes)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type LeadTimeline = (typeof leadTimelines)[number];

export const timelineLabels: Record<LeadTimeline, string> = {
  ASAP: 'ASAP',
  OneThreeMonths: '1-3 Months',
  ThreeSixMonths: '3-6 Months',
  SixPlusMonths: '6+ Months',
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  SingleFamily: 'Single Family',
  Condo: 'Condo',
  Townhouse: 'Townhouse',
  MultiFamily: 'Multi Family',
  Land: 'Land',
};

export const LeadSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.').optional().or(z.literal('')),
  city: z.string().min(2, 'City must be at least 2 characters.'),
  propertyType: z.enum(propertyTypes),
  status: z.enum(leadStatuses),
  timeline: z.enum(leadTimelines),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;
