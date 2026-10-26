/* Paste the Project URL and public anon/publishable key. Never expose service_role. */
const SUPABASE_URL = "https://zwqzijcpfvvyyecjyuuh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cXppamNwZnZ2eXllY2p5dXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NTE1NjUsImV4cCI6MjEwODUyNzU2NX0.nduBuJ_304_KMDugAod5ZKGs7QBk8xIeULMY2iScd20";

const committees = ["Event Management", "Entrepreneurship", "AI", "Back-End", "Data Analysis", "Embedded Systems", "Flutter", "Front-End", "Machine Learning", "Cyber Security", "Networks", "Red Team", "UI/UX", "Presentation", "HR", "Visuals", "Media", "Research", "Aerospace", "PR", "Marketing"];
const seasons = ["Season 10", "Season 9", "Season 8"];
const branches = ["WIE", "SIGHT", "CS", "AESS", "Branch"];
const form = document.querySelector("#registrationForm");
const position = document.querySelector("#position");
const season = document.querySelector("#season");
const committee = document.querySelector("#committee");
const branch = document.querySelector("#branch");
const seasonField = document.querySelector("#seasonField");
const committeeField = document.querySelector("#committeeField");
const branchField = document.querySelector("#branchField");
const submitButton = document.querySelector("#submitButton");
const exportButton = document.querySelector("#exportButton");
const toast = document.querySelector("#toast");
const configured = !SUPABASE_URL.startsWith("PASTE_") && !SUPABASE_ANON_KEY.startsWith("PASTE_");
const db = configured ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function fillSelect(select, values) { values.forEach(value => select.add(new Option(value, value))); }
fillSelect(season, seasons);
fillSelect(committee, committees);
fillSelect(branch, branches);
function showToast(message, isError = false) {
  toast.textContent = message; toast.classList.toggle("error", isError); toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 4200);
}
function setError(id, message) { document.querySelector(`#${id}`).classList.toggle("invalid", Boolean(message)); document.querySelector(`#${id}Error`).textContent = message; }
function clearErrors() { document.querySelectorAll(".error-message").forEach(element => element.textContent = ""); document.querySelectorAll(".invalid").forEach(element => element.classList.remove("invalid")); }
function setBusy(button, busy, label) { button.disabled = busy; button.textContent = busy ? label : button.dataset.label; }
function updateConditionalFields() {
  const useSeason = position.value === "EX-High Board";
  const useCommittee = ["EX-Board", "Board", "Member"].includes(position.value);
  const useBranch = position.value === "High Board";
  seasonField.hidden = !useSeason; committeeField.hidden = !useCommittee; branchField.hidden = !useBranch;
  season.required = useSeason; committee.required = useCommittee; branch.required = useBranch;
  if (!useSeason) season.value = "";
  if (!useCommittee) committee.value = ""; if (!useBranch) branch.value = "";
  clearErrors();
}
[submitButton, exportButton].forEach(button => button.dataset.label = button.textContent.trim());
position.addEventListener("change", updateConditionalFields);

form.addEventListener("submit", async event => {
  event.preventDefault(); clearErrors();
  if (!configured) return showToast("أضف رابط Supabase والمفتاح العام في ملف app.js أولاً.", true);
  let valid = true;
  if (!form.fullName.value.trim()) { setError("fullName", "من فضلك أدخل الاسم بالكامل."); valid = false; }
  if (!form.contactInfo.value.trim()) { setError("contactInfo", "من فضلك أدخل البريد الإلكتروني أو رقم الهاتف."); valid = false; }
  if (!position.value) { setError("position", "من فضلك اختر المنصب."); valid = false; }
  if (position.value === "EX-High Board" && !season.value) { setError("season", "من فضلك اختر الموسم."); valid = false; }
  if (["EX-Board", "Board", "Member"].includes(position.value) && !committee.value) { setError("committee", "من فضلك اختر اللجنة."); valid = false; }
  if (position.value === "High Board" && !branch.value) { setError("branch", "من فضلك اختر الفرع."); valid = false; }
  if (!valid) return;
  setBusy(submitButton, true, "جارٍ الحفظ...");
  const { error } = await db.from("registrations").insert([{
    full_name: form.fullName.value.trim(), contact_info: form.contactInfo.value.trim(),
    position: position.value,
    // Non-Member has no secondary choice; a safe fallback is stored in Supabase.
    assignment: season.value || committee.value || branch.value || "None"
  }]);
  setBusy(submitButton, false);
  if (error) return showToast(`تعذر حفظ التسجيل: ${error.message}`, true);
  form.reset(); updateConditionalFields(); showToast("تم تسجيل بياناتك بنجاح في قاعدة البيانات. أهلاً بك في IEEE!");
});
function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
exportButton.addEventListener("click", async () => {
  if (!configured) return showToast("أضف إعدادات Supabase في ملف app.js أولاً.", true);
  setBusy(exportButton, true, "جارٍ جلب البيانات...");
  const { data, error } = await db.from("registrations").select("id, full_name, contact_info, position, assignment, created_at").order("created_at", { ascending: false });
  setBusy(exportButton, false);
  if (error) return showToast(`تعذر جلب التسجيلات: ${error.message}`, true);
  if (!data.length) return showToast("لا توجد تسجيلات لتصديرها بعد.", true);
  const header = ["ID", "Full Name", "Contact Info", "Position", "Assignment", "Created At"];
  const rows = data.map(row => [row.id, row.full_name, row.contact_info, row.position, row.assignment, new Date(row.created_at).toLocaleString("en-CA")]);
  const csv = "\uFEFF" + [header, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `ieee-beni-suef-registrations-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click(); URL.revokeObjectURL(url); showToast(`تم تصدير ${data.length} تسجيل بنجاح.`);
});
