// countdown.js
(function () {
    function initCountdown(el) {
        const targetDateStr = el.dataset.targetDate;
        if (!targetDateStr) return;

        const now = new Date();
        let targetDate;

        try {
            targetDate = new Date(targetDateStr).getTime();
            if (isNaN(targetDate)) throw new Error("Invalid date");
        } catch {
            targetDate = now.getTime() + 7 * 24 * 60 * 60 * 1000; // 默认+7天
        }

        // 创建 HTML 结构
        el.innerHTML = `
      <div class="countdown-container">
        <div class="countdown-box"><div class="countdown-value" data-role="days">00</div><div class="countdown-label">Jours</div></div>
        <div class="countdown-box"><div class="countdown-value" data-role="hours">00</div><div class="countdown-label">Heures</div></div>
        <div class="countdown-box"><div class="countdown-value" data-role="minutes">00</div><div class="countdown-label">Minutes</div></div>
        <div class="countdown-box"><div class="countdown-value" data-role="seconds">00</div><div class="countdown-label">Secondes</div></div>
      </div>
    `;

        // 添加样式（只注入一次）
        if (!document.getElementById("countdown-style")) {
            const style = document.createElement("style");
            style.id = "countdown-style";
            style.textContent = `
        .countdown-container {
          display: flex;
          justify-content: center;
          flex-wrap: nowrap;
          width: 100%;
          padding: 10px;
          font-family: Arial, sans-serif;
        }
        .countdown-box {
          margin: 5px;
          text-align: center;
          position: relative;
          min-width: 70px;
        }
        .countdown-box:not(:last-child):after {
          content: "-";
          position: absolute;
          right: -10px;
          top: 38%;
          transform: translateY(-50%);
          color: #DDD;
          font-size: calc(20px + 1vw);
        }
        .countdown-value {
          font-size: calc(25px + 2vw);
          font-weight: bold;
          color: #33a853;
        }
        .countdown-label {
          color: #33a853;
          font-size: calc(10px + 0.5vw);
        }
      `;
            document.head.appendChild(style);
        }

        // 更新倒计时
        function update() {
            const now = new Date().getTime();
            const diff = targetDate - now;

            const daysEl = el.querySelector('[data-role="days"]');
            const hoursEl = el.querySelector('[data-role="hours"]');
            const minutesEl = el.querySelector('[data-role="minutes"]');
            const secondsEl = el.querySelector('[data-role="seconds"]');

            if (diff <= 0) {
                clearInterval(timer);
                daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = "00";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            daysEl.textContent = String(days).padStart(2, "0");
            hoursEl.textContent = String(hours).padStart(2, "0");
            minutesEl.textContent = String(minutes).padStart(2, "0");
            secondsEl.textContent = String(seconds).padStart(2, "0");
        }

        const timer = setInterval(update, 1000);
        update();
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".countdown[data-target-date]").forEach(initCountdown);
    });
})();
