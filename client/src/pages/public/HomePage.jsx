import { Link } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const features = [
  {
    icon: "⚡",
    title: "Instant scoring",
    description:
      "Receive immediate results, answer reviews, and explanations after every quiz.",
  },
  {
    icon: "📊",
    title: "Track progress",
    description:
      "Monitor scores, attempts, strengths, and improvement through clear dashboards.",
  },
  {
    icon: "🏆",
    title: "Climb the leaderboard",
    description:
      "Compare performance across overall, weekly, monthly, and category rankings.",
  },
];

const categories = [
  { name: "JavaScript", icon: "JS", tone: "from-amber-400 to-orange-500" },
  { name: "React", icon: "⚛", tone: "from-cyan-400 to-blue-500" },
  { name: "HTML", icon: "</>", tone: "from-orange-500 to-rose-500" },
  { name: "CSS", icon: "#", tone: "from-blue-500 to-indigo-600" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                <span>✨</span>
                Smarter online assessments
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
                Learn faster through
                <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                  interactive quizzes
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Discover quizzes, test your knowledge, review every answer, and
                track your progress through a modern assessment experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button className="w-full px-7 py-3.5 sm:w-auto">
                    Start learning free
                  </Button>
                </Link>

                <a href="#features">
                  <Button
                    variant="secondary"
                    className="w-full px-7 py-3.5 sm:w-auto"
                  >
                    Explore features
                  </Button>
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
                <span>✓ Secure accounts</span>
                <span>✓ Timed assessments</span>
                <span>✓ Detailed analytics</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl" />
              <div className="absolute -right-6 bottom-0 h-44 w-44 rounded-full bg-cyan-300/30 blur-3xl" />

              <Card className="relative overflow-hidden p-5 shadow-2xl shadow-indigo-100">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-7 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-200">Current quiz</p>
                      <h2 className="mt-1 text-2xl font-bold">
                        JavaScript Fundamentals
                      </h2>
                    </div>

                    <div className="rounded-xl bg-white/10 px-3 py-2 text-sm">
                      14:32
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between text-sm text-indigo-200">
                      <span>Question 5 of 20</span>
                      <span>25% complete</span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-1/4 rounded-full bg-cyan-400" />
                    </div>
                  </div>

                  <p className="mt-8 text-lg font-semibold">
                    Which keyword is used to declare a constant?
                  </p>

                  <div className="mt-5 space-y-3">
                    {["var", "let", "const", "static"].map((option, index) => (
                      <div
                        key={option}
                        className={`rounded-xl border px-4 py-3 ${
                          index === 2
                            ? "border-cyan-300 bg-cyan-400/15"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span className="mr-3 text-indigo-200">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-5">
                  <div>
                    <p className="text-2xl font-black text-slate-900">86%</p>
                    <p className="text-xs text-slate-500">Average score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">12</p>
                    <p className="text-xs text-slate-500">Quizzes passed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">#4</p>
                    <p className="text-xs text-slate-500">Leaderboard</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-indigo-600">Built for progress</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">
              Everything you need to improve
            </h2>
            <p className="mt-4 text-slate-600">
              A clean and focused platform for quizzes, performance tracking,
              and meaningful feedback.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-7 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section id="categories" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="font-semibold text-indigo-600">
                  Popular categories
                </p>
                <h2 className="mt-3 text-4xl font-black text-slate-950">
                  Pick a topic and begin
                </h2>
              </div>

              <Link to="/register" className="font-semibold text-indigo-600">
                Browse all quizzes →
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Card
                  key={category.name}
                  className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`flex h-36 items-center justify-center bg-gradient-to-br ${category.tone} text-4xl font-black text-white`}
                  >
                    {category.icon}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Practice concepts and improve your score.
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <Card className="overflow-hidden bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600 p-10 text-white">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="font-semibold text-indigo-100">
                  Ready to get started?
                </p>
                <h2 className="mt-3 text-4xl font-black">
                  Turn every quiz into measurable progress.
                </h2>
                <p className="mt-4 max-w-xl text-indigo-100">
                  Create your account, attempt a quiz, and receive a detailed
                  result in minutes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link to="/register">
                  <Button className="w-full bg-white text-indigo-700 hover:bg-indigo-50 sm:w-auto">
                    Create account
                  </Button>
                </Link>

                <Link to="/login">
                  <Button className="w-full border border-white/30 bg-white/10 hover:bg-white/20 sm:w-auto">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 QuizNova. All rights reserved.</p>
          <p>Built for smarter learning and assessment.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;