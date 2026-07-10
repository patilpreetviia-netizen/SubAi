import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = () => process.env.VITE_ADMIN_EMAIL || "patilpreetviia@gmail.com";

async function requireAdmin(accessToken) {
  if (!accessToken) throw new Error("Unauthorized: no access token");
  const sb = createClient(
    process.env.VITE_SUPABASE_URL || "",
    process.env.VITE_SUPABASE_ANON_KEY || "",
  );
  const {
    data: { user },
    error,
  } = await sb.auth.getUser(accessToken);
  if (error || !user || user.email !== ADMIN_EMAIL()) {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return createClient(url || "", key || "");
}

export const getAdminStats = createServerFn({ method: "GET" })
  .validator((input) => {
    const accessToken = input?.data?.accessToken || input?.accessToken;
    if (!accessToken) throw new Error("accessToken is required");
    return { accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();

    const [usersRes, jobsRes, subsRes, storageRes] = await Promise.all([
      sb.auth.admin.listUsers(),
      sb
        .from("jobs")
        .select(
          "id, user_id, title, language, status, created_at, duration, thumb_color, ai_description",
          { count: "exact" },
        ),
      sb.from("subtitles").select("id, job_id, start_sec, end_sec", { count: "exact" }),
      sb.storage.from("videos").list(),
    ]);

    const users = usersRes.data?.users || [];
    const jobs = jobsRes.data || [];
    const allSubtitles = subsRes.data || [];
    const subtitleCount = subsRes.count || 0;
    const storageFiles = storageRes.data || [];

    const jobsByStatus = { processing: 0, completed: 0 };
    jobs.forEach((j) => {
      jobsByStatus[j.status] = (jobsByStatus[j.status] || 0) + 1;
    });

    const jobsByLanguage = {};
    jobs.forEach((j) => {
      const lang = j.language || "unknown";
      jobsByLanguage[lang] = (jobsByLanguage[lang] || 0) + 1;
    });

    const jobsByDate = {};
    const usersByDate = {};
    const jobsByWeekday = Array(7).fill(0);
    const jobsByHour = Array(24).fill(0);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    jobs.forEach((j) => {
      if (!j.created_at) return;
      const d = new Date(j.created_at);
      const day = d.toISOString().slice(0, 10);
      jobsByDate[day] = (jobsByDate[day] || 0) + 1;
      jobsByWeekday[d.getUTCDay()]++;
      jobsByHour[d.getUTCHours()]++;
    });
    users.forEach((u) => {
      if (!u.created_at) return;
      const day = new Date(u.created_at).toISOString().slice(0, 10);
      usersByDate[day] = (usersByDate[day] || 0) + 1;
    });

    const jobsByDateArray = Object.entries(jobsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const usersByDateArray = Object.entries(usersByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const langOverTime = {};
    jobs.forEach((j) => {
      if (!j.created_at || !j.language) return;
      const day = j.created_at.slice(0, 10);
      if (!langOverTime[day]) langOverTime[day] = {};
      langOverTime[day][j.language] = (langOverTime[day][j.language] || 0) + 1;
    });
    const allLangs = [...new Set(jobs.filter((j) => j.language).map((j) => j.language))];
    const langTrendData = Object.entries(langOverTime)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, langs]) => ({
        date,
        ...Object.fromEntries(allLangs.map((l) => [l, langs[l] || 0])),
      }));

    const userJobCounts = {};
    const userSubtitleCounts = {};
    jobs.forEach((j) => {
      userJobCounts[j.user_id] = (userJobCounts[j.user_id] || 0) + 1;
    });
    allSubtitles.forEach((s) => {
      userSubtitleCounts[s.job_id] = (userSubtitleCounts[s.job_id] || 0) + 1;
    });

    const topUsers = Object.entries(userJobCounts)
      .map(([userId, count]) => {
        const u = users.find((x) => x.id === userId);
        return {
          userId,
          email: u?.email || "unknown",
          name: u?.user_metadata?.full_name || "",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const userList = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || "",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      jobCount: userJobCounts[u.id] || 0,
    }));

    const subDurationPerJob = {};
    allSubtitles.forEach((s) => {
      if (!subDurationPerJob[s.job_id]) subDurationPerJob[s.job_id] = 0;
      subDurationPerJob[s.job_id] += (s.end_sec || 0) - (s.start_sec || 0);
    });
    const avgSubDuration =
      allSubtitles.length > 0
        ? Object.values(subDurationPerJob).reduce((a, b) => a + b, 0) /
          Object.keys(subDurationPerJob).length
        : 0;

    let totalCompletionMs = 0;
    let completionCount = 0;
    jobs.forEach((j) => {
      if (j.status === "completed" && j.created_at && j.completed_at) {
        const created = new Date(j.created_at).getTime();
        const completed = new Date(j.completed_at).getTime();
        if (completed > created) {
          totalCompletionMs += completed - created;
          completionCount++;
        }
      }
    });
    const avgCompletionMin =
      completionCount > 0 ? Math.round(totalCompletionMs / completionCount / 60000) : "N/A";

    const now = Date.now();
    const day7 = now - 7 * 86400000;
    const day30 = now - 30 * 86400000;
    const active7 = new Set();
    const active30 = new Set();
    jobs.forEach((j) => {
      if (!j.created_at) return;
      const t = new Date(j.created_at).getTime();
      if (t >= day7) active7.add(j.user_id);
      if (t >= day30) active30.add(j.user_id);
    });

    const durationBuckets = { "<30s": 0, "30s-2m": 0, "2m-5m": 0, "5m-10m": 0, ">10m": 0 };
    jobs.forEach((j) => {
      const d = parseFloat(j.duration);
      if (isNaN(d)) return;
      if (d < 30) durationBuckets["<30s"]++;
      else if (d < 120) durationBuckets["30s-2m"]++;
      else if (d < 300) durationBuckets["2m-5m"]++;
      else if (d < 600) durationBuckets["5m-10m"]++;
      else durationBuckets[">10m"]++;
    });

    let cumJobs = 0;
    let cumUsers = 0;
    const cumulativeData = jobsByDateArray.map((d) => {
      cumJobs += d.count;
      const newUsersToday = usersByDateArray.find((u) => u.date === d.date)?.count || 0;
      cumUsers += newUsersToday;
      return { date: d.date, jobs: cumJobs, users: cumUsers };
    });

    const engagementBuckets = { "1 job": 0, "2-3 jobs": 0, "4-10 jobs": 0, ">10 jobs": 0 };
    Object.values(userJobCounts).forEach((c) => {
      if (c === 1) engagementBuckets["1 job"]++;
      else if (c <= 3) engagementBuckets["2-3 jobs"]++;
      else if (c <= 10) engagementBuckets["4-10 jobs"]++;
      else engagementBuckets[">10 jobs"]++;
    });

    const emailStats = { welcome: 0, test: 0, freeTierLimit: 0 };

    return {
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalSubtitles: subtitleCount,
      totalStorageFiles: storageFiles.length,
      jobsByStatus,
      jobsByLanguage,
      jobsByDate: jobsByDateArray,
      usersByDate: usersByDateArray,
      jobsByWeekday: weekdays.map((name, i) => ({ name, count: jobsByWeekday[i] })),
      jobsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: jobsByHour[i] })),
      langTrendData,
      topUsers,
      userList,
      avgSubDuration: Math.round(avgSubDuration),
      avgCompletionMin,
      activeUsers7: active7.size,
      activeUsers30: active30.size,
      durationBuckets,
      cumulativeData,
      engagementBuckets,
      emailStats,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        user_id: j.user_id,
        language: j.language,
        status: j.status,
        duration: j.duration,
        created_at: j.created_at,
        ai_description: j.ai_description,
        thumb_color: j.thumb_color,
        userEmail: users.find((u) => u.id === j.user_id)?.email || "unknown",
      })),
    };
  });

