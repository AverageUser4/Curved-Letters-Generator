class ColorMaster {

  numbersRegex = /\d+/g;

  stringToObject(string) {
    const d = string.match(this.numbersRegex);
    return { r: d[0], g: d[1], b: d[2] };
  }

  getContrastingColor(color, asString = false, enhancedRatio = false) {
    let randomColor = this.getRandomColor();
    let minimum = enhancedRatio ? 7 : 4.5;

    let i = 0;

    while(this.getContrastRatio(color, randomColor) < minimum) {
      if(i > 1000)
        minimum = 4.5;

      if(i > 3000)
        break;

      randomColor = this.getRandomColor();
      i++;
    }

    return asString ? `rgb(${randomColor.r}, ${randomColor.g}, ${randomColor.b})`: randomColor;
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    return { r, g, b };
  }

  getRelativeLuminance(r, g, b) {
    const RsRGB = r / 255;
    const GsRGB = g / 255;
    const BsRGB = b / 255;

    const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : ((RsRGB + 0.055) / 1.055) ** 2.4;
    const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : ((GsRGB + 0.055) / 1.055) ** 2.4;
    const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : ((BsRGB + 0.055) / 1.055) ** 2.4;

    return R * 0.2126 + G * 0.7152 + B * 0.0722;
  }

  getContrastRatio(colorA, colorB) {
    const luminanceA = this.getRelativeLuminance(colorA.r, colorA.g, colorA.b);
    const luminanceB = this.getRelativeLuminance(colorB.r, colorB.g, colorB.b);

    const a = Math.max(luminanceA, luminanceB);
    const b = Math.min(luminanceA, luminanceB);

    return (a + 0.05) / (b + 0.05);
  }

}

export default new ColorMaster();