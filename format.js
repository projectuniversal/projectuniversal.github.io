const inflog = Math.log10(Number.MAX_VALUE)
function formatValue(value, places, placesUnder1000) {
    if (value >= 1000) {
        if (value instanceof Decimal) {
           var power = value.e
           var matissa = value.mantissa
        } else {
            var matissa = value / Math.pow(10, Math.floor(Math.log10(value)));
            var power = Math.floor(Math.log10(value));
        }
        matissa = matissa.toFixed(places)
        if (matissa >= 10) {
            matissa /= 10;
            power++;
        }
        if (power > 100000) return (matissa + "e" + power.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
        return (matissa + "e" + power);
    } else {
        return (value).toFixed(placesUnder1000).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, '$1');
    }
}

shorten = function (money) {
  return formatValue(money, 2, 2);
};

shortenCosts = function (money) {
  return formatValue(money, 0, 0);
};

shortenDimensions = function (money) {
  return formatValue(money, 2, 0);
};

shortenMoney = function (money) {
  return formatValue(money, 2, 1);
};

function timeDisplay(time) {
  if (time <= 100) return (time).toFixed(3) + " seconds"
  if (time >= 31536000) {
      return Decimal.floor(time / 31536000) + " years, " + Decimal.floor((time % 31536000) / 86400) + " days, " + Decimal.floor((time % 86400) / 3600) + " hours, " + Decimal.floor((time % 3600) / 60) + " minutes, and " + Decimal.floor(time % 60) + " seconds"
  } else if (time >= 86400) {
      return Decimal.floor(time / 86400) + " days, " + Decimal.floor((time % 86400) / 3600) + " hours, " + Decimal.floor((time % 3600) / 60) + " minutes, and " + Decimal.floor(time % 60) + " seconds"
  } else if (time >= 3600) {
      return Decimal.floor(time / 3600) + " hours, " + Decimal.floor((time % 3600) / 60) + " minutes, and " + Decimal.floor(time % 60) + " seconds"
  } else if (time >= 60) {
      return Decimal.floor(time / 60) + " minutes, and " + Decimal.floor(time % 60) + " seconds"
  } else return Decimal.floor(time % 60) + " seconds"
}
