import Skeleton from "./Skeleton";

function QuizCardSkeleton() {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <Skeleton className="h-6 w-24" />

      <Skeleton className="mt-5 h-8 w-3/4" />

      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>

      <Skeleton className="mt-6 h-11 w-full" />
    </article>
  );
}

export default QuizCardSkeleton;