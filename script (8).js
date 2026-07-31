/* ==========================================================================
   MAWE LIMITED — Shared behaviour
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.classList.remove('is-open');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Metric counters ---------- */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count-to'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = null;

        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = target * eased;
          el.textContent = (target % 1 === 0 ? Math.round(value) : value.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- Material Calculator (Products page) ---------- */
  var calcForm = document.getElementById('material-calculator');
  if (calcForm) {
    var calcResult = document.getElementById('calc-result-value');
    var calcNote = document.getElementById('calc-result-note');

    function computeVolume() {
      var length = parseFloat(document.getElementById('calc-length').value) || 0;
      var width = parseFloat(document.getElementById('calc-width').value) || 0;
      var depth = parseFloat(document.getElementById('calc-depth').value) || 0; // in mm
      var material = document.getElementById('calc-material').value;
      var wastage = 1.05; // 5% allowance for compaction / spillage

      var volumeM3 = length * width * (depth / 1000) * wastage;

      var densities = {
        sand: 1.6,      // tonnes per m3, washed river sand
        ballast: 1.5,   // crushed aggregate
        cement: 1.44    // OPC/PPC bulk
      };

      var tonnage = volumeM3 * (densities[material] || 1.5);

      if (!length || !width || !depth) {
        calcResult.textContent = '0.00';
        calcNote.textContent = 'Enter your site dimensions to estimate volume.';
        return;
      }

      calcResult.textContent = volumeM3.toFixed(2);
      var bagNote = '';
      if (material === 'cement') {
        var bags = Math.ceil((tonnage * 1000) / 50); // 50kg bags
        bagNote = ' — approximately ' + bags + ' standard 50kg bags';
      }
      calcNote.textContent = 'Estimated at ' + tonnage.toFixed(2) + ' tonnes' + bagNote + '. Includes a 5% site wastage allowance.';
    }

    calcForm.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('input', computeVolume);
      el.addEventListener('change', computeVolume);
    });
    computeVolume();
  }

  /* ---------- RFQ multi-step form (Contact page) ---------- */
  var rfq = document.getElementById('rfq-form');
  if (rfq) {
    var steps = Array.prototype.slice.call(rfq.querySelectorAll('.rfq-step'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.rfq-steps .dot'));
    var current = 0;

    function renderStep() {
      steps.forEach(function (step, idx) {
        step.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
        dot.classList.toggle('done', idx < current);
      });
    }

    rfq.querySelectorAll('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var required = steps[current].querySelectorAll('[required]');
        var valid = true;
        required.forEach(function (field) {
          if (!field.value) { valid = false; field.reportValidity && field.reportValidity(); }
        });
        if (!valid) return;
        if (current < steps.length - 1) {
          current += 1;
          renderStep();
        }
      });
    });

    rfq.querySelectorAll('[data-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (current > 0) {
          current -= 1;
          renderStep();
        }
      });
    });

    rfq.addEventListener('submit', function (e) {
      e.preventDefault();
      rfq.style.display = 'none';
      document.querySelectorAll('.rfq-steps')[0].style.display = 'none';
      var success = document.getElementById('rfq-success');
      if (success) success.classList.add('is-active');
    });

    rfq.querySelectorAll('.option-chip input').forEach(function (input) {
      function sync() {
        input.closest('.option-chip').classList.toggle('is-checked', input.checked);
      }
      input.addEventListener('change', function () {
        if (input.type === 'radio') {
          document.querySelectorAll('input[name="' + input.name + '"]').forEach(function (i) {
            i.closest('.option-chip').classList.remove('is-checked');
          });
        }
        sync();
      });
      sync();
    });

    renderStep();
  }

  /* ---------- Home page quick-quote preview form ---------- */
  var quickForm = document.getElementById('quick-rfq-form');
  if (quickForm) {
    quickForm.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'contact.html#rfq-form-start';
    });
  }

  /* ---------- Custom cursor dot (homepage, desktop) ---------- */
  var cursorDot = document.getElementById('cursorDot');
  if (cursorDot && window.matchMedia('(hover: hover)').matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
    });
    (function raf() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursorDot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(raf);
    })();
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorDot.textContent = el.getAttribute('data-cursor') || 'VIEW';
        cursorDot.classList.add('is-active');
      });
      el.addEventListener('mouseleave', function () {
        cursorDot.classList.remove('is-active');
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.magnetic-wrap').forEach(function (wrap) {
    var inner = wrap.querySelector('.btn-magnetic') || wrap;
    wrap.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      var mx = e.clientX - rect.left - rect.width / 2;
      var my = e.clientY - rect.top - rect.height / 2;
      inner.style.transform = 'translate(' + (mx * 0.25) + 'px,' + (my * 0.35) + 'px)';
    });
    wrap.addEventListener('mouseleave', function () {
      inner.style.transform = 'translate(0,0)';
    });
  });

  /* ---------- Horizontal drag gallery ---------- */
  var hGallery = document.getElementById('productGallery');
  if (hGallery) {
    var isDown = false, startX, scrollLeft;
    hGallery.addEventListener('mousedown', function (e) {
      isDown = true;
      hGallery.classList.add('is-dragging');
      startX = e.pageX - hGallery.offsetLeft;
      scrollLeft = hGallery.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(function (evt) {
      hGallery.addEventListener(evt, function () {
        isDown = false;
        hGallery.classList.remove('is-dragging');
      });
    });
    hGallery.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - hGallery.offsetLeft;
      hGallery.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });

    var galleryPrev = document.querySelector('.gallery-prev');
    var galleryNext = document.querySelector('.gallery-next');
    var scrollAmount = function () {
      var card = hGallery.querySelector('.h-card');
      return card ? card.getBoundingClientRect().width + 24 : 320;
    };
    if (galleryPrev) galleryPrev.addEventListener('click', function () {
      hGallery.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    if (galleryNext) galleryNext.addEventListener('click', function () {
      hGallery.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }

  /* ---------- Product slider (Home page) ---------- */
  var slider = document.querySelector('.product-slider');
  if (slider) {
    var track = slider.querySelector('.slider-track');
    var slidesCount = slider.querySelectorAll('.slide').length;
    var index = 0;
    var prevBtn = slider.querySelector('.slider-prev');
    var nextBtn = slider.querySelector('.slider-next');
    var dotsWrap = slider.querySelector('.slider-dots');

    for (var i = 0; i < slidesCount; i++) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      if (i === 0) d.classList.add('is-active');
      (function (idx) {
        d.addEventListener('click', function () { goTo(idx); });
      })(i);
      dotsWrap.appendChild(d);
    }

    function goTo(i) {
      index = (i + slidesCount) % slidesCount;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dotsWrap.querySelectorAll('button').forEach(function (b, idx) {
        b.classList.toggle('is-active', idx === index);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    var auto = setInterval(function () { goTo(index + 1); }, 5500);
    slider.addEventListener('mouseenter', function () { clearInterval(auto); });
  }

});
