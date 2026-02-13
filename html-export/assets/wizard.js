(function () {
  const form = document.querySelector('[data-wizard-form]');
  if (!form) return;

  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const stepTabs = Array.from(document.querySelectorAll('[data-step-tab]'));
  const stepCurrent = document.querySelector('[data-step-current]');
  const progressFill = document.querySelector('[data-progress-fill]');
  const backBtn = document.querySelector('[data-action="back"]');
  const nextBtn = document.querySelector('[data-action="next"]');
  const submitBtn = document.querySelector('[data-action="submit"]');
  const notice = document.querySelector('[data-notice]');

  const storageKey = 'arman_project_wizard_v2';
  let currentStep = 0;

  const fieldRefs = {
    projectType: form.elements.projectType,
    industry: form.elements.industry,
    hasExistingWebsite: form.elements.hasExistingWebsite,
    existingWebsiteUrl: form.elements.existingWebsiteUrl,
    primaryGoal: form.elements.primaryGoal,
    targetAudience: form.elements.targetAudience,
    featureInputs: Array.from(form.querySelectorAll('input[name="features"]')),
    description: form.elements.description,
    budget: form.elements.budget,
    timeline: form.elements.timeline,
    contactName: form.elements.contactName,
    contactEmail: form.elements.contactEmail,
    contactPhone: form.elements.contactPhone,
    preferredContact: form.elements.preferredContact,
    consent: form.elements.consent,
    website: form.elements.website
  };

  const errors = {
    industry: document.querySelector('[data-error="industry"]'),
    existingWebsiteUrl: document.querySelector('[data-error="existingWebsiteUrl"]'),
    targetAudience: document.querySelector('[data-error="targetAudience"]'),
    features: document.querySelector('[data-error="features"]'),
    contactName: document.querySelector('[data-error="contactName"]'),
    contactEmail: document.querySelector('[data-error="contactEmail"]'),
    consent: document.querySelector('[data-error="consent"]')
  };

  function getRadioValue(name) {
    const checked = form.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function sanitizeText(value, maxLength) {
    return String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, maxLength);
  }

  function setFieldError(key, message) {
    const target = errors[key];
    if (!target) return;
    target.textContent = message || '';
  }

  function clearErrors() {
    Object.keys(errors).forEach((key) => setFieldError(key, ''));
  }

  function clearNotice() {
    if (!notice) return;
    notice.className = 'notice';
    notice.textContent = '';
  }

  function showNotice(type, messageText) {
    if (!notice) return;
    notice.className = `notice ${type}`;
    notice.textContent = messageText;
  }

  function getPayload() {
    const features = fieldRefs.featureInputs
      .filter((input) => input.checked)
      .map((input) => input.value);

    return {
      projectType: sanitizeText(fieldRefs.projectType.value, 60),
      industry: sanitizeText(fieldRefs.industry.value, 120),
      hasExistingWebsite: getRadioValue('hasExistingWebsite'),
      existingWebsiteUrl: sanitizeText(fieldRefs.existingWebsiteUrl.value, 240),
      primaryGoal: sanitizeText(fieldRefs.primaryGoal.value, 80),
      targetAudience: sanitizeText(fieldRefs.targetAudience.value, 200),
      features,
      description: sanitizeText(fieldRefs.description.value, 1000),
      budget: sanitizeText(fieldRefs.budget.value, 40),
      timeline: sanitizeText(fieldRefs.timeline.value, 40),
      contactName: sanitizeText(fieldRefs.contactName.value, 90),
      contactEmail: sanitizeText(fieldRefs.contactEmail.value, 120),
      contactPhone: sanitizeText(fieldRefs.contactPhone.value, 40),
      preferredContact: sanitizeText(fieldRefs.preferredContact.value, 40),
      consent: Boolean(fieldRefs.consent.checked),
      website: sanitizeText(fieldRefs.website.value, 80)
    };
  }

  function validateStep(stepIndex, showErrors) {
    if (showErrors) {
      clearErrors();
    }
    const data = getPayload();
    let valid = true;

    if (stepIndex === 0) {
      if (!data.industry || data.industry.length < 2) {
        if (showErrors) setFieldError('industry', 'Bitte gib deine Branche an.');
        valid = false;
      }

      if (!data.hasExistingWebsite) {
        valid = false;
      }

      if (data.hasExistingWebsite === 'yes') {
        if (!data.existingWebsiteUrl) {
          if (showErrors) setFieldError('existingWebsiteUrl', 'Bitte gib die URL deiner bestehenden Website an.');
          valid = false;
        } else {
          try {
            new URL(data.existingWebsiteUrl);
          } catch (error) {
            if (showErrors) setFieldError('existingWebsiteUrl', 'Bitte gib eine gültige URL an (inkl. https://).');
            valid = false;
          }
        }
      }
    }

    if (stepIndex === 1) {
      if (!data.targetAudience || data.targetAudience.length < 3) {
        if (showErrors) setFieldError('targetAudience', 'Bitte beschreibe kurz deine Zielgruppe.');
        valid = false;
      }

      if (!data.features.length) {
        if (showErrors) setFieldError('features', 'Wähle mindestens ein Feature aus.');
        valid = false;
      }
    }

    if (stepIndex === 2) {
      if (!data.budget || !data.timeline) {
        valid = false;
      }
    }

    if (stepIndex === 3) {
      if (!data.contactName || data.contactName.length < 2) {
        if (showErrors) setFieldError('contactName', 'Bitte gib deinen Namen an.');
        valid = false;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail);
      if (!emailOk) {
        if (showErrors) setFieldError('contactEmail', 'Bitte gib eine gültige E-Mail-Adresse an.');
        valid = false;
      }

      if (!data.consent) {
        if (showErrors) setFieldError('consent', 'Bitte bestätige die Kontakt-Einwilligung.');
        valid = false;
      }
    }

    return valid;
  }

  function updateUI() {
    steps.forEach((step, index) => {
      step.classList.toggle('active', index === currentStep);
    });

    stepTabs.forEach((tab, index) => {
      tab.classList.toggle('active', index === currentStep);
    });

    if (stepCurrent) {
      stepCurrent.textContent = String(currentStep + 1);
    }

    if (progressFill) {
      progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    }

    if (backBtn) {
      backBtn.disabled = currentStep === 0;
    }

    const stepValid = validateStep(currentStep, false);
    if (nextBtn) {
      nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
      nextBtn.disabled = !stepValid;
    }

    if (submitBtn) {
      submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-flex' : 'none';
      submitBtn.disabled = !stepValid;
    }
  }

  function saveState() {
    const payload = getPayload();
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function restoreState() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.projectType) fieldRefs.projectType.value = parsed.projectType;
      if (parsed.industry) fieldRefs.industry.value = parsed.industry;
      if (parsed.existingWebsiteUrl) fieldRefs.existingWebsiteUrl.value = parsed.existingWebsiteUrl;
      if (parsed.primaryGoal) fieldRefs.primaryGoal.value = parsed.primaryGoal;
      if (parsed.targetAudience) fieldRefs.targetAudience.value = parsed.targetAudience;
      if (parsed.description) fieldRefs.description.value = parsed.description;
      if (parsed.budget) fieldRefs.budget.value = parsed.budget;
      if (parsed.timeline) fieldRefs.timeline.value = parsed.timeline;
      if (parsed.contactName) fieldRefs.contactName.value = parsed.contactName;
      if (parsed.contactEmail) fieldRefs.contactEmail.value = parsed.contactEmail;
      if (parsed.contactPhone) fieldRefs.contactPhone.value = parsed.contactPhone;
      if (parsed.preferredContact) fieldRefs.preferredContact.value = parsed.preferredContact;
      if (typeof parsed.consent === 'boolean') fieldRefs.consent.checked = parsed.consent;

      if (parsed.hasExistingWebsite) {
        const websiteRadios = form.querySelectorAll('input[name="hasExistingWebsite"]');
        websiteRadios.forEach((radio) => {
          radio.checked = radio.value === parsed.hasExistingWebsite;
        });
      }

      fieldRefs.featureInputs.forEach((input) => {
        input.checked = Array.isArray(parsed.features) ? parsed.features.includes(input.value) : false;
      });
    } catch (error) {
      console.warn('Konnte gespeicherten Wizard-State nicht laden.', error);
    }
  }

  async function submitData(payload) {
    const endpoint = form.dataset.endpoint;

    if (!endpoint) {
      return { ok: true };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let message = 'Absenden fehlgeschlagen. Bitte versuche es erneut.';
      try {
        const body = await response.json();
        if (body && body.message) {
          message = body.message;
        }
      } catch (error) {
        // keep fallback message
      }
      throw new Error(message);
    }

    return { ok: true };
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      clearNotice();
      if (currentStep > 0) {
        currentStep -= 1;
        updateUI();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      clearNotice();
      if (validateStep(currentStep, true) && currentStep < steps.length - 1) {
        currentStep += 1;
        updateUI();
      }
    });
  }

  form.addEventListener('input', function () {
    clearNotice();
    clearErrors();
    saveState();
    updateUI();
  });

  form.addEventListener('change', function () {
    clearNotice();
    clearErrors();
    saveState();
    updateUI();
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearNotice();

    if (!validateStep(currentStep, true)) {
      updateUI();
      return;
    }

    const payload = getPayload();

    if (payload.website) {
      showNotice('error', 'Anfrage konnte nicht verarbeitet werden.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sende...';
    }

    try {
      await submitData(payload);
      localStorage.removeItem(storageKey);
      showNotice('success', 'Danke! Ich melde mich innerhalb von 24 Stunden.');
      setTimeout(function () {
        window.location.href = 'danke.html';
      }, 900);
    } catch (error) {
      showNotice('error', error.message || 'Absenden fehlgeschlagen.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Projekt anfragen';
      }
    }
  });

  restoreState();
  updateUI();
})();
