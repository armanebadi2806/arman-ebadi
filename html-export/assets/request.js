(function () {
  const form = document.querySelector('[data-request-form]');
  if (!form) return;

  const stepNodes = Array.from(document.querySelectorAll('[data-question-step]'));
  const tabNodes = Array.from(document.querySelectorAll('[data-step-dot]'));
  const progressNode = document.querySelector('[data-request-progress]');
  const stepLabelNode = document.querySelector('[data-request-step]');
  const backBtn = document.querySelector('[data-request-back]');
  const nextBtn = document.querySelector('[data-request-next]');
  const submitBtn = document.querySelector('[data-request-submit]');

  const storageKey = 'arman_request_flow_v3';
  const totalSteps = stepNodes.length;
  let currentStep = 0;

  const state = {
    projectType: '',
    primaryGoal: '',
    featureNeed: '',
    budgetRange: '',
    timeline: '',
    preferredContact: '',
    features: [],
    featureNotes: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: ''
  };

  const refs = {
    featureInput: form.querySelector('[data-feature-input]'),
    featureAddBtn: form.querySelector('[data-feature-add]'),
    featureTags: form.querySelector('[data-feature-tags]'),
    featureNotes: form.querySelector('[name="featureNotes"]'),
    featureDetail: form.querySelector('[data-feature-detail]'),
    contactName: form.querySelector('[name="contactName"]'),
    contactEmail: form.querySelector('[name="contactEmail"]'),
    contactPhone: form.querySelector('[name="contactPhone"]'),
    website: form.querySelector('[name="website"]'),
    globalWarning: form.querySelector('[data-form-warning]'),
    emailWarning: form.querySelector('[data-warning="email"]'),
    phoneWarning: form.querySelector('[data-warning="phone"]')
  };

  function sanitizeText(value, maxLength) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, maxLength);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 6;
  }

  function showWarning(node, message) {
    if (!node) return;
    node.textContent = message || '';
  }

  function setGlobalWarning(message) {
    if (!refs.globalWarning) return;
    if (!message) {
      refs.globalWarning.classList.remove('show');
      refs.globalWarning.textContent = '';
      return;
    }

    refs.globalWarning.classList.add('show');
    refs.globalWarning.textContent = message;
  }

  function syncHiddenFields() {
    form.querySelector('[name="projectType"]').value = state.projectType;
    form.querySelector('[name="primaryGoal"]').value = state.primaryGoal;
    form.querySelector('[name="featureNeed"]').value = state.featureNeed;
    form.querySelector('[name="budgetRange"]').value = state.budgetRange;
    form.querySelector('[name="timeline"]').value = state.timeline;
    form.querySelector('[name="preferredContact"]').value = state.preferredContact;
    form.querySelector('[name="features"]').value = JSON.stringify(state.features);
  }

  function renderFeatureDetail() {
    if (!refs.featureDetail) return;
    const show = state.featureNeed === 'Ja';
    refs.featureDetail.classList.toggle('is-visible', show);

    if (!show) {
      state.features = [];
      state.featureNotes = '';
      refs.featureNotes.value = '';
      renderFeatureTags();
      renderFeatureSuggestions();
    }
  }

  function renderSlotSelection() {
    const buttons = form.querySelectorAll('[data-slot-group][data-slot-value]');
    buttons.forEach((btn) => {
      const group = btn.dataset.slotGroup;
      const value = btn.dataset.slotValue;
      btn.classList.toggle('is-selected', state[group] === value);
      btn.setAttribute('aria-pressed', state[group] === value ? 'true' : 'false');
    });
  }

  function renderFeatureTags() {
    if (!refs.featureTags) return;

    refs.featureTags.innerHTML = '';
    state.features.forEach((feature) => {
      const tag = document.createElement('span');
      tag.className = 'feature-tag';
      tag.textContent = feature;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tag-remove';
      removeBtn.setAttribute('data-remove-feature', feature);
      removeBtn.setAttribute('aria-label', 'Feature entfernen');
      removeBtn.textContent = 'x';

      tag.appendChild(removeBtn);
      refs.featureTags.appendChild(tag);
    });
  }

  function renderFeatureSuggestions() {
    const suggestionButtons = form.querySelectorAll('[data-feature-suggestion]');
    suggestionButtons.forEach((btn) => {
      const value = sanitizeText(btn.dataset.featureSuggestion, 60);
      btn.classList.toggle('is-selected', state.features.includes(value));
      btn.setAttribute('aria-pressed', state.features.includes(value) ? 'true' : 'false');
    });
  }

  function addFeature(raw) {
    const normalized = sanitizeText(raw, 60);
    if (!normalized) return;
    if (state.features.includes(normalized)) return;

    state.features.push(normalized);
    renderFeatureTags();
    renderFeatureSuggestions();
    saveState();
  }

  function removeFeature(raw) {
    state.features = state.features.filter((item) => item !== raw);
    renderFeatureTags();
    renderFeatureSuggestions();
    saveState();
  }

  function saveState() {
    syncHiddenFields();
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function restoreState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      state.projectType = sanitizeText(parsed.projectType, 60);
      state.primaryGoal = sanitizeText(parsed.primaryGoal, 60);
      state.featureNeed = sanitizeText(parsed.featureNeed, 12);
      state.budgetRange = sanitizeText(parsed.budgetRange, 60);
      state.timeline = sanitizeText(parsed.timeline, 60);
      state.preferredContact = sanitizeText(parsed.preferredContact, 60);
      state.features = Array.isArray(parsed.features) ? parsed.features.map((item) => sanitizeText(item, 60)).filter(Boolean) : [];
      state.featureNotes = sanitizeText(parsed.featureNotes, 1000);
      state.contactName = sanitizeText(parsed.contactName, 100);
      state.contactEmail = sanitizeText(parsed.contactEmail, 120);
      state.contactPhone = sanitizeText(parsed.contactPhone, 40);
      state.website = sanitizeText(parsed.website, 80);

      refs.featureNotes.value = state.featureNotes;
      refs.contactName.value = state.contactName;
      refs.contactEmail.value = state.contactEmail;
      refs.contactPhone.value = state.contactPhone;
      refs.website.value = state.website;
    } catch (error) {
      console.warn('Stored request state could not be restored.', error);
    }
  }

  function validateContact(showErrors) {
    const email = sanitizeText(refs.contactEmail.value, 120);
    const phone = sanitizeText(refs.contactPhone.value, 40);

    let valid = true;

    if (!isValidEmail(email)) {
      valid = false;
      if (showErrors) {
        showWarning(refs.emailWarning, 'Bitte gib eine gültige E-Mail-Adresse ein.');
      }
    } else {
      showWarning(refs.emailWarning, '');
    }

    if (!phone || !isValidPhone(phone)) {
      valid = false;
      if (showErrors) {
        showWarning(refs.phoneWarning, 'Bitte gib eine gültige Telefonnummer an.');
      }
    } else {
      showWarning(refs.phoneWarning, '');
    }

    return valid;
  }

  function updateProgress() {
    const pct = ((currentStep + 1) / totalSteps) * 100;
    if (progressNode) {
      progressNode.style.width = `${pct}%`;
    }

    if (stepLabelNode) {
      stepLabelNode.textContent = String(currentStep + 1);
    }

    tabNodes.forEach((tab, index) => {
      tab.classList.toggle('active', index === currentStep);
    });
  }

  function renderStep() {
    stepNodes.forEach((node, index) => {
      node.classList.toggle('active', index === currentStep);
    });

    if (backBtn) {
      backBtn.disabled = currentStep === 0;
    }

    if (nextBtn) {
      nextBtn.style.display = currentStep === totalSteps - 1 ? 'none' : 'inline-flex';
    }

    if (submitBtn) {
      submitBtn.style.display = currentStep === totalSteps - 1 ? 'inline-flex' : 'none';
      if (currentStep === totalSteps - 1) {
        submitBtn.disabled = !validateContact(false);
      }
    }

    updateProgress();
  }

  function collectPayload() {
    const shouldIncludeFeatures = state.featureNeed === 'Ja';
    const payload = {
      projectType: state.projectType || null,
      primaryGoal: state.primaryGoal || null,
      features: shouldIncludeFeatures ? state.features : [],
      featureNotes: shouldIncludeFeatures ? sanitizeText(refs.featureNotes.value, 1000) : '',
      budgetRange: state.budgetRange || null,
      timeline: state.timeline || null,
      contactName: sanitizeText(refs.contactName.value, 100) || null,
      contactEmail: sanitizeText(refs.contactEmail.value, 120),
      contactPhone: sanitizeText(refs.contactPhone.value, 40),
      preferredContact: state.preferredContact || null,
      website: sanitizeText(refs.website.value, 80)
    };

    return payload;
  }

  async function submitForm(payload) {
    const endpoint = form.dataset.endpoint;
    if (!endpoint) return;

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      throw new Error('Netzwerkfehler beim Absenden. (Hinweis: HTML-only funktioniert ohne Server nur lokal.)');
    }

    if (!response.ok) {
      let message = 'Absenden fehlgeschlagen. Bitte versuche es erneut.';
      try {
        const body = await response.json();
        if (body && body.message) message = body.message;
      } catch (error) {
        // keep fallback
      }
      throw new Error(message);
    }
  }

  function appendLocalRequest(payload) {
    try {
      const key = 'ae_requests';
      const raw = localStorage.getItem(key);
      let items = [];
      try {
        items = JSON.parse(raw || '[]');
        if (!Array.isArray(items)) items = [];
      } catch (e) {
        items = [];
      }

      items.unshift({
        created_at: new Date().toISOString(),
        ...payload
      });

      if (items.length > 500) items = items.slice(0, 500);
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }

  form.addEventListener('click', (event) => {
    const slotBtn = event.target.closest('[data-slot-group][data-slot-value]');
    if (slotBtn) {
      const group = slotBtn.dataset.slotGroup;
      const value = slotBtn.dataset.slotValue;

      state[group] = state[group] === value ? '' : value;
      renderSlotSelection();
      if (group === 'featureNeed') {
        renderFeatureDetail();
      }
      saveState();
      setGlobalWarning('');
      return;
    }

    const removeBtn = event.target.closest('[data-remove-feature]');
    if (removeBtn) {
      removeFeature(removeBtn.dataset.removeFeature);
      return;
    }

    const suggestionBtn = event.target.closest('[data-feature-suggestion]');
    if (suggestionBtn) {
      const suggestionValue = sanitizeText(suggestionBtn.dataset.featureSuggestion, 60);
      if (state.features.includes(suggestionValue)) {
        removeFeature(suggestionValue);
      } else {
        addFeature(suggestionValue);
      }
      return;
    }
  });

  refs.featureAddBtn.addEventListener('click', () => {
    addFeature(refs.featureInput.value);
    refs.featureInput.value = '';
    refs.featureInput.focus();
  });

  refs.featureInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addFeature(refs.featureInput.value);
      refs.featureInput.value = '';
    }
  });

  refs.featureNotes.addEventListener('input', () => {
    state.featureNotes = sanitizeText(refs.featureNotes.value, 1000);
    saveState();
  });

  refs.contactName.addEventListener('input', () => {
    state.contactName = sanitizeText(refs.contactName.value, 100);
    saveState();
  });

  refs.contactEmail.addEventListener('input', () => {
    state.contactEmail = sanitizeText(refs.contactEmail.value, 120);
    saveState();
    validateContact(true);
    if (submitBtn && submitBtn.style.display !== 'none') {
      submitBtn.disabled = !validateContact(false);
    }
  });

  refs.contactPhone.addEventListener('input', () => {
    state.contactPhone = sanitizeText(refs.contactPhone.value, 40);
    saveState();
    validateContact(true);
    if (submitBtn && submitBtn.style.display !== 'none') {
      submitBtn.disabled = !validateContact(false);
    }
  });

  refs.website.addEventListener('input', () => {
    state.website = sanitizeText(refs.website.value, 80);
    saveState();
  });

  backBtn.addEventListener('click', () => {
    setGlobalWarning('');
    if (currentStep > 0) {
      currentStep -= 1;
      renderStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    setGlobalWarning('');
    if (currentStep < totalSteps - 1) {
      currentStep += 1;
      renderStep();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setGlobalWarning('');

    if (!validateContact(true)) {
      setGlobalWarning('Bitte prüfe E-Mail und Telefonnummer.');
      submitBtn.disabled = false;
      return;
    }

    const payload = collectPayload();

    if (payload.website) {
      setGlobalWarning('Anfrage konnte nicht verarbeitet werden.');
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sende...';

    try {
      // Always store locally for the HTML-only admin dashboard.
      appendLocalRequest(payload);

      // Optional server submit if an endpoint is configured.
      await submitForm(payload);
      localStorage.removeItem(storageKey);
      window.location.href = 'danke.html';
    } catch (error) {
      setGlobalWarning(error.message || 'Absenden fehlgeschlagen.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  restoreState();
  renderSlotSelection();
  renderFeatureDetail();
  renderFeatureTags();
  renderFeatureSuggestions();
  saveState();
  renderStep();
})();
