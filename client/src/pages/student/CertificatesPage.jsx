import {
  useEffect,
  useState,
} from "react";

import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Link,
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
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(dateValue)
  );
}

function getGradeStyle(grade) {
  switch (grade) {
    case "A+":
      return {
        badge:
          "bg-violet-100 text-violet-700",
        icon:
          "bg-violet-100 text-violet-700",
      };

    case "A":
      return {
        badge:
          "bg-indigo-100 text-indigo-700",
        icon:
          "bg-indigo-100 text-indigo-700",
      };

    case "B":
      return {
        badge:
          "bg-blue-100 text-blue-700",
        icon:
          "bg-blue-100 text-blue-700",
      };

    case "C":
      return {
        badge:
          "bg-amber-100 text-amber-700",
        icon:
          "bg-amber-100 text-amber-700",
      };

    default:
      return {
        badge:
          "bg-slate-100 text-slate-700",
        icon:
          "bg-slate-100 text-slate-700",
      };
  }
}

/* =========================================================
   PAGE
========================================================= */

function CertificatesPage() {
  const [
    certificates,
    setCertificates,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  /* =======================================================
     LOAD CERTIFICATES
  ======================================================= */

  useEffect(() => {
    const loadCertificates =
      async () => {
        try {
          const response =
            await api.get(
              "/certificates"
            );

          setCertificates(
            Array.isArray(
              response.data
                .certificates
            )
              ? response.data
                  .certificates
              : []
          );
        } catch (error) {
          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load certificates."
          );
        } finally {
          setLoading(false);
        }
      };

    loadCertificates();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const normalizedSearch =
    searchText
      .trim()
      .toLowerCase();

  const filteredCertificates =
    certificates.filter(
      (certificate) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          certificate.quiz_title,
          certificate.category_name,
          certificate.certificate_number,
          certificate.grade,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          );
      }
    );

  const averageScore =
    certificates.length > 0
      ? Math.round(
          certificates.reduce(
            (
              total,
              certificate
            ) =>
              total +
              Number(
                certificate.score ||
                  0
              ),
            0
          ) /
            certificates.length
        )
      : 0;

  const topGrades =
    certificates.filter(
      (certificate) =>
        certificate.grade ===
          "A+" ||
        certificate.grade ===
          "A"
    ).length;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="bg-slate-100 px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-700 px-7 py-8 text-white shadow-xl sm:px-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />

          <div className="absolute bottom-[-120px] right-[22%] h-72 w-72 rounded-full bg-violet-400/10" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                <Award
                  size={16}
                />

                BioNova credentials
              </div>

              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
                Your biotechnology
                achievements, certified.
              </h2>

              <p className="mt-4 max-w-2xl leading-6 text-indigo-100">
                Every certificate
                represents a BioNova
                assessment you
                successfully completed.
                View, print and share
                your credentials.
              </p>
            </div>

            <div className="grid min-w-[280px] grid-cols-2 gap-3">
              <HeroMetric
                label="Certificates"
                value={
                  certificates.length
                }
              />

              <HeroMetric
                label="Average score"
                value={`${averageScore}%`}
              />

              <HeroMetric
                label="Top grades"
                value={topGrades}
              />

              <HeroMetric
                label="Verified"
                value={
                  certificates.filter(
                    (certificate) =>
                      certificate.status ===
                      "ACTIVE"
                  ).length
                }
              />
            </div>
          </div>
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
              Credential library
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              {certificates.length}{" "}
              certificate
              {certificates.length ===
              1
                ? ""
                : "s"}{" "}
              earned
            </h2>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search certificates..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-3xl bg-white"
                />
              )
            )}
          </section>
        ) : filteredCertificates
            .length === 0 ? (
          <EmptyCertificates
            hasSearch={
              Boolean(
                normalizedSearch
              )
            }
          />
        ) : (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCertificates.map(
              (certificate) => (
                <CertificateCard
                  key={
                    certificate.id
                  }
                  certificate={
                    certificate
                  }
                />
              )
            )}
          </section>
        )}

        {/* =================================================
            INFO
        ================================================= */}

        {certificates.length >
          0 && (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={
                ShieldCheck
              }
              title="Verified credential"
              description="Each BioNova certificate has a unique certificate number and verification record."
            />

            <InfoCard
              icon={
                GraduationCap
              }
              title="Performance based"
              description="Certificates are issued only after successfully passing a biotechnology assessment."
            />

            <InfoCard
              icon={Sparkles}
              title="Keep learning"
              description="Complete additional quizzes to expand your BioNova certificate portfolio."
            />
          </section>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   CERTIFICATE CARD
========================================================= */

function CertificateCard({
  certificate,
}) {
  const styles =
    getGradeStyle(
      certificate.grade
    );

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}

      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-teal-600 to-blue-700">
        {certificate.thumbnail_url ? (
          <img
            src={
              certificate.thumbnail_url
            }
            alt={
              certificate.quiz_title
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Award
              size={54}
              className="text-white/80"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

        <div className="absolute bottom-4 left-4">
          <span className="rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
            {
              certificate.category_name
            }
          </span>
        </div>

        <div
          className={`absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-lg ${styles.icon}`}
        >
          {
            certificate.grade
          }
        </div>
      </div>

      {/* BODY */}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
            <ShieldCheck
              size={14}
            />

            Verified
          </span>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-black ${styles.badge}`}
          >
            Grade{" "}
            {
              certificate.grade
            }
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-xl font-black text-slate-950">
          {
            certificate.quiz_title
          }
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Certificate of
          Achievement
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniMetric
            icon={Medal}
            label="Score"
            value={`${Number(
              certificate.score || 0
            ).toFixed(0)}%`}
          />

          <MiniMetric
            icon={
              CalendarDays
            }
            label="Issued"
            value={formatDate(
              certificate.issued_at
            )}
          />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Certificate ID
          </p>

          <p className="mt-1 font-mono text-sm font-bold text-slate-700">
            {
              certificate.certificate_number
            }
          </p>
        </div>

        <Link
          to={`/student/certificates/${certificate.id}`}
          className="mt-5 flex items-center justify-between rounded-xl bg-teal-600 px-4 py-3 font-black text-white transition hover:bg-teal-700"
        >
          View certificate

          <ChevronRight
            size={18}
          />
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function HeroMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-indigo-100">
        {label}
      </p>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon
        size={17}
        className="text-teal-600"
      />

      <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}

function EmptyCertificates({
  hasSearch,
}) {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Award size={30} />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        {hasSearch
          ? "No matching certificates"
          : "No certificates yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-slate-500">
        {hasSearch
          ? "Try another search term."
          : "Pass a BioNova biotechnology assessment to earn your first certificate."}
      </p>

      {!hasSearch && (
        <Link
          to="/student/quizzes"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-black text-white"
        >
          <BookOpen
            size={18}
          />

          Browse quizzes
        </Link>
      )}
    </section>
  );
}

export default CertificatesPage;