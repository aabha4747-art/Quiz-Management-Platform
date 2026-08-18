import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  Activity,
  Atom,
  Award,
  Beaker,
  Biohazard,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Database,
  Dna,
  Droplets,
  FlaskConical,
  Flower2,
  GitBranch,
  HeartPulse,
  Leaf,
  Microscope,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  TestTube2,
  TrendingUp,
  Users,
  Waves,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

import PageContainer from "../../components/ui/PageContainer";
import FilterBar from "../../components/ui/FilterBar";
import EmptyState from "../../components/ui/EmptyState";
import DashboardCard from "../../components/ui/DashboardCard";

/* =========================================================
   DIFFICULTY
========================================================= */

const difficultyConfig = {
  EASY: {
    label: "Beginner",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  MEDIUM: {
    label: "Intermediate",
    dot: "bg-amber-500",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  HARD: {
    label: "Advanced",
    dot: "bg-rose-500",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700",
  },
};

/* =========================================================
   QUIZ-SPECIFIC ICONS + COLORS
========================================================= */

const quizVisuals = {
  "Cell Structure and Organelles": {
    icon: Microscope,
    gradient:
      "from-cyan-600 to-blue-700",
  },

  "Cell Membrane Transport": {
    icon: Waves,
    gradient:
      "from-teal-600 to-emerald-700",
  },

  "Cell Cycle and Division": {
    icon: GitBranch,
    gradient:
      "from-violet-600 to-fuchsia-700",
  },

  "DNA Replication Basics": {
    icon: Dna,
    gradient:
      "from-indigo-600 to-cyan-600",
  },

  "Central Dogma of Molecular Biology": {
    icon: Dna,
    gradient:
      "from-purple-600 to-blue-700",
  },

  "PCR Fundamentals": {
    icon: TestTube2,
    gradient:
      "from-orange-500 to-amber-600",
  },

  "Recombinant DNA Technology": {
    icon: GitBranch,
    gradient:
      "from-pink-600 to-violet-700",
  },

  "Mendelian Genetics": {
    icon: Dna,
    gradient:
      "from-violet-600 to-indigo-700",
  },

  "Chromosomal Genetics": {
    icon: GitBranch,
    gradient:
      "from-indigo-700 to-purple-800",
  },

  "DNA Sequencing Fundamentals": {
    icon: Database,
    gradient:
      "from-blue-600 to-teal-700",
  },

  "Next-Generation Sequencing": {
    icon: Database,
    gradient:
      "from-sky-600 to-violet-700",
  },

  "Protein Structure and Function": {
    icon: Atom,
    gradient:
      "from-cyan-600 to-emerald-700",
  },

  "SDS-PAGE Fundamentals": {
    icon: Activity,
    gradient:
      "from-blue-700 to-purple-700",
  },

  "Western Blot Fundamentals": {
    icon: Activity,
    gradient:
      "from-rose-600 to-fuchsia-700",
  },

  "Metabolic Pathways": {
    icon: Activity,
    gradient:
      "from-orange-600 to-yellow-500",
  },

  "Metabolomics Techniques": {
    icon: FlaskConical,
    gradient:
      "from-yellow-500 to-red-600",
  },

  "Microbial Growth Curve": {
    icon: Biohazard,
    gradient:
      "from-emerald-600 to-teal-700",
  },

  "Bacterial Genetics": {
    icon: Biohazard,
    gradient:
      "from-green-700 to-cyan-700",
  },

  "Antimicrobial Resistance": {
    icon: ShieldCheck,
    gradient:
      "from-red-600 to-pink-700",
  },

  "Fermentation Technology": {
    icon: Beaker,
    gradient:
      "from-amber-600 to-red-600",
  },

  "Metabolic Engineering": {
    icon: BrainCircuit,
    gradient:
      "from-fuchsia-600 to-indigo-700",
  },

  Bioremediation: {
    icon: Leaf,
    gradient:
      "from-green-600 to-teal-700",
  },

  "Wastewater Biotechnology": {
    icon: Droplets,
    gradient:
      "from-cyan-600 to-blue-700",
  },

  "Plant Tissue Culture": {
    icon: Sprout,
    gradient:
      "from-lime-600 to-emerald-700",
  },

  "Plant Genetic Engineering": {
    icon: Flower2,
    gradient:
      "from-green-600 to-yellow-500",
  },

  "Animal Cell Culture": {
    icon: HeartPulse,
    gradient:
      "from-rose-600 to-purple-700",
  },

  "Transgenic Animals": {
    icon: Dna,
    gradient:
      "from-red-600 to-violet-700",
  },

  "Molecular Diagnostics": {
    icon: TestTube2,
    gradient:
      "from-cyan-600 to-emerald-700",
  },

  "Gene Therapy": {
    icon: Dna,
    gradient:
      "from-blue-600 to-purple-700",
  },

  "Vaccines and Immunization": {
    icon: ShieldCheck,
    gradient:
      "from-teal-600 to-green-700",
  },

  "Monoclonal Antibodies": {
    icon: ShieldCheck,
    gradient:
      "from-fuchsia-600 to-rose-700",
  },

  "Bioreactor Fundamentals": {
    icon: Beaker,
    gradient:
      "from-cyan-700 to-emerald-800",
  },

  "Sterilization in Bioprocessing": {
    icon: TestTube2,
    gradient:
      "from-slate-600 to-blue-800",
  },

  "Downstream Processing": {
    icon: FlaskConical,
    gradient:
      "from-blue-700 to-teal-800",
  },

  "Synthetic Biology Fundamentals": {
    icon: BrainCircuit,
    gradient:
      "from-purple-600 to-pink-700",
  },

  "Genetic Circuits": {
    icon: BrainCircuit,
    gradient:
      "from-violet-700 to-fuchsia-800",
  },

  "Sequence Alignment": {
    icon: Database,
    gradient:
      "from-blue-600 to-violet-700",
  },

  "BLAST and Biological Databases": {
    icon: Search,
    gradient:
      "from-cyan-600 to-indigo-700",
  },

  "Innate and Adaptive Immunity": {
    icon: ShieldCheck,
    gradient:
      "from-emerald-600 to-cyan-700",
  },

  "ELISA Fundamentals": {
    icon: TestTube2,
    gradient:
      "from-amber-500 to-rose-600",
  },

  "Antibodies and Antigens": {
    icon: ShieldCheck,
    gradient:
      "from-pink-600 to-red-700",
  },

  "Enzymes and Enzyme Kinetics": {
    icon: FlaskConical,
    gradient:
      "from-amber-600 to-lime-600",
  },

  "Carbohydrate Metabolism": {
    icon: Activity,
    gradient:
      "from-orange-600 to-yellow-500",
  },

  "Transcriptomics Fundamentals": {
    icon: Dna,
    gradient:
      "from-indigo-600 to-teal-700",
  },

  "Multi-Omics Integration": {
    icon: Atom,
    gradient:
      "from-purple-600 to-cyan-700",
  },

  "Stem Cell Biology Basics": {
    icon: Sparkles,
    gradient:
      "from-teal-600 to-emerald-700",
  },

  "Regenerative Medicine": {
    icon: HeartPulse,
    gradient:
      "from-rose-500 to-purple-700",
  },

  "CRISPR-Cas9 Gene Editing": {
    icon: Dna,
    gradient:
      "from-fuchsia-600 to-indigo-700",
  },

  "Protein Purification Basics": {
    icon: FlaskConical,
    gradient:
      "from-sky-600 to-teal-700",
  },

  "Bioinformatics for Drug Discovery": {
    icon: Database,
    gradient:
      "from-indigo-700 to-fuchsia-700",
  },
};

/* =========================================================
   CATEGORY FALLBACKS
========================================================= */

const categoryVisuals = {
  "Cell Biology": {
    icon: Microscope,
    gradient:
      "from-cyan-600 to-blue-700",
  },

  "Molecular Biology": {
    icon: Dna,
    gradient:
      "from-indigo-600 to-cyan-700",
  },

  "Genetics and Genomics": {
    icon: Dna,
    gradient:
      "from-violet-600 to-blue-700",
  },

  Genomics: {
    icon: Database,
    gradient:
      "from-indigo-600 to-purple-700",
  },

  Proteomics: {
    icon: Atom,
    gradient:
      "from-cyan-600 to-emerald-700",
  },

  Metabolomics: {
    icon: Activity,
    gradient:
      "from-orange-600 to-yellow-500",
  },

  Microbiology: {
    icon: Biohazard,
    gradient:
      "from-emerald-600 to-teal-700",
  },

  Biochemistry: {
    icon: FlaskConical,
    gradient:
      "from-amber-600 to-red-600",
  },

  Bioinformatics: {
    icon: Database,
    gradient:
      "from-blue-600 to-violet-700",
  },

  Immunology: {
    icon: ShieldCheck,
    gradient:
      "from-pink-600 to-red-700",
  },

  "Industrial Biotechnology": {
    icon: Beaker,
    gradient:
      "from-slate-600 to-cyan-700",
  },

  "Environmental Biotechnology": {
    icon: Leaf,
    gradient:
      "from-green-600 to-teal-700",
  },

  "Plant Biotechnology": {
    icon: Sprout,
    gradient:
      "from-lime-600 to-emerald-700",
  },

  "Animal Biotechnology": {
    icon: HeartPulse,
    gradient:
      "from-rose-600 to-purple-700",
  },

  "Medical Biotechnology": {
    icon: HeartPulse,
    gradient:
      "from-red-600 to-pink-700",
  },

  "Pharmaceutical Biotechnology": {
    icon: Pill,
    gradient:
      "from-blue-600 to-teal-700",
  },

  "Bioprocess Engineering": {
    icon: Beaker,
    gradient:
      "from-cyan-700 to-emerald-800",
  },

  "Synthetic Biology": {
    icon: BrainCircuit,
    gradient:
      "from-purple-600 to-pink-700",
  },

  "Omics Technology": {
    icon: Atom,
    gradient:
      "from-indigo-600 to-cyan-700",
  },

  "Stem Cell Biology": {
    icon: Sparkles,
    gradient:
      "from-teal-600 to-emerald-700",
  },
};

const defaultVisual = {
  icon: Dna,
  gradient:
    "from-teal-600 to-blue-700",
};

/* =========================================================
   MAIN PAGE
========================================================= */

function QuizListPage() {
  const [quizzes, setQuizzes] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("ALL");

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] = useState("ALL");

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [
          quizResponse,
          categoryResponse,
        ] = await Promise.all([
          api.get("/quizzes"),
          api.get("/categories"),
        ]);

        setQuizzes(
          Array.isArray(
            quizResponse.data.quizzes
          )
            ? quizResponse.data.quizzes
            : []
        );

        setCategories(
          Array.isArray(
            categoryResponse.data
              .categories
          )
            ? categoryResponse.data
                .categories
            : []
        );
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Unable to load biotechnology quizzes."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const filteredQuizzes =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      return quizzes.filter(
        (quiz) => {
          const title = String(
            quiz.title || ""
          ).toLowerCase();

          const description =
            String(
              quiz.description || ""
            ).toLowerCase();

          const categoryName =
            String(
              quiz.category_name ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            title.includes(
              normalizedSearch
            ) ||
            description.includes(
              normalizedSearch
            ) ||
            categoryName.includes(
              normalizedSearch
            );

          const matchesCategory =
            selectedCategory ===
              "ALL" ||
            String(
              quiz.category_id
            ) ===
              selectedCategory;

          const matchesDifficulty =
            selectedDifficulty ===
              "ALL" ||
            quiz.difficulty ===
              selectedDifficulty;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesDifficulty
          );
        }
      );
    }, [
      quizzes,
      searchText,
      selectedCategory,
      selectedDifficulty,
    ]);

  const filtersActive =
    searchText.trim() !== "" ||
    selectedCategory !== "ALL" ||
    selectedDifficulty !== "ALL";

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("ALL");
    setSelectedDifficulty("ALL");
  };

  const beginnerCount =
    quizzes.filter(
      (quiz) =>
        quiz.difficulty === "EASY"
    ).length;

  const intermediateCount =
    quizzes.filter(
      (quiz) =>
        quiz.difficulty ===
        "MEDIUM"
    ).length;

  const advancedCount =
    quizzes.filter(
      (quiz) =>
        quiz.difficulty === "HARD"
    ).length;

  return (
    <PageContainer>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-cyan-700 to-blue-700 px-7 py-9 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-cyan-300/10" />

        <div className="absolute right-10 top-6 hidden opacity-10 lg:block">
          <Dna size={260} />
        </div>

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Microscope
                size={20}
              />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
              Biotechnology Quiz
              Library
            </p>
          </div>

          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Explore biotechnology.
            <br />
            Test what you know.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-cyan-50 sm:text-lg">
            Explore 50 biotechnology
            assessments across molecular
            biology, genetics,
            microbiology, biochemistry,
            omics, bioprocess engineering
            and emerging life-science
            domains.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/student/attempts"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-teal-800 transition hover:bg-teal-50"
            >
              View attempt history

              <ChevronRight
                size={18}
              />
            </Link>

            <Link
              to="/student/progress"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-black text-white backdrop-blur transition hover:bg-white/20"
            >
              Track progress

              <Target
                size={18}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LibraryStat
          icon={BookOpen}
          value={quizzes.length}
          label="Total quizzes"
          iconClass="bg-cyan-100 text-cyan-700"
        />

        <LibraryStat
          icon={Sprout}
          value={beginnerCount}
          label="Beginner"
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <LibraryStat
          icon={FlaskConical}
          value={
            intermediateCount
          }
          label="Intermediate"
          iconClass="bg-amber-100 text-amber-700"
        />

        <LibraryStat
          icon={Dna}
          value={advancedCount}
          label="Advanced"
          iconClass="bg-rose-100 text-rose-700"
        />
      </section>

      {/* FILTERS */}
      <FilterBar
        searchValue={
          searchText
        }
        onSearchChange={(
          event
        ) =>
          setSearchText(
            event.target.value
          )
        }
        searchPlaceholder="Search biotechnology quizzes or subjects..."
        onReset={resetFilters}
        resetDisabled={
          !filtersActive
        }
      >
        <FilterBar.Select
          value={
            selectedCategory
          }
          onChange={(event) =>
            setSelectedCategory(
              event.target.value
            )
          }
          ariaLabel="Filter quizzes by subject"
        >
          <option value="ALL">
            All subjects
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category.id
                }
                value={String(
                  category.id
                )}
              >
                {
                  category.name
                }
              </option>
            )
          )}
        </FilterBar.Select>

        <FilterBar.Select
          value={
            selectedDifficulty
          }
          onChange={(event) =>
            setSelectedDifficulty(
              event.target.value
            )
          }
          ariaLabel="Filter quizzes by difficulty"
        >
          <option value="ALL">
            All levels
          </option>

          <option value="EASY">
            Beginner
          </option>

          <option value="MEDIUM">
            Intermediate
          </option>

          <option value="HARD">
            Advanced
          </option>
        </FilterBar.Select>
      </FilterBar>

      {/* QUIZ GRID */}
      <DashboardCard
        title={`${filteredQuizzes.length} ${
          filteredQuizzes.length ===
          1
            ? "quiz"
            : "quizzes"
        } available`}
        description="Choose an assessment and continue building your biotechnology knowledge."
      >
        {loading ? (
          <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {[
              1, 2, 3, 4, 5, 6,
            ].map((item) => (
              <QuizSkeleton
                key={item}
              />
            ))}
          </section>
        ) : filteredQuizzes.length ===
          0 ? (
          <EmptyState
            icon={Microscope}
            title="No biotechnology quizzes found"
            message="Try changing your subject, difficulty or search term."
            action={{
              label:
                "Reset filters",
              onClick:
                resetFilters,
              showArrow: false,
            }}
          />
        ) : (
          <section className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredQuizzes.map(
              (quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                />
              )
            )}
          </section>
        )}
      </DashboardCard>
    </PageContainer>
  );
}

