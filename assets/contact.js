/*=====================================================================
  Contact form — EmailJS submission with inline status feedback.
=====================================================================*/
(function () {
  "use strict";

  const EMAILJS_PUBLIC_KEY = "LAefwREF5jIr93pXn";
  const EMAILJS_SERVICE_ID = "service_roqrwic";
  const EMAILJS_TEMPLATE_ID = "template_oag43ig";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitButton = document.getElementById("submitButton");
  const buttonLabel = submitButton
    ? submitButton.querySelector(".button__label")
    : null;
  const status = document.getElementById("formStatus");

  function showStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = "form__status is-visible form__status--" + type;
  }

  function clearStatus() {
    if (!status) return;
    status.textContent = "";
    status.className = "form__status";
  }

  function setBusy(isBusy) {
    if (!submitButton) return;
    submitButton.disabled = isBusy;
    if (buttonLabel) {
      buttonLabel.textContent = isBusy ? "Sending…" : "Send Message";
    }
  }

  if (typeof emailjs === "undefined") {
    // The EmailJS CDN did not load — point visitors at the mailto fallback.
    showStatus(
      "The form is unavailable right now. Please email sp.milan04@gmail.com directly.",
      "error"
    );
    setBusy(true);
    return;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    if (!form.checkValidity()) {
      showStatus("Please fill in your name, a valid email and a message.", "error");
      form.reportValidity();
      return;
    }

    const params = {
      to_name: "Milan Sapkota",
      user_name: form.elements.user_name.value.trim(),
      user_email: form.elements.user_email.value.trim(),
      subject: form.elements.subject.value.trim() || "Portfolio enquiry",
      message: form.elements.message.value.trim(),
    };

    setBusy(true);

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then(function () {
        showStatus("Thanks — your message is on its way. I'll reply soon.", "success");
        form.reset();
      })
      .catch(function (error) {
        console.error("EmailJS error:", error);
        showStatus(
          "Something went wrong. Please try again or email sp.milan04@gmail.com.",
          "error"
        );
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();
