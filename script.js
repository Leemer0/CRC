const revealElements = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const topbarNav = document.querySelector(".topbar__nav");

if (topbar && menuToggle && topbarNav) {
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  const closeMenu = () => {
    topbar.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  topbarNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileQuery.matches) {
        closeMenu();
      }
    });
  });

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const forms = document.querySelectorAll(".newsletter-form");

const setStatus = (statusEl, message, state = "") => {
  statusEl.textContent = message;
  statusEl.classList.remove("is-success", "is-error");

  if (state === "success") {
    statusEl.classList.add("is-success");
  }

  if (state === "error") {
    statusEl.classList.add("is-error");
  }
};

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[name="email"]');
    const statusEl = form.querySelector(".newsletter-form__status");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!emailInput || !statusEl || !submitButton) {
      return;
    }

    if (!emailInput.checkValidity()) {
      setStatus(statusEl, "Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    setStatus(statusEl, "Submitting your waitlist request...");
    submitButton.disabled = true;

    const source =
      form.dataset.source ||
      form.querySelector('input[name="source"]')?.value ||
      "Website";
    const subject =
      form.querySelector('input[name="_subject"]')?.value ||
      "CRC Founding Waitlist";
    const endpoint = `https://formsubmit.co/ajax/admin@centralracquetclub.ca`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          source,
          _subject: subject,
          _captcha: "false",
          _template: "table",
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      const payload = await response.json();

      if (payload.success !== "true" && payload.success !== true) {
        throw new Error("Submission rejected");
      }

      form.reset();
      setStatus(
        statusEl,
        "You're in. You're on the Central Racquet Club Founding Waitlist.",
        "success",
      );
    } catch (error) {
      setStatus(
        statusEl,
        "Submission is temporarily unavailable. Please email admin@centralracquetclub.ca.",
        "error",
      );
    } finally {
      submitButton.disabled = false;
    }
  });
});
