import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dna,
  FlaskConical,
  GraduationCap,
  Microscope,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

/* =========================================================
   DIFFICULTY
========================================================= */

const difficultyConfig = {
  EASY: {
    label: "Beginner",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  MEDIUM: {
    label: "Intermediate",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  HARD: {
    label: "Advanced",
    className:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
};

/* =========================================================
   CATEGORY-BASED SKILLS
========================================================= */

const categorySkills = {
  "Cell Biology": [
    "Cell Structure",
    "Organelle Function",
    "Cellular Processes",
    "Microscopy",
  ],

  "Molecular Biology": [
    "DNA Analysis",
    "Gene Expression",
    "PCR",
    "Molecular Techniques",
  ],

  "Genetics and Genomics": [
    "Inheritance",
    "Chromosomes",
    "Genetic Variation",
    "Genomics",
  ],

  Genomics: [
    "DNA Sequencing",
    "Genome Analysis",
    "Sequence Interpretation",
    "Genetic Variation",
  ],

  Proteomics: [
    "Protein Analysis",
    "Protein Structure",
    "Electrophoresis",
    "Protein Detection",
  ],

  Metabolomics: [
    "Metabolic Pathways",
    "Metabolite Analysis",
    "Biochemistry",
    "Analytical Techniques",
  ],

  Microbiology: [
    "Microbial Growth",
    "Bacterial Genetics",
    "Antimicrobial Resistance",
    "Microbial Techniques",
  ],

  Biochemistry: [
    "Enzyme Kinetics",
    "Metabolism",
    "Biomolecules",
    "Biochemical Pathways",
  ],

  Bioinformatics: [
    "Sequence Analysis",
    "Biological Databases",
    "Computational Biology",
    "Data Interpretation",
  ],

  Immunology: [
    "Immune Response",
    "Antibodies",
    "Antigens",
    "Immunoassays",
  ],

  "Industrial Biotechnology": [
    "Fermentation",
    "Industrial Microbiology",
    "Bioprocessing",
    "Metabolic Engineering",
  ],

  "Environmental Biotechnology": [
    "Bioremediation",
    "Wastewater Treatment",
    "Environmental Microbiology",
    "Sustainability",
  ],

  "Plant Biotechnology": [
    "Plant Tissue Culture",
    "Plant Genetics",
    "Transformation",
    "Crop Biotechnology",
  ],

  "Animal Biotechnology": [
    "Animal Cell Culture",
    "Transgenic Animals",
    "Cell Technology",
    "Biotechnology Applications",
  ],

  "Medical Biotechnology": [
    "Molecular Diagnostics",
    "Gene Therapy",
    "Precision Medicine",
    "Clinical Biotechnology",
  ],

  "Pharmaceutical Biotechnology": [
    "Biopharmaceuticals",
    "Vaccines",
    "Protein Purification",
    "Drug Biotechnology",
  ],

  "Bioprocess Engineering": [
    "Bioreactors",
    "Sterilization",
    "Downstream Processing",
    "Process Engineering",
  ],

  "Synthetic Biology": [
    "Genetic Circuits",
    "Pathway Engineering",
    "Biological Design",
    "Synthetic Systems",
  ],

  "Omics Technology": [
    "Genomics",
    "Transcriptomics",
    "Proteomics",
    "Multi-Omics",
  ],

  "Stem Cell Biology": [
    "Stem Cells",
    "Differentiation",
    "Regenerative Medicine",
    "Cell Therapy",
  ],
};

const defaultSkills = [
  "Biotechnology",
  "Scientific Reasoning",
  "Concept Application",
  "Research Skills",
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

function QuizDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response =
          await api.get(
            `/quizzes/${id}`
          );

        setQuiz(
          response.data.quiz
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Unable to load quiz details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [id]);

  const handleStartQuiz =
    async () => {
      try {
        setStarting(true);

        const response =
          await api.post(
            `/quizzes/${id}/start`
          );

        const attemptId =
          response.data.attempt?.id;

        if (!attemptId) {
          throw new Error(
            "Attempt ID was not returned"
          );
        }

        navigate(
          `/student/attempt/${attemptId}`
        );
      } catch (error) {
        const existingAttemptId =
          error.response?.data
            ?.attempt?.id;

        if (
          existingAttemptId
        ) {
          toast(
            "You already have an active attempt. Resuming it."
          );

          navigate(
            `/student/attempt/${existingAttemptId}`
          );

          return;
        }

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to start this quiz."
        );
      } finally {
        setStarting(false);
      }
    };

  const skills =
    useMemo(() => {
      if (!quiz) {
        return defaultSkills;
      }

      return (
        categorySkills[
          quiz.category_name
        ] || defaultSkills
      );
    }, [quiz]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />

          <p className="mt-4 font-medium text-slate-600">
            Loading quiz
            details...
          </p>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <Microscope
            size={42}
            className="mx-auto text-teal-600"
          />

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Quiz not found
          </h1>

          <p className="mt-3 text-slate-500">
            This biotechnology
            assessment may have been
            removed or is currently
            unavailable.
          </p>

          <Link
            to="/student/quizzes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700"
          >
            <ArrowLeft
              size={18}
            />

            Back to quizzes
          </Link>
        </section>
      </main>
    );
  }

  const difficulty =
    difficultyConfig[
      quiz.difficulty
    ] ||
    difficultyConfig.MEDIUM;

  const rating =
    getDemoRating(quiz.id);

  const learners =
    getDemoLearners(quiz.id);

  const questionCount =
    Number(
      quiz.question_count || 10
    );

  const duration =
    Number(
      quiz.duration_minutes || 0
    );

  const passingScore =
    Number(
      quiz.passing_percentage ||
        0
    ).toFixed(0);

  const maxAttempts =
    Number(
      quiz.max_attempts || 1
    );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-8 sm:py-8">
      <section className="mx-auto max-w-7xl">
        {/* BACK */}
        <Link
          to="/student/quizzes"
          className="inline-flex items-center gap-2 font-bold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={18} />

          Back to quizzes
        </Link>

        {/* MAIN LAYOUT */}
        <section className="mt-6 grid gap-8 xl:grid-cols-[1.5fr_0.72fr]">
          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-7">
            {/* HERO */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative min-h-[430px] overflow-hidden bg-slate-950">
                {/* IMAGE */}
                {quiz.thumbnail_url ? (
                  <img
                    src={
                      quiz.thumbnail_url
                    }
                    alt={
                      quiz.title
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700" />
                )}

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/25" />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* DECORATION */}
                <Dna
                  size={240}
                  className="absolute -right-10 bottom-0 hidden rotate-12 text-white/10 lg:block"
                />

                {/* HERO CONTENT */}
                <div className="relative flex min-h-[430px] flex-col justify-end p-7 text-white sm:p-10 lg:p-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
                      <Microscope
                        size={16}
                      />

                      {quiz.category_name ||
                        "Biotechnology"}
                    </span>

                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-black ${difficulty.className}`}
                    >
                      {
                        difficulty.label
                      }
                    </span>

                    {quiz.status && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-md">
                        {formatStatus(
                          quiz.status
                        )}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
                    {quiz.title}
                  </h1>

                  <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                    {quiz.description ||
                      "Test your biotechnology knowledge and strengthen your understanding through this focused assessment."}
                  </p>

                  {/* SOCIAL PROOF */}
                  <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Star
                        size={18}
                        className="fill-amber-400 text-amber-400"
                      />

                      <span className="font-black">
                        {rating}
                      </span>

                      <span className="text-slate-300">
                        / 5
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-200">
                      <Users
                        size={18}
                      />

                      {formatNumber(
                        learners
                      )}{" "}
                      learners
                    </div>

                    <div className="flex items-center gap-2 text-slate-200">
                      <Award
                        size={18}
                      />

                      Certificate
                      eligible
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT TO EXPECT */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                  Assessment overview
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  What to expect
                </h2>

                <p className="mt-2 text-slate-500">
                  Everything you need
                  to know before
                  starting this quiz.
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={
                    BookOpen
                  }
                  value={`${questionCount} ${
                    questionCount ===
                    1
                      ? "question"
                      : "questions"
                  }`}
                  label="Multiple-choice assessment"
                  iconClass="bg-indigo-100 text-indigo-700"
                />

                <InfoCard
                  icon={Clock3}
                  value={`${duration} minutes`}
                  label="Timer starts immediately"
                  iconClass="bg-cyan-100 text-cyan-700"
                />

                <InfoCard
                  icon={Target}
                  value={`${passingScore}% required`}
                  label="Minimum passing score"
                  iconClass="bg-emerald-100 text-emerald-700"
                />

                <InfoCard
                  icon={Trophy}
                  value={`${maxAttempts} ${
                    maxAttempts === 1
                      ? "attempt"
                      : "attempts"
                  }`}
                  label="Maximum attempts allowed"
                  iconClass="bg-amber-100 text-amber-700"
                />
              </div>
            </section>

            {/* SKILLS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                Knowledge areas
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Skills you'll
                strengthen
              </h2>

              <p className="mt-2 text-slate-500">
                This assessment
                reinforces core
                biotechnology concepts
                and scientific
                reasoning.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {skills.map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      key={
                        skill
                      }
                      className={getSkillClass(
                        index
                      )}
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </section>

            {/* LEARNING OUTCOMES */}
            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                Learning outcomes
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                What you'll test
              </h2>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <OutcomeItem text="Recall and apply key biotechnology concepts." />

                <OutcomeItem text="Interpret scientific terminology and biological processes." />

                <OutcomeItem text="Distinguish closely related biotechnology concepts." />

                <OutcomeItem text="Apply knowledge to exam-style multiple-choice questions." />

                <OutcomeItem text="Identify strengths and knowledge gaps using your score." />

                <OutcomeItem text="Build confidence for advanced biotechnology topics." />
              </div>
            </section>

            {/* BEFORE YOU BEGIN */}
            <section className="rounded-3xl border border-teal-100 bg-teal-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <ShieldCheck
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-black text-teal-950">
                    Before you begin
                  </h3>

                  <p className="mt-2 leading-7 text-teal-800">
                    Make sure you
                    have a stable
                    internet connection.
                    Your timer continues
                    after refresh and
                    the assessment
                    automatically submits
                    when time expires.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="h-fit xl:sticky xl:top-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
              {/* MINI IMAGE */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-teal-700 to-blue-700">
                {quiz.thumbnail_url ? (
                  <img
                    src={
                      quiz.thumbnail_url
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white">
                    <Dna
                      size={70}
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

                <div className="absolute bottom-4 left-4">
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-teal-800">
                    {
                      difficulty.label
                    }
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                  Ready to begin?
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Start your
                  assessment
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Your attempt
                  starts immediately.
                  Make sure you're
                  ready before
                  proceeding.
                </p>

                {/* INCLUDED */}
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <h3 className="font-black text-slate-950">
                    Included in this
                    quiz
                  </h3>

                  <div className="mt-4 space-y-3">
                    <IncludedRow
                      icon={
                        BookOpen
                      }
                      text={`${questionCount} MCQs`}
                    />

                    <IncludedRow
                      icon={
                        Clock3
                      }
                      text={`${duration}-minute timer`}
                    />

                    <IncludedRow
                      icon={
                        Target
                      }
                      text={`${passingScore}% passing score`}
                    />

                    <IncludedRow
                      icon={Award}
                      text="Certificate eligible"
                    />

                    <IncludedRow
                      icon={
                        Sparkles
                      }
                      text="Instant results"
                    />

                    <IncludedRow
                      icon={
                        Trophy
                      }
                      text={`${maxAttempts} ${
                        maxAttempts ===
                        1
                          ? "attempt"
                          : "attempts"
                      } allowed`}
                    />
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={
                    handleStartQuiz
                  }
                  disabled={
                    starting
                  }
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-teal-600 px-6 py-4 text-lg font-black text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play
                    size={20}
                    fill="currentColor"
                  />

                  {starting
                    ? "Starting quiz..."
                    : "Start quiz"}
                </button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  Timer starts after
                  you click Start quiz
                </p>

                {/* SECURE */}
                <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  Answers and scoring
                  are securely
                  validated by
                  BioNova.
                </div>

                {/* BIO NOVA LEARNING CARD */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
                      <FlaskConical
                        size={26}
                      />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-950">
                        BioNova
                        Learning
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Biotechnology
                        assessment and
                        learning platform
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EXTRA CTA */}
            <Link
              to="/student/progress"
              className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-700"
            >
              <span className="flex items-center gap-3">
                <GraduationCap
                  size={20}
                />

                View your progress
              </span>

              <ChevronRight
                size={18}
              />
            </Link>
          </aside>
        </section>
      </section>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function InfoCard({
  icon: Icon,
  value,
  label,
  iconClass,
}) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
      >
        <Icon
          size={21}
        />
      </div>

      <div>
        <p className="font-black text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {label}
        </p>
      </div>
    </article>
  );
}

function OutcomeItem({
  text,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <CheckCircle2
        size={20}
        className="mt-0.5 shrink-0 text-teal-600"
      />

      <p className="text-sm font-medium leading-6 text-slate-700">
        {text}
      </p>
    </div>
  );
}

function IncludedRow({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-700">
      <Icon
        size={17}
        className="shrink-0 text-teal-700"
      />

      <span>
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatStatus(
  status
) {
  return String(
    status || ""
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function getDemoRating(
  quizId
) {
  const values = [
    4.6,
    4.7,
    4.8,
    4.9,
  ];

  return values[
    Number(quizId || 0) %
      values.length
  ].toFixed(1);
}

function getDemoLearners(
  quizId
) {
  return (
    850 +
    ((Number(quizId || 1) *
      173) %
      4200)
  );
}

function formatNumber(
  value
) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function getSkillClass(
  index
) {
  const classes = [
    "rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700",

    "rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700",

    "rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700",

    "rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700",
  ];

  return classes[
    index %
      classes.length
  ];
}

export default QuizDetailsPage;