// countdown.js — version timezone-safe (default: Europe/Paris)
(function () {

    // ===== 工具：把某个时区的本地时间 -> UTC 时间戳(毫秒) =====
    function zonedDateTimeToUTCTimestamp(year, month, day, hour, minute, second, timeZone) {
        // 1. 先用这些数字当成 UTC 构造一个近似时间
        const approx = new Date(Date.UTC(year, month, day, hour, minute, second, 0));

        // 2. 用 Intl 把这个 approx 映射到指定时区，拿到它在该时区显示出来的年月日时分秒
        const dtf = new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        function getParts(d) {
            const parts = dtf.formatToParts(d);
            const out = {};
            for (const p of parts) {
                if (p.type !== "literal") {
                    out[p.type] = p.value;
                }
            }
            return {
                year: parseInt(out.year, 10),
                month: parseInt(out.month, 10),   // 1-12
                day: parseInt(out.day, 10),
                hour: parseInt(out.hour, 10),
                minute: parseInt(out.minute, 10),
                second: parseInt(out.second, 10),
            };
        }

        const actual = getParts(approx);

        // 3. 把 actual 当成“这是一个 UTC 时间”去解读，得到它的毫秒值
        const actualAsUTCms = Date.UTC(
            actual.year,
            actual.month - 1,
            actual.day,
            actual.hour,
            actual.minute,
            actual.second,
            0
        );

        // 4. approx.getTime() 是真实 UTC 毫秒
        //    actualAsUTCms 是“该时区里显示出来的钟面时间”误当UTC后的毫秒
        //    差值就是这个时区当时的偏移（包括夏令时/冬令时）
        const offsetMs = actualAsUTCms - approx.getTime();

        // 5. 把我们真正想要的本地时间 (year/month/...) 减掉这个偏移，得到真正 UTC 时间戳
        const utcTimestamp = Date.UTC(year, month, day, hour, minute, second, 0) - offsetMs;

        return utcTimestamp;
    }

    function initCountdown(el) {
        const startDateStr = el.dataset.targetDate;           // "2025-12-01T10:00:00"
        const tz = el.dataset.timezone || "Europe/Paris";      // 默认巴黎
        const now = Date.now();
        let targetDate;

        // --- 解析 data-target-date ---
        if (startDateStr && startDateStr !== "") {
            try {
                if (startDateStr.includes("-") || startDateStr.includes("T")) {
                    // 形如 "2025-12-01T10:00:00"
                    const [datePart, timePart = "00:00:00"] = startDateStr.split("T");
                    const [yStr, mStr, dStr] = datePart.split("-");
                    const [hStr, minStr, sStr] = timePart.split(":");

                    const year    = parseInt(yStr, 10);
                    const month   = parseInt(mStr, 10) - 1; // JS: 0 = Jan
                    const day     = parseInt(dStr, 10);
                    const hour    = parseInt(hStr || "0", 10);
                    const minute  = parseInt(minStr || "0", 10);
                    const second  = parseInt(sStr || "0", 10);

                    // 关键：把“巴黎当地 yyyy-mm-dd hh:mm:ss”换成全局唯一 UTC 时间戳
                    targetDate = zonedDateTimeToUTCTimestamp(
                        year, month, day,
                        hour, minute, second,
                        tz
                    );
                } else if (!isNaN(parseInt(startDateStr, 10))) {
                    // 直接给了时间戳毫秒值
                    targetDate = parseInt(startDateStr, 10);
                }
            } catch (e) {
                console.error("Erreur lors du parsing de la date:", e);
                targetDate = null;
            }
        }

        // fallback：没给的话默认+7天
        if (!targetDate || isNaN(targetDate)) {
            targetDate = now + 7 * 24 * 60 * 60 * 1000;
        }

        // --- 注入 HTML 结构 ---
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

        // --- 样式注入（只加一次） ---
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

        // --- 倒计时刷新 ---
        function updateCountdown() {
            const currentTime = Date.now();
            const distance = targetDate - currentTime;

            const daysEl = el.querySelector("#days");
            const hoursEl = el.querySelector("#hours");
            const minutesEl = el.querySelector("#minutes");
            const secondsEl = el.querySelector("#seconds");

            if (distance < 0) {
                clearInterval(countdownTimer);
                daysEl.textContent =
                    hoursEl.textContent =
                    minutesEl.textContent =
                    secondsEl.textContent = "00";
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                daysEl.textContent = String(days).padStart(2, "0");
                hoursEl.textContent = String(hours).padStart(2, "0");
                minutesEl.textContent = String(minutes).padStart(2, "0");
                secondsEl.textContent = String(seconds).padStart(2, "0");

                // 可选：把剩余时间放到页面标题
                document.title =
                    `${daysEl.textContent}:` +
                    `${hoursEl.textContent}:` +
                    `${minutesEl.textContent}:` +
                    `${secondsEl.textContent}`;
            }

            el.querySelector("#countdown-wrapper").classList.remove("countdown-hidden");
        }

        updateCountdown();
        const countdownTimer = setInterval(updateCountdown, 1000);
    }

    // 初始化：你页面里所有 .countdown 都会被激活
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".countdown[data-target-date]").forEach(initCountdown);
    });

})();

