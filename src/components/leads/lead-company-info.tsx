import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Globe,
  Briefcase,
  MapPin,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { DetailItem } from './detail-item';
import type { Lead } from '@/types/lead';
import type { LeadDetail } from '@/types/lead-detail';

interface LeadCompanyInfoProps {
  lead: Lead;
  leadDetail: LeadDetail | undefined;
}

export function LeadCompanyInfo({ lead, leadDetail }: LeadCompanyInfoProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        Company Information
      </h3>
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* 1. Company */}
          <DetailItem
            label="Company"
            icon={<Building2 className="h-4 w-4 text-blue-500" />}
            value={lead.company}
          />

          {/* 2. DBD Sector */}
          {(leadDetail?.dbdSector || lead.dbdSector) && (
            <DetailItem
              label="DBD Sector"
              icon={<Briefcase className="h-4 w-4 text-teal-500" />}
              value={
                <Badge variant="secondary">{leadDetail?.dbdSector || lead.dbdSector}</Badge>
              }
            />
          )}

          {/* 3. Industry (changed from "Industry (AI)") */}
          {(leadDetail?.industry || lead.industryAI) && (
            <DetailItem
              label="Industry"
              icon={<Briefcase className="h-4 w-4 text-amber-500" />}
              value={leadDetail?.industry || lead.industryAI}
            />
          )}

          {/* 4. Juristic ID */}
          {(leadDetail?.juristicId || lead.juristicId) && (
            <DetailItem
              label="Juristic ID"
              icon={<FileText className="h-4 w-4 text-indigo-500" />}
              value={leadDetail?.juristicId || lead.juristicId}
            />
          )}

          {/* 5. Capital */}
          {(leadDetail?.capital || lead.capital) && (
            <DetailItem
              label="Capital"
              icon={<Building2 className="h-4 w-4 text-gray-500" />}
              value={leadDetail?.capital || lead.capital}
            />
          )}

          {/* 6. Website */}
          {(leadDetail?.website || lead.website) && (
            <DetailItem
              label="Website"
              icon={<Globe className="h-4 w-4 text-green-500" />}
              value={
                <a
                  href={(leadDetail?.website || lead.website || '').startsWith('http')
                    ? (leadDetail?.website || lead.website || '')
                    : `https://${leadDetail?.website || lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                  aria-label={`Visit website ${leadDetail?.website || lead.website}`}
                >
                  {leadDetail?.website || lead.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}

          {/* 7. Address */}
          {(leadDetail?.fullAddress || lead.fullAddress) && (
            <DetailItem
              label="Address"
              icon={<MapPin className="h-4 w-4 text-orange-500" />}
              value={leadDetail?.fullAddress || lead.fullAddress}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
