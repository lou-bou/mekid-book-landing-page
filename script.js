// Order form -> Google Sheets (Apps Script Web App) submission
document.addEventListener("DOMContentLoaded", function () {
	var form = document.getElementById("order-form");
	if (!form) return;
	var note = document.getElementById("form-note");
	var endpoint = form.getAttribute("data-endpoint");
// Modal elements
var modal = document.getElementById("status-modal");
var modalMsg = document.getElementById("modal-message");
var modalClose = document.getElementById("modal-close");
function openModal(message) {
    if (modal) { modal.setAttribute("aria-hidden", "false"); }
    if (modalMsg) { modalMsg.textContent = message || ""; }
    if (modalClose) { modalClose.style.display = 'none'; modalClose.disabled = true; }
}
function updateModal(message) {
	if (modalMsg) { modalMsg.textContent = message || ""; }
}
function closeModal() {
	if (modal) { modal.setAttribute("aria-hidden", "true"); }
}
if (modalClose) { modalClose.addEventListener("click", closeModal); }

	// Auto-format Algerian phone as '05 68 93 53 43' while typing
	var phoneInput = document.getElementById("phone");
	if (phoneInput) {
		phoneInput.addEventListener("input", function () {
			var digits = this.value.replace(/\D+/g, "").slice(0, 10);
			var out = digits;
			if (digits.length > 2) {
				var first = digits.slice(0, 2);
				var rest = digits.slice(2).match(/\d{1,2}/g) || [];
				out = [first].concat(rest).join(" ");
			}
			this.value = out;
		});
	}
	form.addEventListener("submit", function (e) {
		e.preventDefault();
		// Extra client-side validation for Algerian mobile numbers: 10 digits, start 05/06/07
		var rawPhone = (form.phone.value || "").replace(/\D+/g, "");
		var dzRegex = /^(05|06|07)\d{8}$/;
		if (!dzRegex.test(rawPhone)) {
			note.textContent = "رقم الهاتف غير صالح. أدخل 10 أرقام تبدأ بـ 05 أو 06 أو 07.";
			note.style.color = "#e74c3c";
			form.phone.focus();
			return;
		}
		if (!form.checkValidity()) {
			note.textContent = "يرجى تعبئة جميع الحقول بشكل صحيح.";
			note.style.color = "#e4b651";
			return;
		}
		// Clear any previous inline validation message before loading
		note.textContent = "";
		note.removeAttribute("style");
		// Show dialog while sending
		openModal("يتم الإرسال...");
		// Build FormData to avoid CORS preflight with Apps Script
		var fd = new FormData();
		fd.append("fullName", form.fullName.value.trim());
		// Put normalized phone back into the input to satisfy pattern/minlength
		form.phone.value = rawPhone;
		fd.append("phone", rawPhone);
		fd.append("address", form.address.value.trim());
		fd.append("timestamp", new Date().toISOString());
		var submitBtn = form.querySelector("button[type=submit]");
		if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "يتم الإرسال..."; }
		if (!endpoint || endpoint === "YOUR_APPS_SCRIPT_WEB_APP_URL") {
			note.textContent = "الرجاء تهيئة رابط Google Apps Script أولاً.";
			note.style.color = "#e4b651";
			if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "إرسال الطلب"; }
			return;
		}
		// Use no-cors to avoid CORS errors with Apps Script; response will be opaque
		fetch(endpoint, {
			method: "POST",
			body: fd,
			mode: "no-cors",
			credentials: "omit"
		})
		.then(function () {
			// We cannot read the response in no-cors mode; assume success if no network error
			updateModal("تم استلام طلبك بنجاح. سنتواصل معك قريباً.");
			if (modalClose) { modalClose.style.display = 'inline-block'; modalClose.disabled = false; }
			form.reset();
		})
		.catch(function () {
			updateModal("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
			if (modalClose) { modalClose.style.display = 'inline-block'; modalClose.disabled = false; }
		})
		.finally(function () {
			if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "إرسال الطلب"; }
		});
	});
});


