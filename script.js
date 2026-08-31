/* ==========================================================================
   ROMANTIC BIRTHDAY CARD — SCRIPT
   Handles: handwritten text reveal, pencil-drawn sketch reveal,
   page transitions, floating petals, and message paragraph reveals.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     CONFIG — feel free to tweak timings / toggle features here
  --------------------------------------------------------------- */
  const CONFIG = {
    // set to false if you don't want the sketch to gently cross-fade
    // into the real photo (assets/girl.jpg) once fully "drawn"
    revealPhotoAfterSketch: false,

    // how long the pencil-sketch reveal takes, in milliseconds
    sketchDrawDuration: 7800,

    // letter-writing speed (ms between each letter starting to animate)
    letterStagger: {
      happy: 95,
      birthday: 60
    },

    reducedMotion: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  };


  /* ---------------------------------------------------------------
     SMALL HELPERS
  --------------------------------------------------------------- */
  const $ = (sel, ctx) =>
    (ctx || document).querySelector(sel);

  const $$ = (sel, ctx) =>
    Array.from((ctx || document).querySelectorAll(sel));

  const wait = (ms) =>
    new Promise((res) => setTimeout(res, ms));


  /**
   * Splits a string into individual <span class="letter"> elements
   * inside `el`, each with its own staggered animation-delay so the
   * word appears to be handwritten one letter at a time.
   */
  function writeText(el, text, staggerMs) {
    if (!el) return 0;

    el.innerHTML = "";

    const chars = Array.from(text);

    chars.forEach((ch, i) => {
      const span = document.createElement("span");

      span.className =
        "letter" + (ch === " " ? " space" : "");

      span.textContent =
        ch === " " ? "\u00A0" : ch;

      span.style.animationDelay =
        (i * staggerMs) + "ms";

      el.appendChild(span);
    });

    const total =
      chars.length * staggerMs + 650;

    return total;
  }


  /* ---------------------------------------------------------------
     PAGE 1 — INTRO SEQUENCE
  --------------------------------------------------------------- */
  async function runIntroSequence() {

    const eyebrow = $("#eyebrow");
    const titleHappy = $("#titleHappy");
    const titleBirthday = $("#titleBirthday");
    const underline = $("#underline");
    const subtitle = $("#subtitle");
    const portrait = $("#portrait");
    const btn = $("#toPage2Btn");


    if (CONFIG.reducedMotion) {

      eyebrow.classList.add("is-visible");

      titleHappy.textContent =
        titleHappy.dataset.text;

      titleBirthday.textContent =
        titleBirthday.dataset.text;

      underline.classList.add("is-drawn");

      subtitle.classList.add("is-visible");

      portrait.classList.add("is-visible");

      revealSketchInstant();

      btn.classList.add("is-visible");

      return;
    }


    // 1. eyebrow fades in
    await wait(300);

    eyebrow.classList.add("is-visible");

    await wait(900);


    // 2. "Happy" is handwritten
    const happyDuration =
      writeText(
        titleHappy,
        titleHappy.dataset.text,
        CONFIG.letterStagger.happy
      );

    await wait(happyDuration + 250);


    // 3. small pause
    await wait(350);


    // 4. "BIRTHDAY" is handwritten
    const birthdayDuration =
      writeText(
        titleBirthday,
        titleBirthday.dataset.text,
        CONFIG.letterStagger.birthday
      );

    await wait(birthdayDuration + 200);


    // 5. underline draws itself
    underline.classList.add("is-drawn");

    await wait(700);


    // 6. subtitle appears
    subtitle.classList.add("is-visible");

    await wait(600);


    // 7. portrait container fades in,
    //    then the pencil reveal begins
    portrait.classList.add("is-visible");

    await wait(500);

    await runPencilReveal();


    // 8. finally reveal the CTA button
    await wait(300);

    btn.classList.add("is-visible");
  }


  /* ---------------------------------------------------------------
     PENCIL-DRAWN SKETCH REVEAL
  --------------------------------------------------------------- */
  function revealSketchInstant() {

    const img = $("#sketchImg");

    if (!img) return;

    img.style.removeProperty(
      "-webkit-mask-image"
    );

    img.style.removeProperty(
      "mask-image"
    );


    if (CONFIG.revealPhotoAfterSketch) {

      const photo = $("#photoImg");

      if (photo) {
        photo.classList.add("is-revealed");
      }
    }
  }


  function runPencilReveal() {

    return new Promise((resolve) => {

      const img = $("#sketchImg");


      if (!img) {
        resolve();
        return;
      }


      /*
       * ORIGINAL SKETCH KO USI SIZE MEIN RAKHO
       * JIS SIZE MEIN CSS NE RAKHA HAI.
       */
      img.style.opacity = "1";

      img.style.visibility = "visible";


      /*
       * Pehle sketch ko hide karne ke liye clip-path use karenge.
       * Image ka width/height change nahi hoga.
       */

      const oldClipPath =
        img.style.clipPath;

      const oldWebkitClipPath =
        img.style.webkitClipPath;


      img.style.clipPath =
        "inset(100% 0 0 0)";

      img.style.webkitClipPath =
        "inset(100% 0 0 0)";


      const duration =
        CONFIG.sketchDrawDuration;


      const startTime =
        performance.now();


      function animate(now) {

        const elapsed =
          now - startTime;


        const progress =
          Math.min(
            1,
            elapsed / duration
          );


        /*
         * Smooth drawing speed.
         */
        const eased =
          1 -
          Math.pow(
            1 - progress,
            2.2
          );


        /*
         * ONLY THE MASK MOVES.
         *
         * Image itself:
         * width  = SAME
         * height = SAME
         * position = SAME
         */

        const hiddenPercent =
          (1 - eased) * 100;


        const clip =
          `inset(${hiddenPercent}% 0 0 0)`;


        img.style.clipPath =
          clip;

        img.style.webkitClipPath =
          clip;


        if (progress < 1) {

          requestAnimationFrame(
            animate
          );

        } else {

          /*
           * FINAL STATE
           */

          img.style.clipPath =
            oldClipPath || "none";

          img.style.webkitClipPath =
            oldWebkitClipPath || "none";


          /*
           * Restore original state.
           */

          setTimeout(
            () => {

              if (
                CONFIG.revealPhotoAfterSketch
              ) {

                const photo =
                  $("#photoImg");

                if (photo) {

                  photo.classList.add(
                    "is-revealed"
                  );
                }
              }

              resolve();

            },
            100
          );
        }
      }


      requestAnimationFrame(
        animate
      );

    });
  }


  function rand(min, max) {
    return Math.random() *
      (max - min) + min;
  }


  function clamp(v, min, max) {
    return Math.max(
      min,
      Math.min(max, v)
    );
  }


  function easeOutCubic(t) {
    return 1 -
      Math.pow(1 - t, 3);
  }


  /* ---------------------------------------------------------------
     PAGE TRANSITIONS
  --------------------------------------------------------------- */
  function goToPage(
    fromEl,
    toEl,
    onArrive
  ) {

    if (!fromEl || !toEl) return;


    fromEl.classList.add(
      "is-leaving"
    );

    fromEl.classList.remove(
      "is-active"
    );


    setTimeout(() => {

      fromEl.classList.remove(
        "is-leaving"
      );

      toEl.classList.add(
        "is-active"
      );


      window.scrollTo({
        top: 0,
        behavior:
          CONFIG.reducedMotion
            ? "auto"
            : "smooth"
      });


      if (
        typeof onArrive ===
        "function"
      ) {
        onArrive();
      }

    },
    CONFIG.reducedMotion
      ? 0
      : 500
    );
  }


  /* ---------------------------------------------------------------
     MESSAGE PARAGRAPH REVEAL
     PAGE 2 & PAGE 3
  --------------------------------------------------------------- */
  function revealParagraphs(
    containerSel,
    extraDelay,
    stagger
  ) {

    const paras =
      $$(
        containerSel + " p"
      );


    const step =
      stagger || 420;


    paras.forEach(
      (p, i) => {

        const delay =
          (extraDelay || 0) +
          i * step;


        setTimeout(
          () =>
            p.classList.add(
              "is-visible"
            ),
          CONFIG.reducedMotion
            ? 0
            : delay
        );
      }
    );


    return paras.length;
  }


  /* ---------------------------------------------------------------
     PAGE 2 SEQUENCE
  --------------------------------------------------------------- */
  let page2Played = false;


  function runPage2Sequence() {

    if (page2Played) return;

    page2Played = true;


    const heading =
      $("#page2 .heading-small");

    const btn =
      $("#toPage3Btn");


    if (heading) {

      setTimeout(
        () =>
          heading.classList.add(
            "is-visible"
          ),
        CONFIG.reducedMotion
          ? 0
          : 200
      );
    }


    const paraCount =
      revealParagraphs(
        "#messageBlock",
        CONFIG.reducedMotion
          ? 0
          : 600,
        260
      );


    const btnDelay =
      (CONFIG.reducedMotion
        ? 0
        : 600) +
      paraCount * 260 +
      500;


    if (btn) {

      setTimeout(
        () =>
          btn.classList.add(
            "is-visible"
          ),
        btnDelay
      );
    }


    spawnPetals(
      $("#petalsField2"),
      14,
      ["petal"]
    );
  }


  /* ---------------------------------------------------------------
     PAGE 3 SEQUENCE
     letter reveal, then the same handwritten
     "Happy Birthday" draw as page 1
  --------------------------------------------------------------- */
  let page3Played = false;


  function runPage3Sequence() {

    if (page3Played) return;

    page3Played = true;


    const heading =
      $("#p3Heading");

    const finalTitleHappy =
      $("#finalTitleHappy");

    const finalTitleBirthday =
      $("#finalTitleBirthday");

    const finalUnderline =
      $("#finalUnderline");

    const finalSub =
      $("#finalSub");

    const signature =
      $("#signature");

    const toPage4Btn =
      $("#toPage4Btn");


    if (heading) {

      setTimeout(
        () =>
          heading.classList.add(
            "is-visible"
          ),
        CONFIG.reducedMotion
          ? 0
          : 200
      );
    }


    const paraCount =
      revealParagraphs(
        "#finalMessage",
        CONFIG.reducedMotion
          ? 0
          : 600,
        260
      );


    let t =
      (CONFIG.reducedMotion
        ? 0
        : 600) +
      paraCount * 260 +
      700;


    if (CONFIG.reducedMotion) {

      if (finalTitleHappy) {

        finalTitleHappy.textContent =
          finalTitleHappy.dataset.text;
      }


      if (finalTitleBirthday) {

        finalTitleBirthday.textContent =
          finalTitleBirthday.dataset.text;
      }


      if (finalUnderline) {

        finalUnderline.classList.add(
          "is-drawn"
        );
      }


      if (finalSub) {

        finalSub.classList.add(
          "is-visible"
        );
      }


      if (signature) {

        signature.classList.add(
          "is-visible"
        );
      }


      if (toPage4Btn) {

        toPage4Btn.classList.add(
          "is-visible"
        );
      }


    } else {

      setTimeout(
        () => {

          if (
            !finalTitleHappy ||
            !finalTitleBirthday
          ) {
            return;
          }


          const happyDuration =
            writeText(
              finalTitleHappy,
              finalTitleHappy.dataset.text,
              CONFIG.letterStagger.happy
            );


          setTimeout(
            () => {

              const birthdayDuration =
                writeText(
                  finalTitleBirthday,
                  finalTitleBirthday.dataset.text,
                  CONFIG.letterStagger.birthday
                );


              setTimeout(
                () => {

                  if (finalUnderline) {

                    finalUnderline.classList.add(
                      "is-drawn"
                    );
                  }


                  setTimeout(
                    () => {

                      if (finalSub) {

                        finalSub.classList.add(
                          "is-visible"
                        );
                      }

                    },
                    700
                  );


                  setTimeout(
                    () => {

                      if (signature) {

                        signature.classList.add(
                          "is-visible"
                        );
                      }


                      if (toPage4Btn) {

                        toPage4Btn.classList.add(
                          "is-visible"
                        );
                      }

                    },
                    1400
                  );


                },
                birthdayDuration + 200
              );

            },
            happyDuration + 550
          );

        },
        t
      );
    }


    spawnPetals(
      $("#petalsField3"),
      16,
      [
        "petal",
        "petal is-heart"
      ]
    );


    spawnGlow(
      $("#glowParticles3"),
      18
    );
  }


  /* ---------------------------------------------------------------
     PAGE 4 SEQUENCE
     Happy Birthday
     → sketch reveal
     → final message
  --------------------------------------------------------------- */

  let page4Played = false;


  function runPage4Sequence() {

    if (page4Played) return;

    page4Played = true;


    const eyebrow =
      $("#page4Eyebrow");

    const happy =
      $("#page4Happy");

    const birthday =
      $("#page4Birthday");

    const underline =
      $("#page4Underline");

    const caption =
      $("#page4Caption");

    const sketch =
      $("#memorySketch");

    const messageParas =
      $$("#page4Message p");


    /*
     * Safety check.
     * Agar HTML mein koi Page 4 element missing ho,
     * to poori website crash nahi hogi.
     */

    if (
      !eyebrow ||
      !happy ||
      !birthday ||
      !underline ||
      !sketch
    ) {

      console.error(
        "Page 4 elements are missing from HTML."
      );

      return;
    }


    /* -----------------------------------------------------------
       REDUCED MOTION
    ----------------------------------------------------------- */

    if (CONFIG.reducedMotion) {

      eyebrow.classList.add(
        "is-visible"
      );


      happy.textContent =
        happy.dataset.text;


      birthday.textContent =
        birthday.dataset.text;


      underline.classList.add(
        "is-drawn"
      );


      if (caption) {

        caption.classList.add(
          "is-visible"
        );
      }


      sketch.classList.add(
        "is-visible",
        "is-drawn"
      );


      messageParas.forEach(
        (p) =>
          p.classList.add(
            "is-visible"
          )
      );


    }


    /* -----------------------------------------------------------
       NORMAL ANIMATION
    ----------------------------------------------------------- */

    else {

      /*
       * 1 — small heading
       */

      setTimeout(
        () =>
          eyebrow.classList.add(
            "is-visible"
          ),
        250
      );


      /*
       * 2 — Happy
       */

      const happyDuration =
        writeText(
          happy,
          happy.dataset.text,
          CONFIG.letterStagger.happy
        );


      /*
       * 3 — Birthday
       */

      setTimeout(
        () => {

          const birthdayDuration =
            writeText(
              birthday,
              birthday.dataset.text,
              CONFIG.letterStagger.birthday
            );


          /*
           * 4 — underline
           */

          setTimeout(
            () => {

              underline.classList.add(
                "is-drawn"
              );


              /*
               * 4b — caption line
               */

              if (caption) {

                setTimeout(
                  () =>
                    caption.classList.add(
                      "is-visible"
                    ),
                  350
                );
              }


              /*
               * 5 — sketch appears
               */

              setTimeout(
                () => {

                  sketch.classList.add(
                    "is-visible"
                  );


                  /*
                   * 6 — sketch draws
                   */

                  setTimeout(
                    () => {

                      sketch.classList.add(
                        "is-drawn"
                      );


                      /*
                       * 7 — message
                       *
                       * Sketch ko enough time dete hain
                       * properly draw hone ke liye.
                       */

                      const messageStart =
                        1000;


                      messageParas.forEach(
                        (p, i) => {

                          setTimeout(
                            () =>
                              p.classList.add(
                                "is-visible"
                              ),

                            messageStart +
                            i * 850
                          );
                        }
                      );

                    },
                    700
                  );

                },
                600
              );

            },
            birthdayDuration + 250
          );

        },
        happyDuration + 500
      );
    }


    /*
     * Floating hearts
     */

    spawnPetals(
      $("#petalsField4"),
      18,
      [
        "petal",
        "petal is-heart"
      ]
    );


    /*
     * Glow
     */

    spawnGlow(
      $("#glowParticles4"),
      20
    );
  }


  /* ---------------------------------------------------------------
     FLOATING PETALS / HEARTS / GLOW PARTICLES
  --------------------------------------------------------------- */

  function spawnPetals(
    container,
    count,
    variants
  ) {

    if (
      !container ||
      container.dataset.spawned
    ) {
      return;
    }


    container.dataset.spawned =
      "true";


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const el =
        document.createElement(
          "div"
        );


      const variant =
        variants[
          Math.floor(
            Math.random() *
            variants.length
          )
        ];


      el.className =
        variant;


      const isHeart =
        variant.includes(
          "is-heart"
        );


      const size =
        isHeart
          ? rand(12, 20)
          : rand(10, 20);


      if (isHeart) {

        el.textContent =
          "❤";

        el.style.fontSize =
          size + "px";

      } else {

        el.style.width =
          size + "px";

        el.style.height =
          size * 0.85 + "px";
      }


      const left =
        rand(0, 100);

      const duration =
        rand(11, 20);

      const delay =
        rand(0, 14);

      const drift =
        rand(-60, 60);


      el.style.left =
        left + "%";


      el.style.setProperty(
        "--drift",
        drift + "px"
      );


      el.style.animationDuration =
        duration + "s";


      el.style.animationDelay =
        delay + "s";


      container.appendChild(
        el
      );
    }
  }


  function spawnGlow(
    container,
    count
  ) {

    if (
      !container ||
      container.dataset.spawned
    ) {
      return;
    }


    container.dataset.spawned =
      "true";


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const el =
        document.createElement(
          "div"
        );


      el.className =
        "glow-dot";


      el.style.left =
        rand(0, 100) + "%";


      el.style.top =
        rand(0, 100) + "%";


      el.style.animationDuration =
        rand(3, 6) + "s";


      el.style.animationDelay =
        rand(0, 5) + "s";


      container.appendChild(
        el
      );
    }
  }


  /* ---------------------------------------------------------------
     WIRE UP NAVIGATION + BOOT SEQUENCE
  --------------------------------------------------------------- */

  function init() {

    const page1 =
      $("#page1");

    const page2 =
      $("#page2");

    const page3 =
      $("#page3");

    const page4 =
      $("#page4");


    /* -----------------------------------------------------------
       PAGE 1 → PAGE 2
    ----------------------------------------------------------- */

    const toPage2Btn =
      $("#toPage2Btn");


    if (toPage2Btn) {

      toPage2Btn.addEventListener(
        "click",
        () => {

          goToPage(
            page1,
            page2,
            runPage2Sequence
          );

        }
      );
    }


    /* -----------------------------------------------------------
       PAGE 2 → PAGE 3
    ----------------------------------------------------------- */

    const toPage3Btn =
      $("#toPage3Btn");


    if (toPage3Btn) {

      toPage3Btn.addEventListener(
        "click",
        () => {

          goToPage(
            page2,
            page3,
            runPage3Sequence
          );

        }
      );
    }


    /* -----------------------------------------------------------
       PAGE 3 → PAGE 4
    ----------------------------------------------------------- */

    const toPage4Btn =
      $("#toPage4Btn");


    if (toPage4Btn) {

      toPage4Btn.addEventListener(
        "click",
        () => {

          goToPage(
            page3,
            page4,
            runPage4Sequence
          );

        }
      );
    }


    /* -----------------------------------------------------------
       START PAGE 1
    ----------------------------------------------------------- */

    runIntroSequence();
  }


  /* ---------------------------------------------------------------
     START APPLICATION
  --------------------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
