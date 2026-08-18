import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Award,
  CalendarDays,
  CheckCircle2,
  Download,
  FlaskConical,
  GraduationCap,
  Medal,
  Printer,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../api/axios";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(dateValue)
  );
}

/* =========================================================
   PAGE
========================================================= */

function CertificateDetailsPage() {
  const { id } = useParams();

  const certificateRef =
    useRef(null);

  const [
    certificate,
    setCertificate,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    const loadCertificate =
      async () => {
        try {
          const response =
            await api.get(
              `/certificates/${id}`
            );

          setCertificate(
            response.data
              .certificate
          );
        } catch (error) {
          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load certificate."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCertificate();
  }, [id]);

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {
    window.print();
  };

  /*
    For now Download PDF uses the
    browser's print-to-PDF system.

    Later we can generate a dedicated
    PDF from the backend.
  */

  const handleDownload = () => {
    toast(
      "Choose 'Save as PDF' in the print window."
    );

    window.print();
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 font-bold text-slate-500">
            Loading certificate...
          </p>
        </div>
      </main>
    );
  }

  if (!certificate) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-100">
        <div className="text-center">
          <Award
            size={48}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-black">
            Certificate not found
          </h2>

          <Link
            to="/student/certificates"
            className="mt-5 inline-block font-bold text-teal-600"
          >
            Back to certificates
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="certificate-page bg-slate-100 px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-[1350px]">
        {/* =================================================
            ACTION BAR
        ================================================= */}

        <div className="no-print mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <Link
            to="/student/certificates"
            className="font-bold text-slate-600 transition hover:text-teal-700"
          >
            ← Back to certificates
          </Link>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-black text-slate-700 transition hover:bg-slate-50"
            >
              <Printer
                size={17}
              />

              Print
            </button>

            <button
              type="button"
              onClick={
                handleDownload
              }
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-black text-white transition hover:bg-teal-700"
            >
              <Download
                size={17}
              />

              Download PDF
            </button>
          </div>
        </div>

        {/* =================================================
            CERTIFICATE
        ================================================= */}

        <section
          ref={certificateRef}
          id="bionova-certificate"
          className="certificate-sheet relative overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Outer border */}

          <div className="absolute inset-4 rounded-2xl border-2 border-violet-200" />

          <div className="absolute inset-7 rounded-xl border border-amber-300/70" />

          {/* Decoration */}

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-50" />

          <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-violet-50" />

          <div className="absolute right-14 top-14 opacity-[0.04]">
            <FlaskConical
              size={220}
            />
          </div>

          {/* CONTENT */}

          <div className="relative flex min-h-[760px] flex-col items-center px-12 py-14 text-center sm:px-20">
            {/* BRAND */}

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-xl font-black text-white">
                B
              </div>

              <div className="text-left">
                <p className="text-2xl font-black text-slate-950">
                  BioNova
                </p>

                <p className="text-sm text-slate-500">
                  Biotechnology
                  Learning Platform
                </p>
              </div>
            </div>

            {/* TYPE */}

            <div className="mt-9">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-violet-600">
                Certificate of
                Achievement
              </p>

              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 via-blue-500 to-violet-600" />
            </div>

            {/* TEXT */}

            <p className="mt-8 text-slate-500">
              This certificate is
              proudly presented to
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {
                certificate.student_name
              }
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600">
              for successfully
              completing the BioNova
              biotechnology
              assessment
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-black text-teal-700">
              {
                certificate.quiz_title
              }
            </h2>

            <div className="mt-3 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-black text-teal-700">
              {
                certificate.category_name
              }
            </div>

            {/* PERFORMANCE */}

            <div className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              <CertificateMetric
                icon={Medal}
                label="Score"
                value={`${Number(
                  certificate.score ||
                    0
                ).toFixed(0)}%`}
              />

              <CertificateMetric
                icon={GraduationCap}
                label="Grade"
                value={
                  certificate.grade
                }
              />

              <CertificateMetric
                icon={
                  CalendarDays
                }
                label="Issued"
                value={formatDate(
                  certificate.issued_at
                )}
              />

              <CertificateMetric
                icon={
                  ShieldCheck
                }
                label="Status"
                value={
                  certificate.status
                }
              />
            </div>

            {/* SIGNATURE AREA */}

            <div className="mt-auto grid w-full max-w-4xl gap-8 pt-12 sm:grid-cols-3">
              <Signature
                title="BioNova Learning"
                subtitle="Learning Platform"
              />

              <div className="flex flex-col items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-violet-200 bg-violet-50 text-violet-700">
                  <Award
                    size={38}
                  />
                </div>

                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-violet-600">
                  Certified
                </p>
              </div>

              <Signature
                title="Verified Credential"
                subtitle={
                  certificate.certificate_number
                }
              />
            </div>

            {/* ID */}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span>
                Certificate ID:{" "}
                <strong className="text-slate-600">
                  {
                    certificate.certificate_number
                  }
                </strong>
              </span>

              <span className="hidden sm:inline">
                •
              </span>

              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  size={14}
                  className="text-emerald-500"
                />

                Digitally verified by
                BioNova
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            DETAILS BELOW
        ================================================= */}

        <section className="no-print mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-black uppercase tracking-wider text-violet-600">
              Certificate details
            </p>

            <div className="mt-4 space-y-3">
              <DetailRow
                label="Certificate number"
                value={
                  certificate.certificate_number
                }
              />

              <DetailRow
                label="Student"
                value={
                  certificate.student_name
                }
              />

              <DetailRow
                label="Assessment"
                value={
                  certificate.quiz_title
                }
              />

              <DetailRow
                label="Score"
                value={`${certificate.score}%`}
              />

              <DetailRow
                label="Grade"
                value={
                  certificate.grade
                }
              />
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <ShieldCheck
              size={27}
              className="text-emerald-700"
            />

            <h3 className="mt-4 text-lg font-black text-emerald-950">
              Verified BioNova
              credential
            </h3>

            <p className="mt-2 leading-6 text-emerald-800">
              This certificate is
              currently active and is
              linked to a successful
              BioNova assessment
              attempt.
            </p>
          </article>
        </section>
      </div>

      {/* ===================================================
          PRINT CSS
      =================================================== */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            body * {
              visibility: hidden;
            }

            #bionova-certificate,
            #bionova-certificate * {
              visibility: visible;
            }

            #bionova-certificate {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              min-height: 100vh;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .no-print {
              display: none !important;
            }

            @page {
              size: landscape;
              margin: 0;
            }
          }
        `}
      </style>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function CertificateMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon
        size={20}
        className="mx-auto text-teal-600"
      />

      <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Signature({
  title,
  subtitle,
}) {
  return (
    <div className="flex flex-col justify-end">
      <div className="mx-auto w-full max-w-[210px] border-b border-slate-400 pb-2">
        <p className="font-black text-slate-800">
          {title}
        </p>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-3 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <strong className="text-right text-sm text-slate-900">
        {value || "—"}
      </strong>
    </div>
  );
}

export default CertificateDetailsPage;