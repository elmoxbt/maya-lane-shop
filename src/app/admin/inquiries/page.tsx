import { ExternalLink, Handshake, Mail } from "lucide-react";
import { getInquiries } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Brand inquiries" };

export default async function InquiriesPage() {
  const inquiries = await getInquiries();
  return (
    <>
      <PageHeader title="Brand inquiries" description="Submitted through the media kit contact form." />
      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <Handshake className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-semibold">No inquiries yet</p>
          <p className="text-sm text-muted-foreground">Share the media kit with brands to start getting partnership requests.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {inquiries.map((i) => (
            <li key={i.id} className="rounded-2xl border bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold">{i.company}</span>
                    <span className="rounded-full bg-ember-soft px-2.5 py-0.5 text-xs font-semibold text-ember-strong">{i.budget}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {i.name} ·{" "}
                    <a href={`mailto:${i.email}?subject=${encodeURIComponent(`Re: Partnership with Maya Lane`)}`} className="inline-flex items-center gap-1 text-ember-strong hover:underline">
                      <Mail className="size-3.5" aria-hidden /> {i.email}
                    </a>
                    {i.website && (
                      <>
                        {" "}
                        ·{" "}
                        <a href={i.website} target="_blank" rel="noreferrer nofollow" className="inline-flex items-center gap-1 hover:underline">
                          Website <ExternalLink className="size-3" aria-hidden />
                        </a>
                      </>
                    )}{" "}
                    · {formatDate(i.createdAt)}
                  </p>
                </div>
                <InquiryStatusSelect id={i.id} status={i.status} />
              </div>
              <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/85">{i.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
