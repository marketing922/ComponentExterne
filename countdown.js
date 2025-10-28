// countdown.js — version timezone-safe (default: Europe/Paris)
(function () {

    // ===== 工具：把某个时区的本地时间 -> UTC 时间戳(毫秒) =====
    // ✅ 精确版本：正确处理巴黎冬/夏令时
    function zonedDateTimeToUTCTimestamp(year, month, day, hour, minute, second, timeZone) {
        // 构造 ISO 格式的字符串，比如 "2025-10-29T00:00:00"
        const isoLocal = `${year.toString().padStart(4, "0")}-${(month + 1)
            .toString()
            .padStart(2, "0")}-${day.toString().padStart(2, "0")}T${hour
                .toString()
                .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second
                    .toString()
                    .padStart(2, "0")}`;

        // 把这个时间格式化成指定时区下的当地时间字符串
        // 然后再 new Date() 让它转换为 UTC 毫秒
        const localStr = new Date(isoLocal).toLocaleString("en-US", { timeZone });
        const localDate = new Date(localStr);

        return localDate.getTime();
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

                    const year = parseInt(yStr, 10);
                    const month = parseInt(mStr, 10) - 1; // JS: 0 = Jan
                    const day = parseInt(dStr, 10);
                    const hour = parseInt(hStr || "0", 10);
                    const minute = parseInt(minStr || "0", 10);
                    const second = parseInt(sStr || "0", 10);

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

