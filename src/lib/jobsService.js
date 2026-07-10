import { supabase } from "../lib/supabase";

/**
 * Fetch all jobs for the currently authenticated user.
 * Falls back to MOCK_JOBS if the table doesn't exist or there's no session.
 */
export async function fetchJobs() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchJobs error:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Insert a new job row after uploading a video.
 */
export async function createJob({
  title,
  language = "hinglish",
  duration = "—",
  storageKey,
  aiDescription,
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: user.id,
      title,
      language,
      duration,
      status: "processing",
      storage_key: storageKey,
      ai_description: aiDescription ?? null,
      thumb_color: ["#facc15", "#a1a1aa", "#71717a", "#f472b6"][Math.floor(Math.random() * 4)],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark a job as completed.
 */
export async function completeJob(jobId) {
  const { error } = await supabase.from("jobs").update({ status: "completed" }).eq("id", jobId);
  if (error) console.error("completeJob error:", error.message);
}

/**
 * Upload a video file to Supabase Storage (bucket: "videos").
 * Returns the storage key (path inside the bucket).
 */
export async function uploadVideo(file) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop();
  const key = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("videos").upload(key, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return key;
}

/**
 * Get a signed URL for a video in Supabase Storage.
 */
export async function getVideoUrl(storageKey) {
  const { data, error } = await supabase.storage.from("videos").createSignedUrl(storageKey, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Save subtitle rows for a job (upserts by job_id, replacing all existing ones).
 */
export async function saveSubtitles(jobId, subtitles) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Delete existing subtitles for this job first
  await supabase.from("subtitles").delete().eq("job_id", jobId);

  if (!subtitles || subtitles.length === 0) return;

  const rows = subtitles.map((s, i) => ({
    job_id: jobId,
    user_id: user.id,
    start_sec: s.start,
    end_sec: s.end,
    text: s.text,
    sort_order: i,
  }));

  const { error } = await supabase.from("subtitles").insert(rows);
  if (error) console.error("saveSubtitles error:", error.message);
}

/**
 * Load subtitle rows for a job and return them in our app format.
 */
export async function loadSubtitles(jobId) {
  const { data, error } = await supabase
    .from("subtitles")
    .select("*")
    .eq("job_id", jobId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("loadSubtitles error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    start: row.start_sec,
    end: row.end_sec,
    text: row.text,
  }));
}

/**
 * Delete a job and its associated data.
 */
export async function deleteJob(jobId) {
  const { error: subErr } = await supabase.from("subtitles").delete().eq("job_id", jobId);
  if (subErr) console.error("Error deleting subtitles:", subErr.message);

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw error;
}
