/**
 * `TradieDetailPage`: route page at `/tradies/:id` showing the full
 * tradie profile inside the App_Shell. Replaces the previous
 * `TradieDetailDialog` popup.
 */

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/wrappers/page-header";
import { ImageLightbox } from "@/components/wrappers/image-lightbox";
import { useTradieDetailQuery } from "@/features/tradies/hooks/use-tradie-detail-query";
import { useApproveTradieMutation } from "@/features/tradies/hooks/use-approve-tradie-mutation";
import { TradieRejectDialog } from "@/features/tradies/components/tradie-reject-dialog";
import type { ApprovalStatus } from "@/features/tradies/tradies.types";

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

export default function TradieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: tradie,
    isLoading,
    isError,
    error,
    refetch,
  } = useTradieDetailQuery(id);
  const approveMutation = useApproveTradieMutation();
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

  const handleBack = React.useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/tradies");
    }
  }, [navigate]);

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
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
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="-ml-2 w-fit"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <PageHeader
        title={tradie?.businessName ?? "Tradie Details"}
        description="Review the full tradie profile and moderate their submission."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm text-destructive">
            {(error as Error)?.message ?? "Failed to load tradie."}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !tradie ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tradie not found.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => navigate("/tradies")}>
            Back to tradies
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6 rounded-md border border-border bg-card p-6">
            {/* Business Info */}
            <Section title="Business Info">
              <Field label="Business Name" value={tradie.businessName} />
              <Field label="ABN" value={tradie.abn} />
              <Field
                label="ABN Verified"
                value={tradie.abnVerified ? "Yes" : "No"}
              />
              <Field label="Business Number" value={tradie.businessNumber} />
              <Field label="Location" value={tradie.businessLocation} />
              <Field
                label="Website"
                value={
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
                  ) : (
                    "—"
                  )
                }
              />
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
              <Field
                label="Owner"
                value={`${tradie.user.name} (${tradie.user.email})`}
              />
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
                  <button
                    type="button"
                    onClick={() => setLightboxSrc(tradie.profilePhoto)}
                    className="mt-1 block cursor-pointer"
                  >
                    <img
                      src={tradie.profilePhoto}
                      alt="Profile"
                      className="h-24 w-24 rounded-md object-cover transition-opacity hover:opacity-80"
                    />
                  </button>
                </div>
              )}
              {tradie.businessImages && tradie.businessImages.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Business Images</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tradie.businessImages.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxSrc(url)}
                        className="cursor-pointer"
                      >
                        <img
                          src={url}
                          alt={`Business ${i + 1}`}
                          className="h-20 w-20 rounded-md object-cover transition-opacity hover:opacity-80"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {tradie.workPhotos.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Work Photos</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tradie.workPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setLightboxSrc(photo.imageUrl)}
                        className="cursor-pointer"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={`Work photo ${photo.sortOrder}`}
                          className="h-20 w-20 rounded-md object-cover transition-opacity hover:opacity-80"
                        />
                      </button>
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

          <div className="flex justify-end gap-2">
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
          </div>
        </>
      )}

      {id && (
        <TradieRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          tradieId={id}
        />
      )}

      <ImageLightbox
        src={lightboxSrc}
        open={!!lightboxSrc}
        onOpenChange={(open) => {
          if (!open) setLightboxSrc(null);
        }}
      />
    </div>
  );
}
