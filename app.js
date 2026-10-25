/* IEEE Beni Suef registration — browser-local persistence and UTF-8 CSV export. */
const STORAGE_KEY = "ieee-beni-suef-registrations";
const committees = ["Event Management","AI","Back-End","Data Analysis","Embedded Systems","Flutter","Front-End","Machine Learning","Cyber Security","Networks","Red Team","UI/UX","Presentation","HR","Visuals","Media","Research","Aerospace","Public Relations","Marketing","Other"];
const branches = ["WIE","SIGHT","CS","AESS"];
const form = document.querySelector("#registrationForm");
const position = document.querySelector("#position");
const committee = document.querySelector("#committee");
const branch = document.querySelector("#branch");
const committeeField = document.querySelector("#committeeField");
const branchField = document.querySelector("#branchField");
const toast = document.querySelector("#toast");

function fillSelect(select, values) { values.forEach(value => select.add(new Option(value, value))); }
fillSelect(committee, committees); fillSelect(branch, branches);

function records() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function updateCount() { document.querySelector("#registrationCount").textContent = records().length.toLocaleString("ar-EG"); }
function showToast(message, isError = false) { toast.textContent = message; toast.classList.toggle("error", isError); toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 3800); }
function setError(id, message) { const input = document.querySelector(`#${id}`); input.classList.toggle("invalid", Boolean(message)); document.querySelector(`#${id}Error`).textContent = message; }
function clearErrors() { document.querySelectorAll(".error-message").forEach(e => e.textContent = ""); document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid")); }

function updateConditionalFields() {
  const isCommittee = ["Member", "Board"].includes(position.value);
  const isHighBoard = position.value === "High Board";
  committeeField.hidden = !isCommittee; branchField.hidden = !isHighBoard;
  committee.required = isCommittee; branch.required = isHighBoard;
  if (!isCommittee) committee.value = ""; if (!isHighBoard) branch.value = "";
  clearErrors();
}
position.addEventListener("change", updateConditionalFields);

form.addEventListener("submit", event => {
  event.preventDefault(); clearErrors();
  let valid = true;
  if (!form.fullName.value.trim()) { setError("fullName", "من فضلك أدخل الاسم بالكامل."); valid = false; }
  if (!position.value) { setError("position", "من فضلك اختر المنصب."); valid = false; }
  if (["Member", "Board"].includes(position.value) && !committee.value) { setError("committee", "من فضلك اختر اللجنة."); valid = false; }
  if (position.value === "High Board" && !branch.value) { setError("branch", "من فضلك اختر الفرع."); valid = false; }
  if (!valid) return;
  const entry = { fullName: form.fullName.value.trim(), contactInfo: form.phone.value.trim(), position: position.value, selectedCommitteeOrBranch: committee.value || branch.value, timestamp: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...records(), entry])); updateCount(); form.reset(); updateConditionalFields(); showToast("تم تسجيل بياناتك بنجاح. أهلاً بك في IEEE!"); }
  catch { showToast("تعذر حفظ البيانات محليًا. تحقق من إعدادات المتصفح.", true); }
});

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
document.querySelector("#exportButton").addEventListener("click", () => {
  const data = records();
  if (!data.length) return showToast("لا توجد تسجيلات لتصديرها بعد.", true);
  const header = ["Full Name", "Contact Info", "Position", "Selected Committee/Branch", "Timestamp"];
  const rows = data.map(row => [row.fullName, row.contactInfo, row.position, row.selectedCommitteeOrBranch, new Date(row.timestamp).toLocaleString("en-CA")]);
  const csv = "\uFEFF" + [header, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8;" }));
  const link = Object.assign(document.createElement("a"), { href:url, download:`ieee-beni-suef-registrations-${new Date().toISOString().slice(0,10)}.csv` });
  link.click(); URL.revokeObjectURL(url); showToast("تم تجهيز ملف CSV للتحميل.");
});
updateCount();
