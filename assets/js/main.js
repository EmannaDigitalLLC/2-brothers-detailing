(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof gsap !== "undefined";

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  }

  var heroVideo = document.querySelector(".hero-bg video");
  if (heroVideo && reduceMotion) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
  }

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Header scroll state ---------------- */
  var header = document.getElementById("site-header");
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  document.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ---------------- Service card cursor-follow glow ---------------- */
  if (!reduceMotion) {
    document.querySelectorAll(".service-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--glow-x", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--glow-y", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ---------------- Video play/pause toggles ---------------- */
  document.querySelectorAll(".video-card").forEach(function (card) {
    var video = card.querySelector("video");
    var btn = card.querySelector(".video-toggle");
    var use = btn ? btn.querySelector("use") : null;
    if (!video || !btn) return;

    function setPlaying(playing) {
      btn.classList.toggle("is-playing", playing);
      btn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
      if (use) use.setAttribute("href", playing ? "#icon-pause" : "#icon-play");
    }
    btn.addEventListener("click", function () {
      if (video.paused) {
        video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
    });
    video.addEventListener("ended", function () { setPlaying(false); });
  });

  /* ---------------- Quote quiz (multi-step form) ---------------- */
  (function () {
    var form = document.getElementById("quiz-form");
    if (!form) return;

    var progressBar = document.getElementById("quiz-progress-bar");
    var steps = Array.prototype.slice.call(form.querySelectorAll(".quiz-step"));
    var totalSteps = 4;
    var current = 1;
    var answers = { name: "", phone: "", service: "", vehicle: "", timing: "" };

    var nameInput = document.getElementById("q-name");
    var phoneInput = document.getElementById("q-phone");
    var timingInput = document.getElementById("q-timing");

    function stepEl(key) {
      return form.querySelector('.quiz-step[data-step="' + key + '"]');
    }

    function showError(stepNum, show) {
      var err = form.querySelector('.quiz-error[data-error-for="' + stepNum + '"]');
      if (err) err.hidden = !show;
    }

    function goTo(key) {
      var next = stepEl(key);
      if (!next) return;
      var activeEl = form.querySelector(".quiz-step.is-active");

      function activate() {
        steps.forEach(function (s) { s.classList.remove("is-active"); });
        next.classList.add("is-active");
        if (progressBar) {
          var pct = key === "done" ? 100 : (key / totalSteps) * 100;
          progressBar.style.width = pct + "%";
        }
        var firstField = next.querySelector("input, .quiz-option");
        if (firstField) firstField.focus({ preventScroll: true });
      }

      if (hasGSAP && activeEl && activeEl !== next) {
        gsap.to(activeEl, {
          opacity: 0, y: -8, duration: 0.18, ease: "power1.in",
          onComplete: function () {
            activate();
            gsap.fromTo(next, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
          },
        });
      } else {
        activate();
      }
      if (typeof key === "number") current = key;
    }

    function validateStep1() {
      var nameOk = nameInput.value.trim().length > 1;
      var phoneOk = phoneInput.value.replace(/[^0-9]/g, "").length >= 10;
      nameInput.classList.toggle("is-invalid", !nameOk);
      phoneInput.classList.toggle("is-invalid", !phoneOk);
      var ok = nameOk && phoneOk;
      showError(1, !ok);
      if (ok) {
        answers.name = nameInput.value.trim();
        answers.phone = phoneInput.value.trim();
      }
      return ok;
    }

    function validateChoice(stepNum, field) {
      var ok = !!answers[field];
      showError(stepNum, !ok);
      return ok;
    }

    function validateStep4() {
      var ok = timingInput.value.trim().length > 1;
      timingInput.classList.toggle("is-invalid", !ok);
      showError(4, !ok);
      if (ok) answers.timing = timingInput.value.trim();
      return ok;
    }

    form.querySelectorAll(".quiz-options").forEach(function (group) {
      var field = group.getAttribute("data-field");
      group.querySelectorAll(".quiz-option").forEach(function (opt) {
        opt.addEventListener("click", function () {
          group.querySelectorAll(".quiz-option").forEach(function (o) { o.classList.remove("is-selected"); });
          opt.classList.add("is-selected");
          answers[field] = opt.textContent.trim();
          var stepNum = Number(opt.closest(".quiz-step").getAttribute("data-step"));
          showError(stepNum, false);
        });
      });
    });

    [nameInput, phoneInput, timingInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener("input", function () { input.classList.remove("is-invalid"); });
    });

    form.querySelectorAll(".quiz-next").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stepNum = Number(btn.closest(".quiz-step").getAttribute("data-step"));
        var ok = false;
        if (stepNum === 1) ok = validateStep1();
        else if (stepNum === 2) ok = validateChoice(2, "service");
        else if (stepNum === 3) ok = validateChoice(3, "vehicle");
        if (ok) goTo(stepNum + 1);
      });
    });

    form.querySelectorAll(".quiz-back").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stepNum = Number(btn.closest(".quiz-step").getAttribute("data-step"));
        goTo(stepNum - 1);
      });
    });

    var sendBtn = document.getElementById("quiz-send");
    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        if (!validateStep4()) return;

        var body = [
          "New quote request — 2 Brothers Detailing website",
          "Name: " + answers.name,
          "Phone: " + answers.phone,
          "Service: " + answers.service,
          "Vehicle: " + answers.vehicle,
          "Preferred time: " + answers.timing,
        ].join("\n");

        var number = "4693388237";
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        var smsUrl = (isIOS ? "sms:" + number + "&body=" : "sms:" + number + "?body=") + encodeURIComponent(body);

        window.location.href = smsUrl;
        goTo("done");
      });
    }

    var restartBtn = form.querySelector(".quiz-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        form.reset();
        answers = { name: "", phone: "", service: "", vehicle: "", timing: "" };
        form.querySelectorAll(".quiz-option.is-selected").forEach(function (o) { o.classList.remove("is-selected"); });
        form.querySelectorAll(".quiz-error").forEach(function (e) { e.hidden = true; });
        goTo(1);
      });
    }
  })();

  /* ---------------- Fallback: no GSAP ---------------- */
  if (!hasGSAP) {
    document.querySelectorAll(".reveal-up, .reveal-card").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  /* ---------------- Reduced motion: reveal instantly, skip fancy motion ---------------- */
  if (reduceMotion) {
    document.querySelectorAll(".reveal-up, .reveal-card").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.documentElement.style.scrollBehavior = "auto";
    return;
  }

  window.addEventListener("load", function () {
    /* ---------------- Smooth scroll ---------------- */
    var smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: true,
      smoothTouch: 0.1,
    });

    /* ---------------- Hero entrance (wait for webfont metrics) ---------------- */
    document.fonts.ready.then(function () {
      var splitEls = gsap.utils.toArray(".hero-title .split");
      var splits = splitEls.map(function (el) {
        return new SplitText(el, { type: "words", wordsClass: "word" });
      });

      gsap.set([".hero .eyebrow", ".hero-sub", ".hero-actions", ".hero-bottom-right"], { opacity: 0, y: 16 });

      var tl = gsap.timeline({ delay: 0.2 });
      tl.to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      splits.forEach(function (split, i) {
        tl.from(split.words, {
          yPercent: 120,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
        }, i === 0 ? "-=0.25" : "<+0.12");
      });
      tl.to(".hero-sub", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.4")
        .to(".hero-actions", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .to(".hero-bottom-right", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
    });

    /* ---------------- Hero parallax ---------------- */
    gsap.to(".hero-bg video", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });

    /* ---------------- Generic scroll reveals ---------------- */
    gsap.utils.toArray(".reveal-up").forEach(function (el) {
      if (el.closest(".hero")) return;
      gsap.set(el, { opacity: 0, y: 24 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      });
    });

    gsap.utils.toArray(".services-grid, .video-grid").forEach(function (grid) {
      var cards = grid.querySelectorAll(".reveal-card");
      gsap.set(cards, { opacity: 0, y: 28 });
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.08,
        scrollTrigger: { trigger: grid, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".pricing-card.reveal-card, .quiz-card.reveal-card").forEach(function (el) {
      gsap.set(el, { opacity: 0, y: 30 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    gsap.utils.toArray(".area-visual.reveal-card").forEach(function (el) {
      gsap.set(el, { opacity: 0, scale: 0.85 });
      gsap.to(el, {
        opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    /* ---------------- Marquee infinite loop ---------------- */
    var marqueeTrack = document.querySelector(".marquee-track");
    if (marqueeTrack) {
      var loopTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        ease: "none",
        duration: 22,
        repeat: -1,
      });
      marqueeTrack.parentElement.addEventListener("mouseenter", function () { loopTween.timeScale(0.25); });
      marqueeTrack.parentElement.addEventListener("mouseleave", function () { loopTween.timeScale(1); });
    }

    /* ---------------- Horizontal pinned process ---------------- */
    var track = document.querySelector(".process-track");
    var pin = document.querySelector(".process-pin");
    if (track && pin) {
      var setDistance = function () {
        return track.scrollWidth - pin.clientWidth;
      };
      var scrollTween = gsap.to(track, {
        x: function () { return -setDistance(); },
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top+=90",
          end: function () { return "+=" + (setDistance() + window.innerHeight * 0.4); },
          scrub: 0.7,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray(".process-panel").forEach(function (panel) {
        var media = panel.querySelector(".process-media");
        gsap.fromTo(media, { opacity: 0.4, scale: 0.94 }, {
          opacity: 1, scale: 1, ease: "none",
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: "left 85%",
            end: "left 40%",
            scrub: true,
          },
        });
      });
    }

    ScrollTrigger.addEventListener("refreshInit", function () {
      if (smoother) smoother.refresh();
    });

    setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  });
})();
