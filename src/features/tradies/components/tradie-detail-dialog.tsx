/**
 * `TradieDetailDialog`: full-screen dialog showing all tradie profile
 * fields organized in sections. Action buttons in the footer are
 * conditional on the current profile status.
 */

import * as React from "react";
import { Download, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTradieDetailQuery } from "@/features/tradies/hooks/use-tradie-detail-query";
import { useApproveTradieMutation } from "@/features/tradies/hooks/use-approve-tradie-mutation";
import { TradieRejectDialog } from "@/features/tradies/components/tradie-reject-dialog";
import type { ApprovalStatus } from "@/features/tradies/tradies.types";

export interface TradieDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradieId: string | undefined;
}

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMATTER.format(date);
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const variant =
    status === "approved"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-[140px] shrink-0 text-muted-foreground">
        {label}
      </span>
      <span className="text-foreground">{value ?? "—"}</span>
    </div>
  );
}

function DocumentLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

export function TradieDetailDialog({
  open,
  onOpenChange,
  tradieId,
}: TradieDetailDialogProps) {
  const { data: tradie, isLoading } = useTradieDetailQuery(tradieId);
  const approveMutation = useApproveTradieMutation();
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const handleApprove = async () => {
    if (!tradieId) return;
    try {
      await approveMutation.mutateAsync(tradieId);
    } catch {
      // Error toast handled by mutation
    }
  };

  const showApprove =
    tradie?.profileStatus === "pending" ||
    tradie?.profileStatus === "rejected";
  const showReject =
    tradie?.profileStatus === "pending" ||
    tradie?.profileStatus === "approved";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {tradie?.businessName ?? "Tradie Details"}
            </DialogTitle>
          </DialogHeader>

          {isLoading || !tradie ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Business Info */}
              <Section title="Business Info">
                <Field label="Business Name" value={tradie.businessName} />
                <Field label="ABN" value={tradie.abn} />
                <Field
                  label="ABN Verified"
                  value={tradie.abnVerified ? "Yes" : "No"}
                />
                <Field label="Location" value={tradie.businessLocation} />
                <Field label="Website" value={
                  tradie.website ? (
                    <a
                      href={tradie.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {tradie.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : "—"
                } />
                <Field label="Description" value={tradie.serviceDescription} />
                <Field label="Bio" value={tradie.bio} />
                <Field
                  label="Experience"
                  value={`${tradie.yearsOfExperience} years`}
                />
                <Field label="Awards" value={tradie.awards} />
                <Field
                  label="Service Radius"
                  value={
                    tradie.serviceRadiusKm
                      ? `${tradie.serviceRadiusKm} km`
                      : "—"
                  }
                />
                <Field label="Owner" value={`${tradie.user.name} (${tradie.user.email})`} />
                <Field label="Registered" value={formatDate(tradie.createdAt)} />
              </Section>

              {/* Services & Regions */}
              <Section title="Services & Regions">
                <Field
                  label="Services"
                  value={
                    tradie.services.length > 0
                      ? tradie.services.map((s) => s.name).join(", ")
                      : "None"
                  }
                />
                <Field
                  label="Regions"
                  value={
                    tradie.serviceRegions.length > 0
                      ? tradie.serviceRegions.map((r) => r.name).join(", ")
                      : "None"
                  }
                />
              </Section>

              {/* Operating Hours */}
              <Section title="Operating Hours">
                <Field
                  label="Available"
                  value={tradie.isAvailable ? "Yes" : "No"}
                />
                <Field
                  label="Hours"
                  value={
                    tradie.timeFrom && tradie.timeTo
                      ? `${tradie.timeFrom} – ${tradie.timeTo}`
                      : "—"
                  }
                />
                <Field
                  label="Open Days"
                  value={
                    tradie.openDays && tradie.openDays.length > 0
                      ? tradie.openDays.join(", ")
                      : "—"
                  }
                />
                <Field
                  label="Emergency"
                  value={tradie.isEmergencyAvailable ? "Yes" : "No"}
                />
              </Section>

              {/* Licensing & Insurance */}
              <Section title="Licensing & Insurance">
                <Field
                  label="Has License"
                  value={tradie.hasLicense ? "Yes" : "No"}
                />
                <Field label="License #" value={tradie.licenseNumber} />
                <Field
                  label="License Expiry"
                  value={formatDate(tradie.licenseExpiryDate)}
                />
                <Field
                  label="Insurance Verified"
                  value={tradie.insuranceVerified ? "Yes" : "No"}
                />
                <Field
                  label="Insurance Expiry"
                  value={formatDate(tradie.insuranceExpiryDate)}
                />
              </Section>

              {/* Media */}
              <Section title="Media">
                {tradie.profilePhoto && (
                  <div>
                    <span className="text-muted-foreground">Profile Photo</span>
                    <img
                      src={tradie.profilePhoto}
                      alt="Profile"
                      className="mt-1 h-24 w-24 rounded-md object-cover"
                    />
                  </div>
                )}
                {tradie.businessImages && tradie.businessImages.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">
                      Business Images
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tradie.businessImages.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Business ${i + 1}`}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {tradie.workPhotos.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Work Photos</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tradie.workPhotos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.imageUrl}
                          alt={`Work photo ${photo.sortOrder}`}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {tradie.introVideoUrl && (
                  <div>
                    <span className="text-muted-foreground">Intro Video</span>
                    <div className="mt-1">
                      <a
                        href={tradie.introVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        View video
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </Section>

              {/* Documents */}
              <Section title="Documents">
                <div className="flex flex-wrap gap-4">
                  <DocumentLink
                    label="Trade License"
                    url={tradie.tradeLicenseUrl}
                  />
                  <DocumentLink
                    label="Public Liability Insurance"
                    url={tradie.publicLiabilityInsuranceUrl}
                  />
                  <DocumentLink label="ID Proof" url={tradie.idProofUrl} />
                  <DocumentLink
                    label="Insurance Certificate"
                    url={tradie.insuranceUrl}
                  />
                </div>
                {!tradie.tradeLicenseUrl &&
                  !tradie.publicLiabilityInsuranceUrl &&
                  !tradie.idProofUrl &&
                  !tradie.insuranceUrl && (
                    <span className="text-muted-foreground">
                      No documents uploaded.
                    </span>
                  )}
              </Section>

              {/* Status */}
              <Section title="Status">
                <Field
                  label="Profile Status"
                  value={<StatusBadge status={tradie.profileStatus} />}
                />
                {tradie.rejectionReason && (
                  <Field
                    label="Rejection Reason"
                    value={tradie.rejectionReason}
                  />
                )}
              </Section>
            </div>
          )}

          <DialogFooter>
            {showApprove && (
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Approving…" : "Approve"}
              </Button>
            )}
            {showReject && (
              <Button
                variant="destructive"
                onClick={() => setRejectOpen(true)}
                disabled={approveMutation.isPending}
              >
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tradieId && (
        <TradieRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          tradieId={tradieId}
        />
      )}
    </>
  );
}
