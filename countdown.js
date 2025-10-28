// countdown.js — version complète stylisée
(function () {
    function initCountdown(el) {
        const startDateStr = el.dataset.targetDate;
        const now = new Date();
        let targetDate;

        // --- 解析日期 ---
        if (startDateStr && startDateStr !== "") {
            try {
                if (startDateStr.includes("-") || startDateStr.includes("T")) {
                    const parts = startDateStr.split("T");
                    const dateParts = parts[0].split("-");
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1;
                    const day = parseInt(dateParts[2]);
                    let hours = 0, minutes = 0, seconds = 0;
                    if (parts.length > 1 && parts[1]) {
                        const timeParts = parts[1].split(":");
                        hours = parseInt(timeParts[0]);
                        minutes = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
                        seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;
                    }
                    // 调整为巴黎时间（夏令时约 +2）
                    const parisDate = new Date(Date.UTC(year, month, day, hours - 2, minutes, seconds));
                    targetDate = parisDate.getTime();
                } else if (!isNaN(parseInt(startDateStr))) {
                    targetDate = parseInt(startDateStr);
                }
            } catch (e) {
                console.error("Erreur lors du parsing de la date:", e);
                targetDate = null;
            }
        }

        if (!targetDate || isNaN(targetDate)) {
            targetDate = now.getTime() + 7 * 24 * 60 * 60 * 1000;
        }

        // --- 注入HTML结构 ---
        el.innerHTML = `
      <div id="countdown-wrapper" class="countdown-hidden">
        <div class="countdown-container">
          <div class="countdown-box">
            <div id="days" class="countdown-value">00</div>
            <div class="countdown-label">Jours</div>
          </div>
          <div class="countdown-box">
            <div id="hours" class="countdown-value">00</div>
            <div class="countdown-label">Heures</div>
          </div>
          <div class="countdown-box">
            <div id="minutes" class="countdown-value">00</div>
            <div class="countdown-label">Minutes</div>
          </div>
          <div class="countdown-box">
            <div id="seconds" class="countdown-value">00</div>
            <div class="countdown-label">Secondes</div>
          </div>
        </div>
      </div>
    `;

        // --- 添加样式（只添加一次） ---
        if (!document.getElementById("countdown-style")) {
            const style = document.createElement("style");
            style.id = "countdown-style";
            style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .countdown-container {
          display: flex; justify-content: center; flex-wrap: nowrap;
          width: 100%; padding: 10px; text-align: center;
        }
        .countdown-box {
          margin: 5px; text-align: center; flex: 1;
          min-width: 70px; max-width: 150px; position: relative;
        }
        .countdown-box:not(:last-child):after {
          content: "-"; position: absolute; right: -10px; top: 38%;
          transform: translateY(-50%); color: #DDD;
          font-size: calc(20px + 1vw); font-weight: normal;
        }
        .countdown-value {
          font-size: calc(25px + 2vw); font-weight: bold;
          color: #33a853; background-color: white;
          display: block;
        }
        .countdown-label {
          margin-top: 5px; color: #33a853;
          font-size: calc(10px + 0.5vw);
        }
        .countdown-hidden { visibility: hidden; }
        @media (max-width: 480px) {
          .countdown-box { min-width: 60px; margin: 3px; }
          .countdown-value { font-size: calc(25px + 2vw); }
          .countdown-label { font-size: calc(8px + 0.5vw); }
          .countdown-box:not(:last-child):after {
            right: -5px; font-size: calc(15px + 1vw);
          }
        }
      `;
            document.head.appendChild(style);
        }

        // --- 启动倒计时逻辑 ---
        function updateCountdown() {
            const currentTime = new Date().getTime();
            const distance = targetDate - currentTime;
            const daysEl = el.querySelector("#days");
            const hoursEl = el.querySelector("#hours");
            const minutesEl = el.querySelector("#minutes");
            const secondsEl = el.querySelector("#seconds");

            if (distance < 0) {
                clearInterval(countdownTimer);
                daysEl.textContent = hoursEl.textContent =
                    minutesEl.textContent = secondsEl.textContent = "00";
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                daysEl.textContent = String(days).padStart(2, "0");
                hoursEl.textContent = String(hours).padStart(2, "0");
                minutesEl.textContent = String(minutes).padStart(2, "0");
                secondsEl.textContent = String(seconds).padStart(2, "0");
                document.title = `${daysEl.textContent}:${hoursEl.textContent}:${minutesEl.textContent}:${secondsEl.textContent}`;
            }
            el.querySelector("#countdown-wrapper").classList.remove("countdown-hidden");
        }

        updateCountdown();
        const countdownTimer = setInterval(updateCountdown, 1000);
    }

    // 初始化
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".countdown[data-target-date]").forEach(initCountdown);
    });
})();
