const color_color = $("#color_color"),
  color_dragger = $("#color_dragger"),
  color_h = $("#color_h"),
  color_h_dragger = $("#color_h_dragger"),
  color_alpha = $("#color_alpha"),
  color_alpha_dragger = $("#color_alpha_dragger"),
  color_preview = $("#color_preview"),
  color_preview_text = $("#color_preview_text");

let h = 0,
  s = 0,
  v = 0,
  a = 1;

function HSVtoRGB(h, s, v, a) {
  let i, f, p1, p2, p3;
  let r = 0,
    g = 0,
    b = 0;
  if (s < 0) s = 0;
  if (s > 1) s = 1;
  if (v < 0) v = 0;
  if (v > 1) v = 1;
  h %= 360;
  if (h < 0) h += 360;
  h /= 60;
  i = Math.floor(h);
  f = h - i;
  p1 = v * (1 - s);
  p2 = v * (1 - s * f);
  p3 = v * (1 - s * (1 - f));
  switch (i) {
    case 0:
      r = v;
      g = p3;
      b = p1;
      break;
    case 1:
      r = p2;
      g = v;
      b = p1;
      break;
    case 2:
      r = p1;
      g = v;
      b = p3;
      break;
    case 3:
      r = p1;
      g = p2;
      b = v;
      break;
    case 4:
      r = p3;
      g = p1;
      b = v;
      break;
    case 5:
      r = v;
      g = p1;
      b = p2;
      break;
  }
  if (a && a < 1)
    return (
      "rgba(" +
      Math.round(r * 255) +
      ", " +
      Math.round(g * 255) +
      ", " +
      Math.round(b * 255) +
      ", " +
      a +
      ")"
    );
  else
    return (
      "rgb(" +
      Math.round(r * 255) +
      ", " +
      Math.round(g * 255) +
      ", " +
      Math.round(b * 255) +
      ")"
    );
}

function HexToRgb(hex) {
  let hexNum = hex.substring(1);
  let a = 1;
  if (hexNum.length < 6) {
    hexNum = repeatLetter(hexNum, 2);
  } else if (hexNum.length == 8) {
    a = ("0x" + hexNum) & "0xff";
    a = Number(((a / 255) * 1).toFixed(2));
    hexNum = hexNum.substring(0, 6);
  }
  hexNum = "0x" + hexNum;
  let r = hexNum >> 16;
  let g = (hexNum >> 8) & "0xff";
  let b = hexNum & "0xff";
  return {
    red: r,
    green: g,
    blue: b,
    alpha: a,
  };

  function repeatWord(word, num) {
    let result = "";
    for (let i = 0; i < num; i++) {
      result += word;
    }
    return result;
  }
  function repeatLetter(word, num) {
    let result = "";
    for (let letter of word) {
      result += repeatWord(letter, num);
    }
    return result;
  }
}

function RgbToHsv(R, G, B, A) {
  R /= 255;
  G /= 255;
  B /= 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const range = max - min;
  let V = max;
  let S = V === 0 ? 0 : range / V;
  let H = 0;
  if (R === V) H = (60 * (G - B)) / range;
  if (G === V) H = 120 + (60 * (B - R)) / range;
  if (B === V) H = 240 + (60 * (R - G)) / range;

  if (range === 0) H = 0;
  if (H < 0) H += 360;
  H = H / 2 / 180;
  H = Number(H.toFixed(4));
  S = Number(S.toFixed(4));
  V = Number(V.toFixed(4));
  // S *= 255
  // V *= 255
  return [H, S, V, A];
}

function update_color_text() {
  const res = HSVtoRGB(h, s, v, a);
  color_preview.css("background-color", res);
  color_preview_text.val(res);
}

function update_color() {
  color_color.css("background-color", HSVtoRGB(h, 1, 1, 1));
  color_dragger.css({
    left: s * color_color.width() + "px",
    top: color_color.height() - v * color_color.height(),
  });
  color_h_dragger.css({ left: (h * color_h.width()) / 360 });
  color_alpha_dragger.css({ left: a * color_alpha.width() });
}

color_preview_text.change(function () {
  const val = color_preview_text.val().trim();
  let hsv;
  if (val.match(/^#[a-f0-9]{3,8}$/i)) {
    const { red, green, blue, alpha } = HexToRgb(val);
    hsv = RgbToHsv(red, green, blue, alpha);
    update_color_text();
  } else if (val.match(/^rgba\(.+?\)$/i)) {
    const match = val
      .replace(/\s+/g, "")
      .match(/^rgba\(([0-9]+),([0-9]+),([0-9]+),([0-9.]+)\)$/i);
    hsv = RgbToHsv(match[1], match[2], match[3], match[4]);
  } else if (val.match(/^rgb\(.+?\)$/i)) {
    const match = val
      .replace(/\s+/g, "")
      .match(/^rgb\(([0-9]+),([0-9]+),([0-9]+)\)$/i);
    hsv = RgbToHsv(match[1], match[2], match[3], 1);
  }
  h = hsv[0] * 360;
  s = hsv[1];
  v = hsv[2];
  a = hsv[3];
  update_color();
  update_color_text();
});

function update_color_position(left, top) {
  if (left < 0) left = 0;
  if (left > color_color.width()) left = color_color.width();
  if (top < 0) top = 0;
  if (top > color_color.height()) top = color_color.height();
  color_dragger.css({
    left: left + "px",
    top: top + "px",
  });
  s = left / color_color.width();
  v = (color_color.height() - top) / color_color.height();
  update_color_text();
}

function update_h_position(left) {
  if (left < 0) left = 0;
  if (left > color_h.width()) left = color_h.width();
  color_h_dragger.css({ left: left + "px" });
  h = ~~((left / color_h.width()) * 360);
  color_color.css("background-color", HSVtoRGB(h, 1, 1, 1));
  update_color_text();
}

function update_alpha_position(left) {
  if (left < 0) left = 0;
  if (left > color_alpha.width()) left = color_alpha.width();
  color_alpha_dragger.css({ left: left + "px" });
  a = Number((left / color_alpha.width()).toFixed(2));
  update_color_text();
}

function apply_dragger(element, setter) {
  element.mousedown(function (e) {
    let left = e.pageX - element.offset().left;
    let top = e.pageY - element.offset().top;
    setter(left, top);

    $(document).mousemove(function (e) {
      left = e.pageX - element.offset().left;
      top = e.pageY - element.offset().top;
      setter(left, top);
    });

    $(document).mouseup(function (e) {
      $(document).off("mousemove");
      $(document).off("mouseup");
    });
    return false;
  });
}

apply_dragger(color_color, update_color_position);
apply_dragger(color_h, update_h_position);
apply_dragger(color_alpha, update_alpha_position);