export const getAdminJobDetail = createServerFn({ method: "GET" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.jobId) throw new Error("jobId is required");
    if (!payload.accessToken) throw new Error("accessToken is required");
    return { jobId: payload.jobId, accessToken: payload.accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const { data: job } = await sb.from("jobs").select("*").eq("id", data.jobId).single();
    if (!job) return null;
    const { data: subtitles } = await sb
      .from("subtitles")
      .select("*")
      .eq("job_id", data.jobId)
      .order("sort_order");
    const {
      data: { users },
    } = await sb.auth.admin.listUsers();
    const user = users?.find((u) => u.id === job.user_id);
    return {
      ...job,
      userEmail: user?.email || "unknown",
      userName: user?.user_metadata?.full_name || "",
      subtitles: subtitles || [],
    };
  });

export const getAdminUsers = createServerFn({ method: "GET" })
  .validator((input) => {
    const accessToken = input?.data?.accessToken || input?.accessToken;
    if (!accessToken) throw new Error("accessToken is required");
    return { accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();

    const {
      data: { users },
    } = await sb.auth.admin.listUsers();
    const { data: jobs } = await sb.from("jobs").select("user_id, created_at, language");
    const { data: subs } = await sb.from("subtitles").select("user_id");

    const userJobCounts = {};
    const userLangCounts = {};
    jobs?.forEach((j) => {
      userJobCounts[j.user_id] = (userJobCounts[j.user_id] || 0) + 1;
      if (!userLangCounts[j.user_id]) userLangCounts[j.user_id] = {};
      userLangCounts[j.user_id][j.language || "unknown"] =
        (userLangCounts[j.user_id][j.language || "unknown"] || 0) + 1;
    });
    const userSubCounts = {};
    subs?.forEach((s) => {
      userSubCounts[s.user_id] = (userSubCounts[s.user_id] || 0) + 1;
    });

    const now = Date.now();
    const day7 = now - 7 * 86400000;
    const day30 = now - 30 * 86400000;
    const recentUserIds7 = new Set();
    const recentUserIds30 = new Set();
    jobs?.forEach((j) => {
      if (!j.created_at) return;
      const t = new Date(j.created_at).getTime();
      if (t >= day7) recentUserIds7.add(j.user_id);
      if (t >= day30) recentUserIds30.add(j.user_id);
    });

    return (users || []).map((u) => {
      const topLang = userLangCounts[u.id]
        ? Object.entries(userLangCounts[u.id]).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
        : "—";
      return {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || "",
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at,
        jobCount: userJobCounts[u.id] || 0,
        subCount: userSubCounts[u.id] || 0,
        topLanguage: topLang,
        active7: recentUserIds7.has(u.id),
        active30: recentUserIds30.has(u.id),
        banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
        provider: u.app_metadata?.provider || "email",
      };
    });
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken is required");
    if (!payload.userId) throw new Error("userId is required");
    return { accessToken: payload.accessToken, userId: payload.userId };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    // Delete all jobs and subtitles for user first
    const { data: jobs } = await sb.from("jobs").select("id").eq("user_id", data.userId);
    if (jobs?.length) {
      const jobIds = jobs.map((j) => j.id);
      await sb.from("subtitles").delete().in("job_id", jobIds);
      await sb.from("jobs").delete().eq("user_id", data.userId);
    }
    const { error } = await sb.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const banAdminUser = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken is required");
    if (!payload.userId) throw new Error("userId is required");
    return {
      accessToken: payload.accessToken,
      userId: payload.userId,
      banned: payload.banned ?? true,
    };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const banUntil = data.banned
      ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // ~100 years
      : new Date(0).toISOString(); // unban
    const { error } = await sb.auth.admin.updateUserById(data.userId, {
      ban_duration: data.banned ? "876000h" : "none",
    });
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const deleteAdminJob = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken is required");
    if (!payload.jobId) throw new Error("jobId is required");
    return { accessToken: payload.accessToken, jobId: payload.jobId };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    await sb.from("subtitles").delete().eq("job_id", data.jobId);
    const { error } = await sb.from("jobs").delete().eq("id", data.jobId);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const exportAdminData = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken required");
    if (!payload.type) throw new Error("type required (users|jobs)");
    return { accessToken: payload.accessToken, type: payload.type };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    if (data.type === "users") {
      const {
        data: { users },
      } = await sb.auth.admin.listUsers();
      const csv =
        "id,email,name,created_at,last_sign_in\n" +
        (users || [])
          .map(
            (u) =>
              `${u.id},${u.email},"${(u.user_metadata?.full_name || "").replace(/"/g, '""')}",${u.created_at},${u.last_sign_in_at || ""}`,
          )
          .join("\n");
      return { csv, filename: "users-export.csv" };
    } else {
      const { data: jobs } = await sb
        .from("jobs")
        .select("id,user_id,title,language,status,created_at,duration");
      const csv =
        "id,user_id,title,language,status,created_at,duration\n" +
        (jobs || [])
          .map(
            (j) =>
              `${j.id},${j.user_id},"${(j.title || "").replace(/"/g, '""')}",${j.language},${j.status},${j.created_at},${j.duration || ""}`,
          )
          .join("\n");
      return { csv, filename: "jobs-export.csv" };
    }
  });

export const getStorageFiles = createServerFn({ method: "GET" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken required");
    return { accessToken: payload.accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const { data: files } = await sb.storage
      .from("videos")
      .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    return (files || []).map((f) => ({
      id: f.id,
      name: f.name,
      size: f.metadata?.size || 0,
      mimeType: f.metadata?.mimetype || "unknown",
      createdAt: f.created_at,
    }));
  });

export const deleteStorageFile = createServerFn({ method: "POST" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken required");
    if (!payload.path) throw new Error("path required");
    return { accessToken: payload.accessToken, path: payload.path };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const { error } = await sb.storage.from("videos").remove([data.path]);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getAuditLog = createServerFn({ method: "GET" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken required");
    return { accessToken: payload.accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const { data: logs, error } = await sb
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return logs || [];
  });

export const getRevenueStats = createServerFn({ method: "GET" })
  .validator((input) => {
    const payload = input?.data ? input.data : input;
    if (!payload.accessToken) throw new Error("accessToken required");
    return { accessToken: payload.accessToken };
  })
  .handler(async ({ data }) => {
    await requireAdmin(data.accessToken);
    const sb = getAdminClient();
    const { data: jobs } = await sb.from("jobs").select("id,created_at,status");
    const totalJobs = (jobs || []).length;
    const completedJobs = (jobs || []).filter((j) => j.status === "completed").length;
    const estimatedRevenue = completedJobs * 50;
    const jobsThisMonth = (jobs || []).filter((j) => {
      const d = new Date(j.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { totalJobs, completedJobs, estimatedRevenue, jobsThisMonth };
  });
