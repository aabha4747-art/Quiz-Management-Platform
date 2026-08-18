import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Expand,
  FlaskConical,
  ListChecks,
  Minimize,
  Save,
  Send,
  TimerReset,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";

/* =========================================================
   HELPERS
========================================================= */

function formatTime(
  totalSeconds
) {
  const safeSeconds =
    Math.max(
      Number(
        totalSeconds
      ) || 0,
      0
    );

  const minutes =
    Math.floor(
      safeSeconds / 60
    );

  const seconds =
    safeSeconds % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}

function optionLetter(
  index
) {
  return String.fromCharCode(
    65 + index
  );
}

/* =========================================================
   PAGE
========================================================= */

function QuizAttemptPage() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const autoSubmittedRef =
    useRef(false);

  const submissionStartedRef =
    useRef(false);

  const allowNavigationRef =
    useRef(false);

  const saveQueueRef =
    useRef(
      Promise.resolve()
    );

  const [attempt, setAttempt] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [
    visitedQuestions,
    setVisitedQuestions,
  ] = useState(
    new Set()
  );

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    saveStatus,
    setSaveStatus,
  ] = useState("saved");

  const [
    showSubmitModal,
    setShowSubmitModal,
  ] = useState(false);

  const [
    fullscreen,
    setFullscreen,
  ] = useState(
    Boolean(
      document.fullscreenElement
    )
  );

  /* =======================================================
     OPEN AT TOP
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  /* =======================================================
     LOAD ATTEMPT
  ======================================================= */

  useEffect(() => {
    const loadAttempt =
      async () => {
        try {
          const response =
            await api.get(
              `/attempts/${id}`
            );

          const attemptData =
            response.data
              ?.attempt;

          if (
            !attemptData
          ) {
            throw new Error(
              "Attempt data missing"
            );
          }

          if (
            attemptData.status !==
            "IN_PROGRESS"
          ) {
            allowNavigationRef.current =
              true;

            navigate(
              `/student/results/${id}`,
              {
                replace: true,
              }
            );

            return;
          }

          setAttempt(
            attemptData
          );

          const restoredAnswers =
            {};

          const restoredVisited =
            new Set();

          for (
            const answer of
              response.data
                ?.answers ||
              []
          ) {
            if (
              answer
                .selected_option_id !==
                null &&
              answer
                .selected_option_id !==
                undefined
            ) {
              restoredAnswers[
                String(
                  answer.question_id
                )
              ] =
                answer
                  .selected_option_id;

              restoredVisited.add(
                String(
                  answer.question_id
                )
              );
            }
          }

          setAnswers(
            restoredAnswers
          );

          /*
            Restore visited questions
            saved locally on this
            particular browser.
          */

          try {
            const storedVisited =
              JSON.parse(
                localStorage.getItem(
                  `bionova-attempt-${id}-visited`
                ) ||
                  "[]"
              );

            for (
              const questionId of
                storedVisited
            ) {
              restoredVisited.add(
                String(
                  questionId
                )
              );
            }
          } catch {
            // Ignore malformed local state.
          }

          setVisitedQuestions(
            restoredVisited
          );

          const savedIndex =
            Number(
              localStorage.getItem(
                `bionova-attempt-${id}-index`
              )
            );

          if (
            Number.isInteger(
              savedIndex
            ) &&
            savedIndex >= 0 &&
            savedIndex <
              (
                attemptData
                  .questions
                  ?.length ||
                0
              )
          ) {
            setCurrentIndex(
              savedIndex
            );
          }

          const expiryTime =
            new Date(
              attemptData
                .expires_at
            ).getTime();

          const secondsLeft =
            Math.max(
              Math.floor(
                (
                  expiryTime -
                  Date.now()
                ) /
                  1000
              ),
              0
            );

          setRemainingSeconds(
            secondsLeft
          );
        } catch (error) {
          console.error(
            "Attempt load error:",
            error
          );

          toast.error(
            error.response
              ?.data
              ?.message ||
              "Unable to load this quiz attempt."
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadAttempt();
  }, [
    id,
    navigate,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const questions =
    attempt?.questions ||
    [];

  const currentQuestion =
    questions[
      currentIndex
    ];

  const answeredCount =
    useMemo(() => {
      return Object.values(
        answers
      ).filter(
        (value) =>
          value !==
            null &&
          value !==
            undefined
      ).length;
    }, [
      answers,
    ]);

  const unansweredCount =
    Math.max(
      questions.length -
        answeredCount,
      0
    );

  const answerProgress =
    questions.length > 0
      ? Math.round(
          (
            answeredCount /
            questions.length
          ) *
            100
        )
      : 0;

  const selectedOptionId =
    currentQuestion
      ? answers[
          String(
            currentQuestion.id
          )
        ]
      : undefined;

  const lowTime =
    remainingSeconds <=
    300;

  const criticalTime =
    remainingSeconds <=
    60;

  /* =======================================================
     VISITED QUESTIONS
  ======================================================= */

  useEffect(() => {
    if (
      !currentQuestion
    ) {
      return;
    }

    setVisitedQuestions(
      (current) => {
        const next =
          new Set(
            current
          );

        next.add(
          String(
            currentQuestion.id
          )
        );

        return next;
      }
    );
  }, [
    currentQuestion?.id,
  ]);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    localStorage.setItem(
      `bionova-attempt-${id}-visited`,
      JSON.stringify(
        Array.from(
          visitedQuestions
        )
      )
    );
  }, [
    attempt,
    id,
    visitedQuestions,
  ]);

  useEffect(() => {
    if (!attempt) {
      return;
    }

    localStorage.setItem(
      `bionova-attempt-${id}-index`,
      String(
        currentIndex
      )
    );
  }, [
    attempt,
    currentIndex,
    id,
  ]);

  /* =======================================================
     AUTO-SAVE ANSWER
  ======================================================= */

  const saveAnswer =
    (
      questionId,
      optionId
    ) => {
      setSaveStatus(
        "saving"
      );

      /*
        Save requests are serialized.
        This prevents quick answer
        changes from arriving at the
        backend out of order.
      */

      saveQueueRef.current =
        saveQueueRef.current
          .catch(() => {})
          .then(
            async () => {
              try {
                await api.put(
                  `/attempts/${id}/answer`,
                  {
                    questionId:
                      Number(
                        questionId
                      ),

                    selectedOptionId:
                      Number(
                        optionId
                      ),
                  }
                );

                setSaveStatus(
                  "saved"
                );
              } catch (
                error
              ) {
                console.error(
                  "Auto-save error:",
                  error
                );

                setSaveStatus(
                  "error"
                );

                if (
                  error.response
                    ?.data
                    ?.expired
                ) {
                  setRemainingSeconds(
                    0
                  );

                  return;
                }

                toast.error(
                  "Answer could not be saved. Check your connection."
                );
              }
            }
          );
    };

  const selectOption =
    (
      questionId,
      optionId
    ) => {
      if (
        submitting ||
        remainingSeconds <=
          0
      ) {
        return;
      }

      setAnswers(
        (current) => ({
          ...current,

          [String(
            questionId
          )]:
            optionId,
        })
      );

      setVisitedQuestions(
        (current) => {
          const next =
            new Set(
              current
            );

          next.add(
            String(
              questionId
            )
          );

          return next;
        }
      );

      saveAnswer(
        questionId,
        optionId
      );
    };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goPrevious =
    () => {
      setCurrentIndex(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );
    };

  const goNext =
    () => {
      setCurrentIndex(
        (current) =>
          Math.min(
            current + 1,
            questions.length -
              1
          )
      );
    };

  const jumpToFirstUnanswered =
    () => {
      const index =
        questions.findIndex(
          (question) =>
            answers[
              String(
                question.id
              )
            ] ===
            undefined
        );

      if (index >= 0) {
        setCurrentIndex(
          index
        );

        setShowSubmitModal(
          false
        );
      }
    };

  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          loading ||
          submitting ||
          showSubmitModal
        ) {
          return;
        }

        if (
          event.key ===
          "ArrowLeft"
        ) {
          event.preventDefault();

          goPrevious();
        }

        if (
          event.key ===
          "ArrowRight"
        ) {
          event.preventDefault();

          goNext();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    loading,
    submitting,
    showSubmitModal,
    questions.length,
  ]);

  /* =======================================================
     TIMER

     Uses expires_at as the source
     of truth instead of trusting
     only decrementing browser state.
  ======================================================= */

  useEffect(() => {
    if (!attempt) {
      return undefined;
    }

    const updateTimer =
      () => {
        const expiryTime =
          new Date(
            attempt.expires_at
          ).getTime();

        const secondsLeft =
          Math.max(
            Math.floor(
              (
                expiryTime -
                Date.now()
              ) /
                1000
            ),
            0
          );

        setRemainingSeconds(
          secondsLeft
        );
      };

    updateTimer();

    const interval =
      window.setInterval(
        updateTimer,
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    attempt,
  ]);

  /* =======================================================
     SUBMIT QUIZ
  ======================================================= */

  const submitQuiz =
    async (
      automatic = false
    ) => {
      if (
        !attempt ||
        submitting ||
        submissionStartedRef.current
      ) {
        return;
      }

      submissionStartedRef.current =
        true;

      try {
        setSubmitting(
          true
        );

        setShowSubmitModal(
          false
        );

        /*
          Wait for queued auto-save
          requests before final submit.
        */

        try {
          await saveQueueRef.current;
        } catch {
          // Final submit still contains
          // complete answer state.
        }

        const payload = {
          attemptId:
            Number(
              attempt.id
            ),

          answers:
            questions.map(
              (question) => ({
                questionId:
                  Number(
                    question.id
                  ),

                selectedOptionId:
                  answers[
                    String(
                      question.id
                    )
                  ] !==
                  undefined
                    ? Number(
                        answers[
                          String(
                            question.id
                          )
                        ]
                      )
                    : null,
              })
            ),
        };

        const response =
          await api.post(
            `/quizzes/${attempt.quiz_id}/submit`,
            payload
          );

        allowNavigationRef.current =
          true;

        localStorage.removeItem(
          `bionova-attempt-${id}-visited`
        );

        localStorage.removeItem(
          `bionova-attempt-${id}-index`
        );

        toast.success(
          automatic
            ? "Time is up. Quiz submitted automatically."
            : "Quiz submitted successfully."
        );

        window.scrollTo(
          0,
          0
        );

        navigate(
          `/student/results/${response.data.result.id}`,
          {
            replace: true,
          }
        );
      } catch (error) {
        submissionStartedRef.current =
          false;

        autoSubmittedRef.current =
          false;

        console.error(
          "Submit quiz error:",
          error
        );

        /*
          If another request already
          completed the attempt, simply
          open the result page.
        */

        if (
          error.response
            ?.status ===
            409
        ) {
          allowNavigationRef.current =
            true;

          navigate(
            `/student/results/${attempt.id}`,
            {
              replace: true,
            }
          );

          return;
        }

        toast.error(
          error.response
            ?.data
            ?.message ||
            "Unable to submit quiz."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =======================================================
     AUTO SUBMIT
  ======================================================= */

  useEffect(() => {
    if (
      !attempt ||
      loading ||
      remainingSeconds >
        0 ||
      autoSubmittedRef.current
    ) {
      return;
    }

    autoSubmittedRef.current =
      true;

    submitQuiz(
      true
    );
  }, [
    attempt,
    loading,
    remainingSeconds,
  ]);

  /* =======================================================
     WARN BEFORE REFRESH / TAB CLOSE
  ======================================================= */

  useEffect(() => {
    const handleBeforeUnload =
      (event) => {
        if (
          allowNavigationRef.current ||
          !attempt ||
          submitting
        ) {
          return;
        }

        event.preventDefault();

        event.returnValue =
          "";
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
  }, [
    attempt,
    submitting,
  ]);

  /* =======================================================
     BROWSER BACK PROTECTION
  ======================================================= */

  useEffect(() => {
    if (!attempt) {
      return undefined;
    }

    window.history.pushState(
      {
        bionovaQuiz:
          true,
      },
      "",
      window.location.href
    );

    const handlePopState =
      () => {
        if (
          allowNavigationRef.current
        ) {
          return;
        }

        const leave =
          window.confirm(
            "You have an active quiz. Your timer will continue even if you leave. Leave this page?"
          );

        if (leave) {
          allowNavigationRef.current =
            true;

          window.history.back();

          return;
        }

        window.history.pushState(
          {
            bionovaQuiz:
              true,
          },
          "",
          window.location.href
        );
      };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState
      );
  }, [
    attempt,
  ]);

  /* =======================================================
     FULLSCREEN
  ======================================================= */

  useEffect(() => {
    const handleFullscreen =
      () => {
        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
  }, []);

  const toggleFullscreen =
    async () => {
      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();

          return;
        }

        await document.documentElement.requestFullscreen();
      } catch {
        toast.error(
          "Fullscreen mode is not available in this browser."
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />

          <p className="mt-4 font-bold text-slate-600">
            Preparing quiz...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     UNAVAILABLE
  ======================================================= */

  if (
    !attempt ||
    !currentQuestion
  ) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-100 px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={34}
            className="mx-auto text-amber-500"
          />

          <p className="mt-4 font-black text-slate-800">
            Quiz unavailable.
          </p>

          <button
            type="button"
            onClick={() => {
              allowNavigationRef.current =
                true;

              navigate(
                "/student/quizzes"
              );
            }}
            className="mt-5 rounded-xl bg-teal-600 px-5 py-3 font-black text-white"
          >
            Back to quizzes
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-100">
      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1450px] px-4 py-2 sm:px-5">
          <div className="flex items-center justify-between gap-4">
            {/* TITLE */}

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white sm:flex">
                <FlaskConical
                  size={20}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-teal-700">
                  {attempt.category_name ||
                    "Biotechnology"}
                </p>

                <h1 className="truncate text-base font-black text-slate-950 sm:text-lg">
                  {
                    attempt.quiz_title
                  }
                </h1>

                <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                  Attempt{" "}
                  {attempt.attempt_number ||
                    1}
                  {attempt.max_attempts
                    ? ` of ${attempt.max_attempts}`
                    : ""}
                </p>
              </div>
            </div>

            {/* TOP STATS */}

            <div className="flex shrink-0 items-center gap-2">
              <SaveIndicator
                status={
                  saveStatus
                }
              />

              <CompactStat
                label="Answered"
                value={`${answeredCount}/${questions.length}`}
              />

              <button
                type="button"
                onClick={
                  toggleFullscreen
                }
                title={
                  fullscreen
                    ? "Exit focus mode"
                    : "Focus mode"
                }
                className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 sm:flex"
              >
                {fullscreen ? (
                  <Minimize
                    size={17}
                  />
                ) : (
                  <Expand
                    size={17}
                  />
                )}
              </button>

              <div
                className={`min-w-[96px] rounded-xl px-3 py-1.5 text-center ${
                  criticalTime
                    ? "animate-pulse bg-rose-600 text-white"
                    : lowTime
                    ? "bg-rose-50 text-rose-700"
                    : "bg-teal-50 text-teal-700"
                }`}
              >
                <p className="text-[8px] font-black uppercase tracking-wider opacity-70">
                  Time left
                </p>

                <p className="text-base font-black tabular-nums">
                  {formatTime(
                    remainingSeconds
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all"
              style={{
                width: `${answerProgress}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN WORKSPACE
      =================================================== */}

      <section className="mx-auto grid w-full max-w-[1450px] gap-4 px-4 py-3 sm:px-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* =================================================
            QUESTION CARD
        ================================================= */}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-sm font-black text-white">
                {currentIndex +
                  1}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                  Question{" "}
                  {currentIndex +
                    1}{" "}
                  of{" "}
                  {
                    questions.length
                  }
                </p>

                <p className="text-[10px] text-slate-500">
                  {
                    currentQuestion.marks
                  }{" "}
                  mark
                  {Number(
                    currentQuestion.marks
                  ) === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>

            <span className="hidden rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm md:block">
              Single correct answer
            </span>
          </div>

          <div className="px-5 py-5 sm:px-7">
            <h2 className="text-lg font-black leading-7 text-slate-950 sm:text-xl">
              {
                currentQuestion.question_text
              }
            </h2>

            <p className="mt-2 text-xs font-medium text-slate-400">
              Select the best answer. Your choice is automatically saved.
            </p>

            {/* OPTIONS */}

            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map(
                (
                  option,
                  optionIndex
                ) => {
                  const selected =
                    Number(
                      selectedOptionId
                    ) ===
                    Number(
                      option.id
                    );

                  return (
                    <button
                      key={
                        option.id
                      }
                      type="button"
                      disabled={
                        submitting ||
                        remainingSeconds <=
                          0
                      }
                      onClick={() =>
                        selectOption(
                          currentQuestion.id,
                          option.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                          : "border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                          selected
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {selected ? (
                          <Check
                            size={16}
                          />
                        ) : (
                          optionLetter(
                            optionIndex
                          )
                        )}
                      </span>

                      <span
                        className={`min-w-0 flex-1 text-[15px] font-semibold leading-6 ${
                          selected
                            ? "text-teal-950"
                            : "text-slate-800"
                        }`}
                      >
                        {
                          option.option_text
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* STATUS */}

            <div className="mt-4">
              {selectedOptionId !==
              undefined ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2
                    size={14}
                  />

                  Answer selected and queued for save
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  <AlertTriangle
                    size={14}
                  />

                  This question is unanswered
                </div>
              )}
            </div>

            {/* NAV */}

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={
                  goPrevious
                }
                disabled={
                  currentIndex ===
                    0 ||
                  submitting
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft
                  size={15}
                />

                Previous
              </button>

              <p className="hidden text-[11px] font-bold text-slate-400 sm:block">
                ← / → keyboard navigation
              </p>

              {currentIndex <
              questions.length -
                1 ? (
                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  disabled={
                    submitting
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  Next question

                  <ArrowRight
                    size={15}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    setShowSubmitModal(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Send
                    size={15}
                  />

                  Review & finish
                </button>
              )}
            </div>
          </div>
        </article>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="space-y-3">
          {/* QUESTION NAV */}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-teal-700">
                  Navigation
                </p>

                <h3 className="text-sm font-black text-slate-950">
                  Questions
                </h3>
              </div>

              <ListChecks
                size={18}
                className="text-teal-600"
              />
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {questions.map(
                (
                  question,
                  index
                ) => {
                  const key =
                    String(
                      question.id
                    );

                  const answered =
                    answers[
                      key
                    ] !==
                    undefined;

                  const visited =
                    visitedQuestions.has(
                      key
                    );

                  const current =
                    index ===
                    currentIndex;

                  let className =
                    "bg-slate-100 text-slate-600";

                  if (
                    visited &&
                    !answered
                  ) {
                    className =
                      "bg-rose-50 text-rose-700 border border-rose-200";
                  }

                  if (answered) {
                    className =
                      "bg-emerald-100 text-emerald-700";
                  }

                  if (current) {
                    className =
                      "bg-teal-600 text-white ring-2 ring-teal-100";
                  }

                  return (
                    <button
                      key={
                        question.id
                      }
                      type="button"
                      disabled={
                        submitting
                      }
                      title={
                        current
                          ? "Current question"
                          : answered
                          ? "Answered"
                          : visited
                          ? "Visited but unanswered"
                          : "Not visited"
                      }
                      onClick={() =>
                        setCurrentIndex(
                          index
                        )
                      }
                      className={`flex h-9 items-center justify-center rounded-lg text-xs font-black transition ${className}`}
                    >
                      {index +
                        1}
                    </button>
                  );
                }
              )}
            </div>

            {/* LEGEND */}

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
              <Legend
                className="bg-teal-600"
                text="Current"
              />

              <Legend
                className="bg-emerald-100"
                text="Answered"
              />

              <Legend
                className="bg-rose-100"
                text="Unanswered"
              />

              <Legend
                className="bg-slate-100"
                text="Not visited"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-500">
                Completed
              </span>

              <strong className="text-slate-900">
                {
                  answeredCount
                }
                /
                {
                  questions.length
                }
              </strong>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${answerProgress}%`,
                }}
              />
            </div>
          </section>

          {/* TIMER */}

          <section
            className={`rounded-2xl border p-4 ${
              lowTime
                ? "border-rose-200 bg-rose-50"
                : "border-cyan-200 bg-cyan-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <TimerReset
                size={18}
                className={
                  lowTime
                    ? "text-rose-600"
                    : "text-cyan-700"
                }
              />

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider opacity-60">
                  Time remaining
                </p>

                <p className="text-xl font-black tabular-nums">
                  {formatTime(
                    remainingSeconds
                  )}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[10px] leading-4 opacity-70">
              The backend expiry time remains the source of truth.
            </p>
          </section>

          {/* SAVE STATUS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <SaveStatusRow
              status={
                saveStatus
              }
            />

            {attempt.attempt_number && (
              <p className="mt-3 text-xs text-slate-500">
                Attempt{" "}
                <strong>
                  {
                    attempt.attempt_number
                  }
                </strong>
                {attempt.max_attempts
                  ? ` of ${attempt.max_attempts}`
                  : ""}
              </p>
            )}
          </section>

          {/* SUBMIT */}

          <button
            type="button"
            onClick={() =>
              setShowSubmitModal(
                true
              )
            }
            disabled={
              submitting
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send
              size={15}
            />

            {submitting
              ? "Submitting..."
              : "Review & submit"}
          </button>
        </aside>
      </section>

      {/* ===================================================
          SUBMIT MODAL
      =================================================== */}

      {showSubmitModal && (
        <SubmitModal
          answeredCount={
            answeredCount
          }
          unansweredCount={
            unansweredCount
          }
          totalQuestions={
            questions.length
          }
          remainingSeconds={
            remainingSeconds
          }
          submitting={
            submitting
          }
          onJumpToUnanswered={
            jumpToFirstUnanswered
          }
          onCancel={() =>
            setShowSubmitModal(
              false
            )
          }
          onSubmit={() =>
            submitQuiz(
              false
            )
          }
        />
      )}
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function CompactStat({
  label,
  value,
}) {
  return (
    <div className="hidden min-w-[84px] rounded-xl bg-slate-50 px-3 py-1.5 text-center md:block">
      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="text-sm font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SaveIndicator({
  status,
}) {
  return (
    <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black sm:flex">
      {status ===
      "saving" ? (
        <>
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />

          <span className="text-teal-700">
            Saving
          </span>
        </>
      ) : status ===
        "error" ? (
        <>
          <AlertTriangle
            size={14}
            className="text-rose-600"
          />

          <span className="text-rose-600">
            Save failed
          </span>
        </>
      ) : (
        <>
          <CheckCircle2
            size={14}
            className="text-emerald-600"
          />

          <span className="text-emerald-700">
            Saved
          </span>
        </>
      )}
    </div>
  );
}

function SaveStatusRow({
  status,
}) {
  if (
    status ===
    "saving"
  ) {
    return (
      <div className="flex items-center gap-3 text-sm font-bold text-teal-700">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />

        Saving your answer...
      </div>
    );
  }

  if (
    status ===
    "error"
  ) {
    return (
      <div className="flex items-center gap-3 text-sm font-bold text-rose-700">
        <AlertTriangle
          size={17}
        />

        Latest answer was not saved
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm font-bold text-emerald-700">
      <Save
        size={17}
      />

      Answers saved automatically
    </div>
  );
}

function Legend({
  className,
  text,
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded ${className}`}
      />

      {text}
    </div>
  );
}

function SubmitModal({
  answeredCount,
  unansweredCount,
  totalQuestions,
  remainingSeconds,
  submitting,
  onCancel,
  onSubmit,
  onJumpToUnanswered,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-5 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-700">
              Review
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Ready to submit?
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              submitting
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-4 gap-2">
            <ModalMetric
              label="Total"
              value={
                totalQuestions
              }
            />

            <ModalMetric
              label="Answered"
              value={
                answeredCount
              }
            />

            <ModalMetric
              label="Missing"
              value={
                unansweredCount
              }
            />

            <ModalMetric
              label="Time"
              value={formatTime(
                remainingSeconds
              )}
              small
            />
          </div>

          {unansweredCount >
            0 ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-4">
              <div className="flex gap-3 text-sm text-amber-800">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  You still have{" "}
                  <strong>
                    {
                      unansweredCount
                    }
                  </strong>{" "}
                  unanswered question
                  {unansweredCount ===
                  1
                    ? ""
                    : "s"}
                  .
                </span>
              </div>

              <button
                type="button"
                onClick={
                  onJumpToUnanswered
                }
                disabled={
                  submitting
                }
                className="mt-3 text-sm font-black text-amber-900 underline"
              >
                Go to first unanswered question
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0"
              />

              All questions have been answered.
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                submitting
              }
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Continue quiz
            </button>

            <button
              type="button"
              onClick={
                onSubmit
              }
              disabled={
                submitting
              }
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : unansweredCount >
                  0
                ? "Submit anyway"
                : "Submit quiz"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ModalMetric({
  label,
  value,
  small = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p
        className={`font-black text-slate-950 ${
          small
            ? "text-sm"
            : "text-xl"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default QuizAttemptPage;