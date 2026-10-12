/* Astronomy Engine 2.1.19; calendar dates use Beijing time. */
const Lunar = (() => {
  const dateFormat = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', month: 'numeric', day: 'numeric'
  });
  function at(timestamp) {
    const date = new Date(timestamp);
    const lastNewMoon = Astronomy.SearchMoonPhase(0, date, -40);
    if (!lastNewMoon) throw new Error('Cannot determine the preceding new moon');
    const parts = dateFormat.formatToParts(date);
    const month = parts.find(part => part.type === 'month').value;
    const day = parts.find(part => part.type === 'day').value;
    return {
      phase: Astronomy.MoonPhase(date) / 360,
      fraction: Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction,
      ageDays: (date.getTime() - lastNewMoon.date.getTime()) / 86400000,
      dateText: `${month}月${day}日`
    };
  }
  // Cache one ephemeris calculation per minute, not per animation frame.
  let cachedMinute, cachedState;
  function current(timestamp = Date.now()) {
    const minute = Math.floor(timestamp / 60000);
    if (minute !== cachedMinute) {
      cachedState = at(timestamp);
      cachedMinute = minute;
    }
    return cachedState;
  }
  return { at, current };
})();
