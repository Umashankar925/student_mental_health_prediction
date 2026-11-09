const API_BASE_URL = "http://127.0.0.1:2200";
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;

// Assumed display range for the gauge. The model itself is not bounded by
// this — it only controls how the arc and band label are drawn.
const GAUGE_MIN = 0;
const GAUGE_MAX = 10;
const GAUGE_CIRCUMFERENCE = 283; // matches the SVG path length used in CSS

const form = document.getElementById("predict-form");
const submitBtn = document.getElementById("submit-btn");
const formError = document.getElementById("form-error");

const panel = document.getElementById("result-panel");
const states = {
  empty: document.getElementById("state-empty"),
  loading: document.getElementById("state-loading"),
  error: document.getElementById("state-error"),
  result: document.getElementById("state-result"),
};

const errorTitle = document.getElementById("error-title");
const errorCopy = document.getElementById("error-copy");
const retryBtn = document.getElementById("retry-btn");
const resetBtn = document.getElementById("reset-btn");

const scoreNumberEl = document.getElementById("score-number");
const scoreBandEl = document.getElementById("score-band");
const gaugeFillEl = document.getElementById("gauge-fill");

const numericFields = [
  "age",
  "avg_daily_usage_hours",
  "daily_unlocks",
  "study_hours",
  "physical_activity_hours",
  "sleep_hours_per_night",
];

function showState(name) {
  Object.entries(states).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
}

function setFormError(message) {
  if (!message) {
    formError.hidden = true;
    formError.textContent = "";
    return;
  }
  formError.hidden = false;
  formError.textContent = message;
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
}

function buildPayload(formData) {
  const payload = {};
  for (const [key, rawValue] of formData.entries()) {
    payload[key] = numericFields.includes(key) ? Number(rawValue) : rawValue;
  }
  return payload;
}

function validatePayload(payload) {
  for (const key of numericFields) {
    if (Number.isNaN(payload[key])) {
      return "Please fill in every field with a valid number.";
    }
  }
  const requiredStrings = [
    "gender",
    "country",
    "academic_level",
    "most_used_platform",
    "purpose_of_use",
    "stress_level",
  ];
  for (const key of requiredStrings) {
    if (!payload[key]) {
      return "Please complete every field before submitting.";
    }
  }
  return null;
}

function scoreBand(score) {
  if (score <= GAUGE_MIN + (GAUGE_MAX - GAUGE_MIN) * 0.3) return { label: "Struggling", color: "#B54A3E" };
  if (score <= GAUGE_MIN + (GAUGE_MAX - GAUGE_MIN) * 0.55) return { label: "Getting by", color: "#E1875F" };
  if (score <= GAUGE_MIN + (GAUGE_MAX - GAUGE_MIN) * 0.8) return { label: "Doing well", color: "#4C8C74" };
  return { label: "Thriving", color: "#2F6F68" };
}

function renderResult(score) {
  const clamped = Math.min(Math.max(score, GAUGE_MIN), GAUGE_MAX);
  const fraction = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  const band = scoreBand(score);

  scoreNumberEl.textContent = score.toFixed(2);
  scoreBandEl.textContent = band.label;
  scoreBandEl.style.color = band.color;

  gaugeFillEl.style.stroke = band.color;
  // Reset then animate on next frame so the transition always plays.
  gaugeFillEl.style.transition = "none";
  gaugeFillEl.style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE);
  requestAnimationFrame(() => {
    gaugeFillEl.style.transition = "";
    gaugeFillEl.style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE * (1 - fraction));
  });

  showState("result");
}

async function handleSubmit(event) {
  event.preventDefault();
  setFormError(null);

  const payload = buildPayload(new FormData(form));
  const validationMessage = validatePayload(payload);
  if (validationMessage) {
    setFormError(validationMessage);
    return;
  }

  setLoading(true);
  showState("loading");

  try {
    const response = await fetch(PREDICT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 422) {
      const details = await response.json().catch(() => null);
      const message = details?.detail?.[0]?.msg || "One of the values entered isn't valid.";
      throw new Error(message);
    }

    if (!response.ok) {
      throw new Error(`The server responded with an error (status ${response.status}).`);
    }

    const data = await response.json();
    if (typeof data.predicted_mental_health_score !== "number") {
      throw new Error("The response didn't include a score.");
    }

    renderResult(data.predicted_mental_health_score);
  } catch (err) {
    const isNetworkError = err instanceof TypeError;
    errorTitle.textContent = isNetworkError ? "Can't reach the server" : "Prediction failed";
    errorCopy.textContent = isNetworkError
      ? `Make sure the FastAPI backend is running at ${API_BASE_URL}.`
      : err.message || "Something unexpected happened. Please try again.";
    showState("error");
  } finally {
    setLoading(false);
  }
}

form.addEventListener("submit", handleSubmit);
retryBtn.addEventListener("click", () => showState("empty"));
resetBtn.addEventListener("click", () => showState("empty"));