/* =========================================================
   QUIZ CARD
========================================================= */

function QuizCard({ quiz }) {
  const visual =
    quizVisuals[
      quiz.title
    ] ||
    categoryVisuals[
      quiz.category_name
    ] ||
    defaultVisual;

  const Icon =
    visual.icon;

  const difficulty =
    difficultyConfig[
      quiz.difficulty
    ] ||
    difficultyConfig.MEDIUM;

  /*
   * Demo values for now.
   * Later we can calculate these from
   * real attempts/users.
   */
  const rating =
    getDemoRating(quiz.id);

  const learners =
    getDemoLearners(
      quiz.id
    );

  const trending =
    Number(quiz.id) % 4 === 0 ||
    Number(quiz.id) % 7 === 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl">
      {/* ==========================
          IMAGE
      ========================== */}

      <div
        className={`relative aspect-video overflow-hidden bg-gradient-to-br ${visual.gradient}`}
      >
        {quiz.thumbnail_url ? (
          <>
            <img
              src={
                quiz.thumbnail_url
              }
              alt={
                quiz.title
              }
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />

            <div
              className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-[0.08]`}
            />
          </>
        ) : (
          <>
            <div
              className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`}
            />

            <Dna
              size={140}
              className="absolute -right-8 bottom-0 rotate-12 text-white/10"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/15 backdrop-blur">
                <Icon
                  size={40}
                  className="text-white"
                />
              </div>
            </div>
          </>
        )}

        {/* TRENDING */}
        {trending && (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
              <TrendingUp
                size={13}
              />

              Trending
            </span>
          </div>
        )}

        {/* UNIQUE ICON */}
        <div className="absolute right-3 top-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-slate-950/55 text-white shadow-lg backdrop-blur-md">
            <Icon
              size={21}
              strokeWidth={1.9}
            />
          </div>
        </div>

        {/* CATEGORY */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-slate-950/70 px-3 py-1.5 text-[11px] font-black text-white shadow-lg backdrop-blur-md">
            <Icon
              size={13}
              className="shrink-0"
            />

            <span>
              {quiz.category_name ||
                "Biotechnology"}
            </span>
          </span>
        </div>
      </div>

      {/* ==========================
          CARD CONTENT
      ========================== */}

      <div className="flex flex-1 flex-col p-5">
        {/* RATING + LEARNERS */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5">
            <Star
              size={17}
              className="fill-amber-400 text-amber-400"
            />

            <span className="text-sm font-black text-slate-950">
              {rating}
            </span>

            <span className="text-xs text-slate-400">
              / 5
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Users
              size={15}
            />

            {formatNumber(
              learners
            )}{" "}
            learners
          </div>
        </div>

        {/* DIFFICULTY + STATUS */}
        <div className="mt-4 flex min-h-[32px] flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${difficulty.badge}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${difficulty.dot}`}
            />

            {
              difficulty.label
            }
          </span>

          {quiz.status && (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
              {formatStatus(
                quiz.status
              )}
            </span>
          )}
        </div>

        {/* TITLE */}
        <h3 className="mt-4 min-h-[56px] text-xl font-black leading-7 text-slate-950">
          {quiz.title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
          {quiz.description ||
            "Test your biotechnology knowledge with this focused assessment."}
        </p>

        {/* METRICS */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <QuizMetric
            icon={Clock3}
            label={`${
              quiz.duration_minutes ||
              0
            } min`}
            description="Duration"
            iconClass="text-cyan-700"
          />

          <QuizMetric
            icon={BookOpen}
            label={`${
              quiz.question_count ??
              10
            }`}
            description="Questions"
            iconClass="text-orange-600"
          />

          <QuizMetric
            icon={Target}
            label={`${Number(
              quiz.passing_percentage ||
                0
            ).toFixed(0)}%`}
            description="Pass"
            iconClass="text-emerald-700"
          />

          <QuizMetric
            icon={Award}
            label="Yes"
            description="Certificate"
            iconClass="text-violet-700"
          />
        </div>

        {/* CERTIFICATE NOTE */}
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Award
              size={18}
            />
          </div>

          <div>
            <p className="text-xs font-black text-violet-900">
              Certificate eligible
            </p>

            <p className="mt-0.5 text-[11px] text-violet-600">
              Complete and pass this
              assessment.
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <Link
          to={`/student/quizzes/${quiz.id}`}
          className="mt-auto pt-6"
        >
          <span className="flex w-full items-center justify-between rounded-xl bg-teal-600 px-5 py-3.5 font-black text-white transition hover:bg-teal-700">
            Explore quiz

            <ChevronRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </Link>
      </div>
    </article>
  );
}

/* =========================================================
   METRIC
========================================================= */

function QuizMetric({
  icon: Icon,
  label,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-3 text-center">
      <Icon
        size={17}
        className={`mx-auto ${iconClass}`}
      />

      <p className="mt-2 whitespace-nowrap text-xs font-black text-slate-950">
        {label}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.06em] text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   LIBRARY STAT
========================================================= */

function LibraryStat({
  icon: Icon,
  value,
  label,
  iconClass,
}) {
  return (
    <article className="ui-surface flex items-center gap-4 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon
          size={21}
        />
      </div>

      <div>
        <p className="text-2xl font-black text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {label}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function QuizSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-video animate-pulse bg-slate-200" />

      <div className="p-5">
        <div className="h-5 w-full animate-pulse rounded bg-slate-100" />

        <div className="mt-4 h-7 w-40 animate-pulse rounded-full bg-slate-100" />

        <div className="mt-5 h-7 w-4/5 animate-pulse rounded bg-slate-100" />

        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />

        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-100" />

        <div className="mt-6 h-20 animate-pulse rounded-xl bg-slate-100" />

        <div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-100" />

        <div className="mt-6 h-12 animate-pulse rounded-xl bg-slate-100" />
      </div>
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
  const ratings = [
    4.6,
    4.7,
    4.8,
    4.9,
  ];

  return ratings[
    Number(quizId || 0) %
      ratings.length
  ].toFixed(1);
}

function getDemoLearners(
  quizId
) {
  const base =
    620;

  const multiplier =
    Number(quizId || 1) *
    137;

  return (
    base +
    (multiplier % 2800)
  );
}

function formatNumber(
  value
) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

export default QuizListPage;