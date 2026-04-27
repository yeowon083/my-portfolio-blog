import Link from "next/link";
import { redirect } from "next/navigation";
import NewCommentsBadge from "@/components/NewCommentsBadge";
import { createClient } from "@/lib/supabase/server";

type PostActivity = {
  created_at: string;
  updated_at: string | null;
};

type ContributionCell = {
  count: number;
  dateKey: string;
};

type ContributionWeek = {
  label: string;
  days: ContributionCell[];
};

const CONTRIBUTION_COLORS = [
  "bg-neutral-100",
  "bg-neutral-300",
  "bg-neutral-500",
  "bg-neutral-700",
  "bg-neutral-900",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABEL_ROWS = new Map([
  [1, "Mon"],
  [3, "Wed"],
  [5, "Fri"],
]);
const WEEKS_TO_SHOW = 53;
const MIN_LABEL_WEEK_GAP = 2;

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function buildContributionData(posts: PostActivity[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startWeek = startOfWeek(today);
  const startDate = new Date(startWeek);
  startDate.setDate(startDate.getDate() - (WEEKS_TO_SHOW - 1) * 7);

  const counts = new Map<string, number>();

  for (const post of posts) {
    const createdAt = new Date(post.created_at);
    createdAt.setHours(0, 0, 0, 0);
    const createdKey = getDateKey(createdAt);
    counts.set(createdKey, (counts.get(createdKey) ?? 0) + 1);

    if (post.updated_at && post.updated_at !== post.created_at) {
      const updatedAt = new Date(post.updated_at);
      updatedAt.setHours(0, 0, 0, 0);
      const updatedKey = getDateKey(updatedAt);
      counts.set(updatedKey, (counts.get(updatedKey) ?? 0) + 1);
    }
  }

  const weeks: ContributionWeek[] = [];
  const cursor = new Date(startDate);
  let totalContributions = 0;
  let previousMonth = -1;
  let lastLabelWeekIndex = -MIN_LABEL_WEEK_GAP;

  for (let weekIndex = 0; weekIndex < WEEKS_TO_SHOW; weekIndex += 1) {
    const weekStart = new Date(cursor);
    const monthChanged = weekStart.getMonth() !== previousMonth;
    const isPartialOpeningMonth = weekIndex === 0 && weekStart.getDate() > 7;
    const hasEnoughGap = weekIndex - lastLabelWeekIndex >= MIN_LABEL_WEEK_GAP;
    const shouldShowLabel =
      monthChanged && hasEnoughGap && !isPartialOpeningMonth;
    const label = shouldShowLabel ? formatMonthLabel(weekStart) : "";
    previousMonth = weekStart.getMonth();

    if (shouldShowLabel) {
      lastLabelWeekIndex = weekIndex;
    }

    const days: ContributionCell[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const cellDate = new Date(cursor);
      const dateKey = getDateKey(cellDate);
      const count = counts.get(dateKey) ?? 0;

      totalContributions += count;
      days.push({ count, dateKey });

      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push({ label, days });
  }

  const maxCount = Math.max(
    ...weeks.flatMap((week) => week.days.map((day) => day.count)),
    0
  );

  return {
    label: String(today.getFullYear()),
    maxCount,
    totalContributions,
    weeks,
  };
}

function getContributionClass(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) {
    return CONTRIBUTION_COLORS[0];
  }

  const ratio = count / maxCount;

  if (ratio >= 0.75) return CONTRIBUTION_COLORS[4];
  if (ratio >= 0.5) return CONTRIBUTION_COLORS[3];
  if (ratio >= 0.25) return CONTRIBUTION_COLORS[2];
  return CONTRIBUTION_COLORS[1];
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.email !== "yeowon083@gmail.com") {
    redirect("/");
  }

  const { data: postActivities } = await supabase
    .from("posts")
    .select("created_at, updated_at")
    .order("created_at", { ascending: false });

  const contributionData = buildContributionData(
    (postActivities ?? []) as PostActivity[]
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Admin
          </p>

          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            관리자 페이지
          </h1>

          <p className="mb-10 text-lg leading-8 text-gray-600">
            이 페이지에서는 블로그 글과 프로젝트를 작성하고 수정할 수 있습니다.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/posts"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              글 관리
            </Link>

            <Link
              href="/admin/projects"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              프로젝트 관리
            </Link>

            <Link
              href="/admin/comments"
              className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              댓글 관리
              <NewCommentsBadge />
            </Link>

            <Link
              href="/admin/posts/new"
              className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-85"
            >
              새 글 작성
            </Link>
          </div>
        </div>

        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            로그아웃
          </button>
        </form>
      </div>

      <section className="mt-14">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[28px] font-semibold tracking-tight text-neutral-950">
              {contributionData.totalContributions} contributions in the last year
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-500">
              집계 기준: 글 작성 및 수정
            </p>
            <div className="rounded-md bg-neutral-950 px-5 py-2 text-sm font-semibold text-white">
              {contributionData.label}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-300 bg-white px-4 py-5">
          <div className="w-full">
            <div
              className="mb-1 ml-8 grid w-[calc(100%-2rem)] gap-x-0.5 text-xs text-neutral-700"
              style={{
                gridTemplateColumns: `repeat(${contributionData.weeks.length}, minmax(0, 1fr))`,
              }}
            >
              {contributionData.weeks.map((week, weekIndex) => (
                <span
                  key={`month-${weekIndex}`}
                  className="h-4 min-w-0 whitespace-nowrap text-left"
                >
                  {week.label}
                </span>
              ))}
            </div>

            <div className="flex items-stretch gap-2">
              <div className="grid grid-rows-7 gap-y-0.5 text-xs text-neutral-700">
                {DAY_LABELS.map((_, index) => (
                  <span
                    key={index}
                    className="flex h-full items-center leading-none"
                  >
                    {DAY_LABEL_ROWS.get(index) ?? ""}
                  </span>
                ))}
              </div>

              <div
                className="grid min-w-0 flex-1 gap-x-0.5"
                style={{
                  gridTemplateColumns: `repeat(${contributionData.weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {contributionData.weeks.map((week, weekIndex) => (
                  <div
                    key={`week-${weekIndex}`}
                    className="grid min-w-0 grid-rows-7 gap-y-0.5"
                  >
                    {week.days.map((day) => (
                      <div
                        key={day.dateKey}
                        title={`${day.dateKey}: ${day.count}회`}
                        className={`aspect-square w-full rounded-[2px] border border-neutral-200 ${getContributionClass(
                          day.count,
                          contributionData.maxCount
                        )}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 pl-8 text-xs text-neutral-500">
            <span>작성일과 수정일을 기준으로 활동을 계산해요.</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              {CONTRIBUTION_COLORS.map((colorClass) => (
                <span
                  key={colorClass}
                  className={`h-[11px] w-[11px] rounded-[2px] border border-neutral-200 ${colorClass}`}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}
