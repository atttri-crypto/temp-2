// =====================================================================
//  ChemLab: The Chemical Crisis  —  art.ts
//  Every picture in the game, drawn in code: themes, tiles, parallax
//  backgrounds, characters, enemies, items, props, portraits.
//  (No top-level code: call Art.initSprites() once, Art.setTheme(level)
//  at the start of each level.)
// =====================================================================

// default Arcade palette
enum C { Clear = 0, White = 1, Red = 2, Pink = 3, Orange = 4, Yellow = 5, Teal = 6, Green = 7, Blue = 8, LBlue = 9, Purple = 10, Gray = 11, DPurple = 12, Tan = 13, Brown = 14, Black = 15 }

class Theme {
    wallDot: number; accent: number; topA: number; topB: number; fillDot: number
    liquid: number; liquidShade: number; liquidHi: number; slime: number; slimeShade: number
    fume: number; stripeA: number; windows: boolean; dark: boolean; glass: number[]
}

namespace Art {
    export let th: Theme
    // tiles
    export let tiles: Image[]
    export let tLiqTop: Image
    export let tConvL: Image
    export let tConvR: Image
    // backgrounds
    export let far: Image
    export let mid: Image
    export let animK: number[]
    export let animX: number[]
    export let animY: number[]
    export let windowX: number[]
    export let darkness: Image
    // sprites
    export let heroR: Image[]
    export let heroL: Image[]
    export let slime: Image[]
    export let fume: Image
    export let drone: Image[]
    export let flasks: Image[]
    export let rareBase: Image
    export let logPad: Image
    export let medkit: Image
    export let spring: Image[]
    export let flame: Image[]
    export let drop: Image
    export let barrel: Image[]
    export let spawner: Image
    export let pipe: Image
    export let mover: Image
    export let crumble: Image[]
    export let shower: Image[]
    export let props: Image[]
    export let boss: Image[]
    export let consoleImg: Image[]
    export let proj: Image
    export let puddle: Image
    export let vent: Image
    export let portraitHalden: Image
    export let portraitMix: Image
    export let portraitNarrator: Image
    export let heartFull: Image
    export let heartEmpty: Image
    export let flaskIcon: Image
    export let titleBig: Image

    // ------------------------------------------------------------------
    //  drawing helpers
    // ------------------------------------------------------------------
    export function dither(im: Image, x: number, y: number, w: number, h: number, c: number, step: number) {
        for (let yy = y; yy < y + h; yy++)
            for (let xx = x; xx < x + w; xx++)
                if ((xx + yy) % step == 0) im.setPixel(xx, yy, c)
    }
    export function dots(im: Image, x: number, y: number, w: number, h: number, c: number) {
        for (let yy = y; yy < y + h; yy += 2)
            for (let xx = x + (yy % 4 == 0 ? 0 : 1); xx < x + w; xx += 2) im.setPixel(xx, yy, c)
    }
    export function stripes(im: Image, x: number, y: number, w: number, h: number, a: number) {
        for (let yy = y; yy < y + h; yy++)
            for (let xx = x; xx < x + w; xx++)
                im.setPixel(xx, yy, ((xx + yy) % 6) < 3 ? a : C.Black)
    }
    export function jar(im: Image, x: number, bottom: number, w: number, h: number, liquid: number) {
        im.fillRect(x, bottom - h, w, h, C.Black)
        im.fillRect(x + 1, bottom - h + 1, w - 2, h - 2, C.DPurple)
        im.fillRect(x + 1, bottom - Math.idiv(h * 2, 3), w - 2, Math.idiv(h * 2, 3) - 1, liquid)
        im.setPixel(x + 1, bottom - h + 2, C.White)
        im.fillRect(x, bottom - h - 1, w, 1, C.Gray)
    }
    export function flask(im: Image, cx: number, bottom: number, liquid: number) {
        im.fillRect(cx - 1, bottom - 9, 3, 3, C.LBlue)
        for (let i = 0; i < 6; i++) {
            const half = 1 + Math.idiv(i, 2)
            im.fillRect(cx - half, bottom - 6 + i, half * 2 + 1, 1, i >= 3 ? liquid : C.LBlue)
        }
        im.setPixel(cx - 1, bottom - 4, C.White)
    }
    export function sign(im: Image, cx: number, top: number, size: number, col: number) {
        for (let i = 0; i < size; i++) {
            const half = Math.idiv(i, 2) + 1
            im.fillRect(cx - half, top + i, half * 2, 1, (i == size - 1 || i == 0) ? C.Black : col)
            im.setPixel(cx - half, top + i, C.Black)
            im.setPixel(cx + half - 1, top + i, C.Black)
        }
        im.fillRect(cx - 1, top + 4, 1, size - 8, C.Black)
        im.setPixel(cx - 1, top + size - 3, C.Black)
    }
    function tank(im: Image, tx: number, ty: number, th2: number, liquid: number, shade: number) {
        im.fillRect(tx - 3, ty - 5, 26, 5, C.Gray); im.fillRect(tx - 3, ty + th2, 26, 5, C.Gray)
        im.fillRect(tx - 3, ty - 5, 26, 1, C.White)
        im.fillRect(tx, ty, 20, th2, C.Black)
        im.fillRect(tx + 1, ty + Math.idiv(th2, 4), 18, th2 - Math.idiv(th2, 4), liquid)
        dither(im, tx + 1, ty + Math.idiv(th2, 2), 18, th2 - Math.idiv(th2, 2), shade, 3)
        im.fillRect(tx + 3, ty, 1, th2, C.White)
        im.fillRect(tx + 9, 18, 2, ty - 23, C.Gray)
    }
    function gauge(im: Image, gx: number, gy: number) {
        im.fillCircle(gx, gy, 6, C.Black); im.fillCircle(gx, gy, 5, C.White)
        im.drawLine(gx, gy, gx + 3, gy - 3, C.Red)
    }
    function vpipes(im: Image, x: number, floor: number, col: number) {
        im.fillRect(x, 18, 5, floor - 18, col); im.fillRect(x + 1, 18, 1, floor - 18, C.White)
        im.fillRect(x + 8, 18, 3, floor - 18, C.Gray)
        for (let y = 30; y < floor; y += 26) im.fillRect(x - 2, y, 9, 3, C.DPurple)
    }
    function shelf(im: Image, x: number, floor: number, labels: boolean) {
        im.fillRect(x, 58, 64, floor - 58, C.Brown)
        im.fillRect(x + 2, 60, 60, floor - 62, C.Black)
        for (let s = 0; s < 3; s++) {
            const sy = 82 + s * 24
            im.fillRect(x + 2, sy, 60, 2, C.Gray)
            let jx = x + 4
            while (jx < x + 56) {
                const w = 4 + randint(0, 3), h = 7 + randint(0, 9)
                const liq = th.glass[randint(0, th.glass.length - 1)]
                if (randint(0, 2) == 0) flask(im, jx + 3, sy, liq)
                else { jar(im, jx, sy, w, h, liq); if (labels) im.setPixel(jx + 2, sy - Math.idiv(h, 2), C.White) }
                jx += w + 2 + randint(0, 2)
            }
        }
    }

    // ------------------------------------------------------------------
    //  THEMES
    // ------------------------------------------------------------------
    export function setTheme(level: number) {
        const t = new Theme()
        t.wallDot = [C.Blue, C.DPurple, C.Brown, C.Purple, C.DPurple][level]
        t.accent = [C.Teal, C.Yellow, C.Orange, C.Pink, C.Teal][level]
        t.topA = [C.LBlue, C.Yellow, C.Tan, C.Pink, C.LBlue][level]
        t.topB = [C.Teal, C.Green, C.Orange, C.Purple, C.Teal][level]
        t.fillDot = [C.Blue, C.DPurple, C.Brown, C.Purple, C.DPurple][level]
        t.liquid = [C.Green, C.Yellow, C.Orange, C.Purple, C.Pink][level]
        t.liquidShade = [C.Teal, C.Green, C.Red, C.DPurple, C.Purple][level]
        t.liquidHi = [C.Yellow, C.White, C.Yellow, C.Pink, C.White][level]
        t.slime = [C.Green, C.Yellow, C.Orange, C.Purple, C.Pink][level]
        t.slimeShade = [C.Teal, C.Orange, C.Red, C.DPurple, C.Purple][level]
        t.fume = [C.Green, C.Yellow, C.Gray, C.Purple, C.Pink][level]
        t.stripeA = [C.Yellow, C.Yellow, C.Yellow, C.Pink, C.Teal][level]
        t.windows = level < 3
        t.dark = level == 4
        t.glass = [[C.Green, C.Yellow, C.Pink, C.LBlue, C.Purple, C.Orange], [C.Red, C.Orange, C.Yellow, C.Green, C.Blue, C.Purple],
        [C.Orange, C.Yellow, C.Red, C.Pink], [C.Purple, C.LBlue, C.Pink, C.Teal], [C.Teal, C.Pink, C.Yellow, C.LBlue]][level]
        th = t
        buildTiles()
        buildBackground(level)
        recolorThemed()
    }

    // ------------------------------------------------------------------
    //  TILES (16x16)
    // ------------------------------------------------------------------
    export enum T { Empty = 0, Top = 1, Fill = 2, Plat = 3, Crate = 4, LiqTop = 5, Liq = 6, Metal = 7, Shards = 8, ConvL = 9, ConvR = 10, DoorTop = 11, DoorMid = 12, DoorBot = 13, Exit = 14 }
    export function isSolid(t: number): boolean {
        return t == T.Top || t == T.Fill || t == T.Crate || t == T.Metal || t == T.ConvL || t == T.ConvR || t == T.DoorTop || t == T.DoorMid || t == T.DoorBot
    }
    function buildTiles() {
        const e = image.create(16, 16)
        const top = image.create(16, 16)
        top.fill(C.Black); dots(top, 0, 0, 16, 16, th.fillDot)
        top.fillRect(0, 0, 16, 1, th.topA); top.fillRect(0, 1, 16, 2, th.topB); stripes(top, 0, 3, 16, 2, th.stripeA)
        top.fillRect(15, 0, 1, 16, C.Black); top.setPixel(2, 9, th.topA); top.setPixel(13, 9, th.topA)
        const fill = image.create(16, 16)
        fill.fill(C.Black); dots(fill, 0, 0, 16, 16, th.fillDot)
        fill.drawRect(0, 0, 16, 16, C.Black); fill.setPixel(2, 2, th.topB); fill.setPixel(13, 13, th.topB)
        const plat = image.create(16, 16)
        plat.fillRect(0, 0, 16, 1, th.topA); plat.fillRect(0, 1, 16, 2, th.topB); stripes(plat, 0, 3, 16, 2, th.stripeA); plat.fillRect(0, 5, 16, 1, C.Black)
        plat.fillRect(2, 6, 2, 4, C.DPurple); plat.fillRect(12, 6, 2, 4, C.DPurple)
        const crate = image.create(16, 16)
        crate.fill(C.Brown); crate.drawRect(0, 0, 16, 16, C.Black); crate.drawRect(1, 1, 14, 14, C.Tan)
        crate.drawLine(2, 2, 13, 13, C.Tan); crate.drawLine(13, 2, 2, 13, C.Tan); crate.fillRect(5, 6, 6, 4, C.Tan); crate.fillRect(6, 7, 4, 2, C.Black)
        tLiqTop = image.create(16, 16)
        const liq = image.create(16, 16)
        liq.fill(th.liquid); dither(liq, 0, 0, 16, 16, th.liquidShade, 3)
        const metal = image.create(16, 16)
        metal.fill(C.DPurple); for (let i = -16; i < 16; i += 4) metal.drawLine(i, 15, i + 15, 0, C.Gray)
        metal.drawRect(0, 0, 16, 16, C.Black); metal.setPixel(2, 2, C.White); metal.setPixel(13, 13, C.White)
        const shards = image.create(16, 16)
        for (let i = 0; i < 5; i++) { const sx = 1 + i * 3, sh = 5 + (i * 7) % 6; shards.drawLine(sx, 15, sx + 1, 15 - sh, C.LBlue); shards.drawLine(sx + 1, 15, sx + 1, 15 - sh, C.White) }
        shards.fillRect(0, 15, 16, 1, C.Gray)
        tConvL = image.create(16, 16)
        tConvR = image.create(16, 16)
        const dTop = image.create(16, 16), dMid = image.create(16, 16), dBot = image.create(16, 16)
        const dl = [dTop, dMid, dBot]
        for (let k = 0; k < 3; k++) {
            const d = dl[k]
            d.fill(C.Gray); d.fillRect(0, 0, 2, 16, C.Black); d.fillRect(14, 0, 2, 16, C.Black); d.fillRect(2, 15, 12, 1, C.DPurple); d.fillRect(3, 0, 1, 16, C.White)
        }
        dTop.fillRect(5, 4, 6, 3, C.Red)
        dMid.fillRect(4, 3, 8, 10, C.Black); dMid.fillRect(6, 5, 4, 1, th.accent); dMid.fillRect(9, 6, 1, 2, th.accent); dMid.fillRect(7, 8, 2, 1, th.accent); dMid.fillRect(7, 9, 1, 1, th.accent); dMid.setPixel(7, 11, th.accent)
        stripes(dBot, 2, 8, 12, 7, C.Yellow)
        const ex = image.create(16, 16)
        ex.fill(C.DPurple); ex.fillRect(7, 0, 2, 16, C.Black); ex.drawRect(0, 0, 16, 16, C.Black)
        for (let i = 0; i < 4; i++) ex.fillRect(4 + i, 9 - i, 8 - i * 2, 1, C.Green)
        tiles = [e, top, fill, plat, crate, tLiqTop, liq, metal, shards, tConvL, tConvR, dTop, dMid, dBot, ex]
        animateTiles(0)
    }
    export function animateTiles(wave: number) {
        tLiqTop.fill(0)
        for (let x = 0; x < 16; x++) {
            const h = 4 + Math.round(Math.sin((x + wave) * 0.8) * 1.5)
            tLiqTop.fillRect(x, h, 1, 16 - h, th.liquid)
            tLiqTop.setPixel(x, h, (x + wave) % 5 == 0 ? C.White : th.liquidHi)
        }
        dither(tLiqTop, 0, 9, 16, 7, th.liquidShade, 3)
        tLiqTop.setPixel((wave * 3) % 16, 11, C.White)
        drawConv(tConvL, wave, -1)
        drawConv(tConvR, wave, 1)
    }
    function drawConv(im: Image, wave: number, dir: number) {
        im.fill(C.Black)
        im.fillRect(0, 0, 16, 1, C.Gray)
        for (let i = 0; i < 4; i++) {
            const ax = ((i * 4 + dir * wave) % 16 + 16) % 16
            if (dir < 0) { im.setPixel(ax + 1, 2, th.accent); im.setPixel(ax, 3, th.accent); im.setPixel(ax + 1, 4, th.accent) }
            else { im.setPixel(ax, 2, th.accent); im.setPixel(ax + 1, 3, th.accent); im.setPixel(ax, 4, th.accent) }
        }
        im.fillRect(0, 6, 16, 10, C.Black); dots(im, 0, 6, 16, 10, th.fillDot); im.fillCircle(3, 3, 1, C.Gray); im.fillCircle(12, 3, 1, C.Gray)
    }

    // ------------------------------------------------------------------
    //  PARALLAX BACKGROUNDS
    //  far: 256x160 opaque wall + windows / towers / reactor
    //  mid: 480x160 transparent lab furniture; animated parts listed in animK
    // ------------------------------------------------------------------
    export enum A { Bubbles = 0, Fan = 1, Beacon = 2, Monitor = 3, Furnace = 4, Centrifuge = 5, Leds = 6, Ring = 7, MixEye = 8, Drip = 9 }
    function anim(k: number, x: number, y: number) { animK.push(k); animX.push(x); animY.push(y) }

    function buildBackground(level: number) {
        far = image.create(256, 160)
        far.fill(C.Black)
        for (let px = 0; px < 256; px += 32)
            for (let py = 0; py < 160; py += 40) {
                for (let yy = py + 2; yy < py + 39; yy += 2) for (let xx = px + 2 + (yy % 4 == 0 ? 0 : 1); xx < px + 31; xx += 4) far.setPixel(xx, yy, th.wallDot)
                far.fillRect(px + 1, py + 1, 30, 1, th.wallDot)
            }
        windowX = []
        if (th.windows) {
            const wxs = [24, 152]
            for (let k = 0; k < 2; k++) {
                const wx = wxs[k]; windowX.push(wx)
                far.fillRect(wx - 3, 19, 70, 58, C.Black)
                for (let i = 0; i < 18; i++) far.setPixel(wx + randint(0, 63), 22 + randint(0, 30), C.White)
                let bx = wx
                while (bx < wx + 64) {
                    const bw = 6 + randint(0, 8), bh = 10 + randint(0, 21)
                    far.fillRect(bx, 74 - bh, Math.min(bw, wx + 64 - bx), bh, level == 2 ? C.Brown : C.DPurple)
                    for (let j = 0; j < 4; j++) far.setPixel(bx + 1 + randint(0, Math.max(0, bw - 3)), 76 - bh + randint(0, Math.max(0, bh - 5)), C.Yellow)
                    bx += bw + 1
                }
                for (let i = 0; i < 26; i++) { const rx = wx + randint(0, 61), ry = 22 + randint(0, 47); far.setPixel(rx, ry, C.LBlue); far.setPixel(rx + 1, ry + 2, C.LBlue) }
                far.fillRect(wx + 31, 22, 2, 52, th.wallDot); far.fillRect(wx, 47, 64, 2, th.wallDot)
            }
        } else if (level == 3) {
            for (let k = 0; k < 3; k++) {     // distillation towers
                const tx = 20 + k * 84
                far.fillRect(tx, 30, 26, 130, C.DPurple); far.fillCircle(tx + 13, 30, 13, C.DPurple)
                for (let y = 40; y < 130; y += 18) far.fillRect(tx - 3, y, 32, 3, C.Purple)
                far.fillRect(tx + 5, 30, 2, 100, C.Purple)
            }
        } else {
            for (let r = 46; r > 10; r -= 12) far.drawCircle(128, 70, r, r % 24 == 10 ? C.Teal : C.DPurple)
            far.fillCircle(128, 70, 8, C.Teal); far.fillCircle(128, 70, 4, C.White)
        }
        for (let x = 0; x < 256; x += 128) {
            far.fillRect(x, 0, 10, 160, C.Black); far.fillRect(x + 2, 0, 1, 160, th.topB)
            for (let y = 8; y < 160; y += 24) far.setPixel(x + 6, y, th.topA)
        }
        far.fillRect(104, 70, 22, 70, C.Black); far.fillRect(228, 84, 18, 56, C.Black)
        far.fillRect(0, 128, 256, 32, C.Black)

        // ---- mid layer
        mid = image.create(480, 160)
        animK = []; animX = []; animY = []
        const F = 132
        mid.fillRect(0, 4, 480, 6, C.Gray); mid.fillRect(0, 5, 480, 1, C.White); mid.fillRect(0, 9, 480, 1, C.DPurple)
        for (let x = 20; x < 480; x += 60) { mid.fillRect(x, 2, 4, 10, C.DPurple); mid.fillRect(x + 1, 2, 1, 10, C.Gray) }
        mid.fillRect(0, 15, 480, 3, th.topB); mid.fillRect(0, 15, 480, 1, th.topA)
        if (level == 0) {
            shelf(mid, 8, F, true); tank(mid, 86, 46, 84, C.Green, C.Teal); anim(A.Bubbles, 86, 46)
            periodic(118); sign(mid, 184, 50, 16, C.Yellow); anim(A.Beacon, 181, 27)
            hood(206, F); fan(292); monitor(316); phPoster(366); tank(mid, 430, 52, 78, C.Pink, C.Purple); anim(A.Bubbles, 430, 52)
            vpipes(mid, 458, F, C.Teal)
        } else if (level == 1) {
            tank(mid, 10, 50, 80, C.Yellow, C.Green); anim(A.Bubbles, 10, 50)
            phPoster(44); sign(mid, 120, 46, 16, C.Yellow); anim(A.Beacon, 117, 24)
            vpipes(mid, 146, F, C.Green); anim(A.Drip, 150, 28)
            tank(mid, 176, 56, 74, C.Yellow, C.Orange); anim(A.Bubbles, 176, 56)
            gauge(mid, 214, 60); gauge(mid, 232, 72); gauge(mid, 214, 84)
            fan(262); shelf(mid, 292, F, false); phPoster(372); tank(mid, 432, 46, 84, C.Green, C.Teal); anim(A.Bubbles, 432, 46)
        } else if (level == 2) {
            furnace(10, F); board(72); tank(mid, 150, 50, 80, C.Orange, C.Red); anim(A.Bubbles, 150, 50)
            sign(mid, 196, 50, 16, C.Orange); anim(A.Beacon, 193, 27)
            furnace(214, F); vpipes(mid, 280, F, C.Brown); fan(316); monitor(340)
            tank(mid, 392, 52, 78, C.Red, C.Brown); anim(A.Bubbles, 392, 52); furnace(420, F)
        } else if (level == 3) {
            tower(14, F); centrifuge(62, F); chroma(112); tower(170, F)
            tank(mid, 210, 50, 80, C.Purple, C.DPurple); anim(A.Bubbles, 210, 50); centrifuge(246, F)
            monitor(296); tower(346, F); tank(mid, 390, 52, 78, C.Pink, C.Purple); anim(A.Bubbles, 390, 52); vpipes(mid, 456, F, C.Purple)
        } else {
            servers(10, F); ring(110); servers(160, F); mixScreen(222); servers(272, F)
            tank(mid, 340, 50, 80, C.Teal, C.Blue); anim(A.Bubbles, 340, 50); sign(mid, 384, 50, 16, C.Pink); anim(A.Beacon, 381, 27)
            servers(404, F); vpipes(mid, 462, F, C.Teal)
        }
        mid.fillRect(0, F + 3, 480, 25, C.Black)
        stripes(mid, 0, F, 480, 3, th.stripeA)

        // darkness overlay (final level): transparent hole with dithered edge
        if (th.dark) {
            darkness = image.create(320, 240)
            for (let y = 0; y < 240; y++)
                for (let x = 0; x < 320; x++) {
                    const dx = x - 160, dy = y - 120, d = dx * dx + dy * dy
                    if (d > 78 * 78) darkness.setPixel(x, y, C.Black)
                    else if (d > 62 * 62) { if ((x + y) % 2 == 0 || d > 72 * 72) darkness.setPixel(x, y, C.Black) }
                    else if (d > 50 * 50) { if (x % 2 == 0 && y % 2 == 0) darkness.setPixel(x, y, C.Black) }
                }
        }
    }
    function periodic(x: number) {
        mid.fillRect(x, 34, 48, 34, C.Tan); mid.drawRect(x, 34, 48, 34, C.Brown)
        const cc = [C.Red, C.Orange, C.Yellow, C.Green, C.Teal, C.LBlue, C.Purple, C.Pink]
        for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) {
            if (r == 0 && c > 0 && c < 17) continue
            if ((r == 1 || r == 2) && c > 1 && c < 12) continue
            mid.fillRect(x + 2 + c * 2 + Math.idiv(c, 6), 40 + r * 4, 2, 3, cc[(c < 2 ? 0 : c < 12 ? 3 + c % 3 : 1 + c % 2)])
        }
        mid.fillRect(x + 4, 36, 30, 2, C.Black)
    }
    function phPoster(x: number) {
        mid.fillRect(x, 36, 54, 22, C.Tan)
        const pc = [C.Red, C.Red, C.Orange, C.Orange, C.Yellow, C.Yellow, C.Green, C.Green, C.Teal, C.LBlue, C.LBlue, C.Blue, C.Purple, C.Purple, C.DPurple]
        for (let i = 0; i < 15; i++) mid.fillRect(x + 3 + i * 3, 44, 3, 8, pc[i])
        mid.fillRect(x + 4, 38, 20, 2, C.Black)
    }
    function hood(x: number, F: number) {
        mid.fillRect(x, 56, 60, F - 56, C.Gray); mid.fillRect(x, 56, 60, 2, C.White)
        mid.fillRect(x + 5, 66, 50, 38, C.Black); dither(mid, x + 6, 67, 48, 14, C.LBlue, 4)
        mid.fillRect(x + 5, 92, 50, 1, C.Gray)
        flask(mid, x + 16, 103, th.glass[0]); jar(mid, x + 26, 103, 6, 10, th.glass[1]); flask(mid, x + 40, 103, th.glass[2])
        mid.fillRect(x + 6, 59, 22, 3, C.Black)
    }
    function fan(x: number) { mid.fillCircle(x, 46, 15, C.Black); mid.drawCircle(x, 46, 15, C.DPurple); anim(A.Fan, x, 46) }
    function monitor(x: number) {
        mid.fillRect(x, 50, 38, 26, C.DPurple); mid.fillRect(x + 2, 52, 34, 22, C.Black)
        for (let i = 0; i < 34; i++) mid.setPixel(x + 2 + i, 63 + Math.round(Math.sin(i * 0.45) * 4 + Math.sin(i * 0.17) * 2), C.Green)
        mid.fillRect(x + 17, 76, 4, 6, C.DPurple); mid.fillRect(x + 11, 82, 16, 2, C.DPurple)
        gauge(mid, x + 10, 98); gauge(mid, x + 28, 98)
        anim(A.Monitor, x + 2, 52)
    }
    function furnace(x: number, F: number) {
        mid.fillRect(x, 70, 50, F - 70, C.Brown); mid.fillRect(x, 70, 50, 2, C.Tan); mid.fillRect(x + 22, 18, 6, 52, C.Gray)
        mid.fillRect(x + 10, 92, 30, 22, C.Black); mid.fillRect(x + 12, 94, 26, 1, C.DPurple)
        anim(A.Furnace, x + 10, 92)
    }
    function board(x: number) {
        mid.fillRect(x, 34, 66, 40, C.Brown); mid.fillRect(x + 3, 37, 60, 34, C.Black)
        mid.print("2H2+O2", x + 6, 40, C.White, image.font5)
        mid.print("=>2H2O", x + 6, 48, C.White, image.font5)
        mid.print("CaCO3=>", x + 6, 58, C.Yellow, image.font5)
        mid.print("CaO+CO2", x + 22, 64, C.Yellow, image.font5)
    }
    function tower(x: number, F: number) {
        mid.fillRect(x, 40, 30, F - 40, C.Gray); mid.fillCircle(x + 15, 40, 15, C.Gray)
        mid.fillRect(x + 3, 40, 2, F - 40, C.White)
        for (let y = 52; y < F; y += 16) { mid.fillRect(x - 2, y, 34, 2, C.DPurple); mid.fillRect(x + 30, y + 4, 10, 2, C.LBlue) }
    }
    function centrifuge(x: number, F: number) {
        mid.fillRect(x, F - 36, 40, 36, C.DPurple); mid.fillCircle(x + 20, F - 36, 18, C.Purple); mid.fillCircle(x + 20, F - 36, 15, C.Black)
        anim(A.Centrifuge, x + 20, F - 36)
    }
    function chroma(x: number) {
        mid.fillRect(x, 34, 40, 50, C.Tan)
        const cc = [C.Red, C.Green, C.Blue, C.Yellow]
        for (let i = 0; i < 4; i++) { mid.fillCircle(x + 7 + i * 9, 74 - i * 9, 3, cc[i]); mid.fillCircle(x + 7 + i * 9, 78, 1, C.DPurple) }
        mid.fillRect(x + 2, 80, 36, 1, C.Gray)
    }
    function servers(x: number, F: number) {
        for (let k = 0; k < 2; k++) {
            mid.fillRect(x + k * 24, 50, 22, F - 50, C.Black); mid.drawRect(x + k * 24, 50, 22, F - 50, C.DPurple)
            for (let y = 56; y < F - 4; y += 8) mid.fillRect(x + k * 24 + 3, y, 16, 1, C.DPurple)
            anim(A.Leds, x + k * 24 + 3, 54)
        }
    }
    function ring(x: number) {
        mid.drawCircle(x + 24, 60, 26, C.DPurple); mid.drawCircle(x + 24, 60, 20, C.Teal); mid.fillCircle(x + 24, 60, 8, C.Black)
        anim(A.Ring, x + 24, 60)
    }
    function mixScreen(x: number) {
        mid.fillRect(x, 40, 40, 30, C.DPurple); mid.fillRect(x + 3, 43, 34, 24, C.Black)
        anim(A.MixEye, x + 3, 43)
    }

    // ------------------------------------------------------------------
    //  SPRITES
    // ------------------------------------------------------------------
    function flipped(src: Image): Image { const c = src.clone(); c.flipX(); return c }
    export function initSprites() {
        const upper = [
            ". . . . e e e e . . . .",
            ". . . e e e e e e . . .",
            ". . e e e e e e e e . .",
            ". . e e d d f 9 9 f . .",
            ". . e d d d d 9 9 d . .",
            ". . . d d d d d d . . .",
            ". . . . d d d d . . . .",
            ". . 1 1 1 1 1 1 1 . . .",
            ". 1 1 1 1 1 6 1 1 1 1 .",
            ". d 1 1 1 1 1 1 1 1 d .",
            ". . 1 1 1 1 1 1 1 . . .",
            ". . 1 1 1 1 1 1 1 1 . ."]
        const legs = [
            [". . . 8 8 . . 8 8 . . .", ". . . 8 8 . . 8 8 . . .", ". . . 8 8 . . 8 8 . . .", ". . f f f . . f f f . ."],
            [". . . 8 8 . . 8 8 . . .", ". . 8 8 . . . . 8 8 . .", ". . 8 . . . . . . 8 . .", ". f f . . . . . . f f ."],
            [". . . . 8 8 8 8 . . . .", ". . . . 8 8 8 8 . . . .", ". . . . 8 8 8 . . . . .", ". . . f f f f f . . . ."],
            [". . . 8 8 . . 8 8 . . .", ". . 8 8 . . . . 8 8 . .", ". . 8 . . . . . . 8 . .", ". . f . . . . . . f . ."]]
        heroR = []; heroL = []
        for (let f = 0; f < 4; f++) {
            const rows = upper.concat(legs[f])
            const im = fromRows(rows)
            heroR.push(im); heroL.push(flipped(im))
        }
        // lab props (shared by every theme)
        props = [benchImg(), barrelProp(), cylinders(), terminal(), cabinet(), crateStack()]
        // pickups & misc
        flasks = []
        const fc = [C.Green, C.Yellow, C.Pink, C.LBlue, C.Purple, C.Orange, C.Red]
        for (let i = 0; i < fc.length; i++) { const f = image.create(7, 10); flask(f, 3, 10, fc[i]); flasks.push(f) }
        flaskIcon = flasks[3]
        rareBase = image.create(14, 14)
        rareBase.fill(C.Black); rareBase.drawRect(0, 0, 14, 14, C.LBlue); rareBase.drawRect(1, 1, 12, 12, C.Teal)
        logPad = image.create(9, 11)
        logPad.fill(C.DPurple); logPad.fillRect(1, 1, 7, 8, C.Teal); for (let i = 0; i < 3; i++) logPad.fillRect(2, 2 + i * 2, 5 - (i % 2) * 2, 1, C.Black); logPad.setPixel(4, 10, C.Gray)
        medkit = image.create(10, 9)
        medkit.fill(C.White); medkit.drawRect(0, 1, 10, 8, C.Gray); medkit.fillRect(4, 2, 2, 6, C.Red); medkit.fillRect(2, 4, 6, 2, C.Red); medkit.fillRect(3, 0, 4, 1, C.Gray)
        spring = []
        for (let k = 0; k < 2; k++) {
            const s = image.create(14, 10)
            const top = k == 0 ? 0 : 4
            s.fillRect(0, top, 14, 3, C.Teal); s.fillRect(0, top, 14, 1, C.LBlue)
            for (let y = top + 3; y < 8; y += 2) s.drawLine(2, y, 11, y + 1, C.Gray)
            s.fillRect(0, 8, 14, 2, C.DPurple)
            spring.push(s)
        }
        flame = []
        for (let k = 0; k < 4; k++) {
            const f = image.create(10, 44)
            f.fillRect(0, 40, 10, 4, C.DPurple); f.fillRect(3, 39, 4, 1, k == 1 ? C.Yellow : C.Gray)
            if (k >= 2) {
                for (let y = 0; y < 39; y++) {
                    const w = Math.max(1, Math.round(4.5 * (y / 39) + (Math.sin(y * 0.7 + k * 2) + 1)))
                    const col = y > 28 ? C.Yellow : y > 14 ? C.Orange : C.Red
                    f.fillRect(5 - Math.idiv(w, 2) - (k % 2), y, w, 1, col)
                    if (y > 30) f.setPixel(5, y, C.White)
                }
            }
            flame.push(f)
        }
        drop = image.create(4, 6)
        barrel = []
        for (let k = 0; k < 2; k++) {
            const b = image.create(12, 12)
            b.fillCircle(6, 6, 5, C.Blue); b.drawCircle(6, 6, 5, C.Black)
            if (k == 0) b.fillRect(5, 1, 2, 10, C.Yellow); else b.fillRect(1, 5, 10, 2, C.Yellow)
            b.setPixel(6, 6, C.Black); b.setPixel(3, 3, C.LBlue)
            barrel.push(b)
        }
        spawner = image.create(24, 32)
        spawner.fill(C.DPurple); spawner.drawRect(0, 0, 24, 32, C.Black); stripes(spawner, 1, 26, 22, 5, C.Yellow)
        spawner.fillRect(0, 12, 6, 14, C.Black); spawner.fillRect(10, 4, 10, 6, C.Black); spawner.print("<<", 10, 5, C.Teal, image.font5)
        pipe = image.create(10, 8)
        pipe.fillRect(3, 0, 4, 4, C.Gray); pipe.fillRect(0, 4, 10, 3, C.Gray); pipe.fillRect(0, 4, 10, 1, C.White); pipe.fillRect(4, 7, 2, 1, C.DPurple)
        mover = image.create(32, 6)
        mover.fill(C.DPurple); mover.fillRect(0, 0, 32, 1, C.LBlue); stripes(mover, 1, 2, 30, 2, C.Yellow); mover.fillRect(14, 5, 4, 1, C.Teal)
        crumble = []
        for (let k = 0; k < 2; k++) {
            const c = image.create(16, 7)
            c.fill(C.Brown); c.fillRect(0, 0, 16, 2, C.Tan)
            c.drawLine(4, 0, 6, 4, C.Black); c.drawLine(11, 1, 10, 5, C.Black)
            if (k == 1) { c.drawLine(1, 2, 8, 6, C.Black); c.drawLine(14, 0, 13, 6, C.Black); c.setPixel(7, 3, C.Black) }
            crumble.push(c)
        }
        shower = []
        for (let k = 0; k < 2; k++) {
            const s = image.create(14, 34)
            s.fillRect(3, 2, 2, 32, C.Gray); s.fillRect(3, 2, 10, 2, C.Gray); s.fillRect(9, 4, 5, 2, C.White)
            s.fillRect(0, 10, 7, 7, k == 1 ? C.Green : C.DPurple); s.fillRect(3, 11, 1, 5, C.White); s.fillRect(1, 13, 5, 1, C.White)
            s.fillRect(1, 32, 12, 2, C.DPurple)
            if (k == 1) for (let i = 0; i < 6; i++) s.setPixel(9 + (i % 3) * 2, 8 + i * 4, C.LBlue)
            shower.push(s)
        }
        boss = [bossImg(0), bossImg(1), bossImg(2)]
        consoleImg = []
        for (let k = 0; k < 3; k++) {
            const c = image.create(14, 20)
            c.fillRect(2, 6, 10, 14, C.DPurple); c.fillRect(0, 2, 14, 6, C.Black)
            c.fillRect(1, 3, 12, 4, k == 0 ? C.Black : k == 1 ? C.Teal : C.Green)
            if (k == 1) { c.fillRect(5, 0, 4, 2, C.Pink); c.setPixel(4, 4, C.White) }
            if (k == 2) { c.setPixel(5, 5, C.White); c.setPixel(6, 6, C.White); c.setPixel(7, 5, C.White); c.setPixel(8, 4, C.White) }
            consoleImg.push(c)
        }
        proj = image.create(7, 10); flask(proj, 3, 10, C.Pink)
        puddle = image.create(20, 4)
        vent = image.create(16, 4); vent.fill(C.DPurple); for (let i = 1; i < 16; i += 3) vent.fillRect(i, 1, 2, 2, C.Black)
        portraitHalden = halden()
        portraitMix = mixFace()
        portraitNarrator = image.create(32, 32); portraitNarrator.fill(C.Black); portraitNarrator.drawRect(0, 0, 32, 32, C.Teal)
        const bf = image.create(16, 22); flask(bf, 8, 22, C.Teal)
        portraitNarrator.drawTransparentImage(bigger(bf), 0, -10)
        heartFull = heart(C.Red); heartEmpty = heart(C.DPurple)
        // big title text "CHEMLAB"
        const small = image.create(48, 8)
        small.print("CHEM", 0, 0, C.White, image.font8)
        small.print("LAB", 25, 0, C.Green, image.font8)
        titleBig = bigger(small)
        slime = []; drone = []
        fume = image.create(16, 12)
    }
    function fromRows(rows: string[]): Image {
        const h = rows.length, w = Math.idiv(rows[0].length + 1, 2)
        const im = image.create(w, h)
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const ch = rows[y].charAt(x * 2)
            if (ch != ".") im.setPixel(x, y, "0123456789abcdef".indexOf(ch))
        }
        return im
    }
    export function bigger(src: Image): Image {
        const out = image.create(src.width * 2, src.height * 2)
        for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
            const c = src.getPixel(x, y)
            if (c != 0) out.fillRect(x * 2, y * 2, 2, 2, c)
        }
        return out
    }
    function heart(c: number): Image {
        return fromRows([". c c . c c .", "c c c c c c c", "c c c c c c c", ". c c c c c .", ". . c c c . .", ". . . c . . ."].map(r => r.split("c").join("0123456789abcdef".charAt(c))))
    }
    // recolor theme-dependent sprites (slimes, fumes, drones, drops, puddles)
    function recolorThemed() {
        const base = [
            [". . . . 7 7 7 7 . . . .", ". . 7 7 7 7 7 7 7 7 . .", ". 7 7 1 1 7 7 1 1 7 7 .", ". 7 1 1 f 7 7 1 f f 7 .", "7 7 7 f f 7 7 f f 7 7 7", "7 7 7 7 7 7 7 7 7 7 7 7", "7 7 7 6 6 6 6 6 6 7 7 7", "7 6 7 7 7 7 7 7 7 7 6 7", "6 6 6 6 6 6 6 6 6 6 6 6"],
            [". . . . . . . . . . . .", ". . . . 7 7 7 7 . . . .", ". 7 7 7 7 7 7 7 7 7 7 .", "7 7 1 1 7 7 7 1 1 7 7 7", "7 7 1 f f 7 7 1 f f 7 7", "7 7 7 f f 7 7 f f 7 7 7", "7 7 7 6 6 6 6 6 6 7 7 7", "6 7 7 7 7 7 7 7 7 7 7 6", "6 6 6 6 6 6 6 6 6 6 6 6"]]
        slime = []
        for (let k = 0; k < 2; k++) {
            const s = fromRows(base[k]); mapColor(s, 7, 6, th.slime, th.slimeShade); slime.push(s)
        }
        fume = image.create(16, 12)
        fume.fillCircle(5, 6, 4, th.fume); fume.fillCircle(10, 5, 5, th.fume); fume.fillCircle(8, 8, 3, th.fume)
        dither(fume, 0, 0, 16, 12, 0, 3)
        fume.fillRect(5, 4, 2, 2, C.Black); fume.fillRect(10, 4, 2, 2, C.Black); fume.fillRect(6, 8, 5, 1, C.Black)
        drone = []
        for (let k = 0; k < 2; k++) {
            const d = image.create(14, 9)
            d.fillRect(1, 3, 12, 6, C.Gray); d.fillRect(1, 3, 12, 1, C.White); d.fillRect(3, 5, 8, 3, C.Black)
            d.fillRect(k == 0 ? 8 : 4, 6, 2, 1, C.Red)
            d.fillRect(6, 1, 2, 2, C.DPurple); d.fillRect(k == 0 ? 1 : 3, 0, k == 0 ? 12 : 8, 1, C.LBlue)
            drone.push(d)
        }
        drop = image.create(4, 6); drop.fillRect(1, 0, 2, 2, th.liquid); drop.fillRect(0, 2, 4, 3, th.liquid); drop.fillRect(1, 5, 2, 1, th.liquid); drop.setPixel(1, 2, C.White)
        puddle = image.create(20, 4); puddle.fillRect(2, 0, 16, 4, th.liquid); puddle.fillRect(0, 2, 20, 2, th.liquid); puddle.fillRect(4, 1, 3, 1, C.White)
    }
    // swap two colours at once (safe even when the targets overlap)
    function mapColor(im: Image, fromA: number, fromB: number, toA: number, toB: number) {
        for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) {
            const c = im.getPixel(x, y)
            if (c == fromA) im.setPixel(x, y, toA)
            else if (c == fromB) im.setPixel(x, y, toB)
        }
    }
    export function rareCard(sym: string): Image {
        const im = rareBase.clone()
        im.print(sym, sym.length == 1 ? 5 : 2, 4, C.LBlue, image.font5)
        return im
    }
    export function lampImage(len: number): Image {
        const im = image.create(40, len + 52)
        im.fillRect(19, 0, 1, len, C.Black)
        im.fillRect(15, len, 10, 2, C.DPurple); im.fillRect(13, len + 2, 14, 2, C.DPurple); im.fillRect(16, len + 4, 8, 1, C.Yellow)
        for (let y = 0; y < 46; y++) {
            const half = 4 + Math.idiv(y * 3, 7)
            const step = y < 12 ? 3 : y < 28 ? 5 : 9
            for (let x = 20 - half; x < 20 + half; x++)
                if ((x * 3 + y * 7) % step == 0) im.setPixel(x, len + 6 + y, y < 10 ? C.Yellow : C.Tan)
        }
        return im
    }
    function benchImg(): Image {
        const im = image.create(32, 18)
        im.fillRect(0, 7, 32, 2, C.Black); im.fillRect(0, 6, 32, 1, C.Gray); im.fillRect(2, 9, 2, 9, C.DPurple); im.fillRect(28, 9, 2, 9, C.DPurple); im.fillRect(4, 12, 24, 6, C.DPurple)
        flask(im, 6, 6, C.Green); jar(im, 11, 6, 5, 6, C.Yellow); flask(im, 20, 6, C.Pink)
        im.fillRect(24, 3, 7, 1, C.Brown); im.fillRect(25, 0, 1, 4, C.Red); im.fillRect(27, 0, 1, 4, C.LBlue); im.fillRect(29, 0, 1, 4, C.Green)
        return im
    }
    function barrelProp(): Image {
        const im = image.create(10, 14)
        im.fillRect(0, 1, 10, 13, C.Blue); im.fillRect(2, 1, 2, 13, C.LBlue); im.fillRect(0, 4, 10, 1, C.Black); im.fillRect(0, 10, 10, 1, C.Black); im.fillRect(0, 0, 10, 1, C.Gray)
        im.fillRect(4, 6, 3, 3, C.Yellow); im.setPixel(5, 7, C.Black)
        return im
    }
    function cylinders(): Image {
        const im = image.create(14, 22)
        const cc = [C.Green, C.Red, C.Blue]
        for (let i = 0; i < 3; i++) { im.fillRect(i * 5, 4 + i, 4, 18 - i, cc[i]); im.fillRect(i * 5 + 1, 4 + i, 1, 18 - i, C.White); im.fillRect(i * 5 + 1, 1 + i, 2, 3, C.Gray) }
        im.fillRect(0, 12, 14, 1, C.Black)
        return im
    }
    function terminal(): Image {
        const im = image.create(14, 20)
        im.fillRect(1, 2, 12, 18, C.DPurple); im.fillRect(3, 4, 8, 6, C.Black); im.fillRect(4, 6, 5, 1, C.Green); im.fillRect(4, 8, 3, 1, C.Green)
        im.fillRect(3, 12, 8, 3, C.Gray); im.setPixel(11, 16, C.Red)
        return im
    }
    function cabinet(): Image {
        const im = image.create(14, 26)
        im.fillRect(0, 0, 14, 26, C.Yellow); im.fillRect(0, 0, 14, 1, C.White); im.fillRect(6, 1, 1, 25, C.Orange); im.drawRect(0, 0, 14, 26, C.Brown)
        im.fillRect(4, 8, 6, 5, C.Red); im.fillRect(6, 7, 2, 2, C.Orange); im.fillRect(2, 3, 10, 2, C.Black)
        return im
    }
    function crateStack(): Image {
        const im = image.create(20, 20)
        im.fillRect(0, 10, 10, 10, C.Brown); im.fillRect(10, 10, 10, 10, C.Brown); im.fillRect(5, 0, 10, 10, C.Brown)
        im.drawRect(0, 10, 10, 10, C.Tan); im.drawRect(10, 10, 10, 10, C.Tan); im.drawRect(5, 0, 10, 10, C.Tan)
        return im
    }
    function bossImg(mode: number): Image {   // 0 normal, 1 hit flash, 2 stunned
        const im = image.create(44, 36)
        const body = mode == 1 ? C.White : C.Gray
        // arms
        im.drawLine(6, 14, 1, 24, C.DPurple); im.drawLine(37, 14, 42, 24, C.DPurple)
        im.fillCircle(1, 25, 2, C.Yellow); im.fillCircle(42, 25, 2, C.Yellow)
        flask(im, 2, 35, C.Green); flask(im, 41, 35, C.Pink)
        // body
        im.fillCircle(22, 15, 14, body); im.drawCircle(22, 15, 14, C.Black)
        stripes(im, 12, 25, 20, 3, C.Yellow)
        // glass core
        im.fillCircle(22, 17, 7, C.Black); im.fillCircle(22, 17, 6, C.DPurple)
        im.fillRect(16, 17, 13, 6, mode == 2 ? C.Teal : C.Pink); im.fillCircle(22, 17, 6, 0); im.drawCircle(22, 17, 6, C.LBlue)
        for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) if (x * x + y * y <= 25 && y >= 0) im.setPixel(22 + x, 17 + y, mode == 2 ? C.Teal : C.Pink)
        im.setPixel(20, 15, C.White)
        // visor + eyes
        im.fillRect(13, 3, 18, 6, C.Black)
        if (mode == 2) { im.drawLine(15, 4, 18, 7, C.Teal); im.drawLine(18, 4, 15, 7, C.Teal); im.drawLine(25, 4, 28, 7, C.Teal); im.drawLine(28, 4, 25, 7, C.Teal) }
        else { im.fillRect(15, 5, 4, 2, C.Red); im.fillRect(25, 5, 4, 2, C.Red) }
        // thruster
        im.fillRect(19, 29, 6, 2, C.DPurple); im.fillRect(20, 31, 4, 3, C.LBlue); im.fillRect(21, 34, 2, 2, C.White)
        return im
    }
    function halden(): Image {
        const im = image.create(32, 32)
        im.fill(C.Blue); dots(im, 0, 0, 32, 32, C.Black)
        im.fillRect(6, 24, 20, 8, C.White); im.fillRect(14, 24, 4, 8, C.Gray); im.fillRect(20, 27, 3, 3, C.Teal)
        im.fillCircle(16, 15, 8, C.Tan)
        im.fillCircle(16, 11, 8, C.Gray); im.fillRect(8, 11, 3, 8, C.Gray); im.fillRect(21, 11, 3, 8, C.Gray); im.fillCircle(23, 7, 3, C.Gray)
        im.fillRect(10, 13, 13, 9, C.Tan)
        im.drawRect(10, 14, 5, 4, C.Black); im.drawRect(17, 14, 5, 4, C.Black); im.fillRect(15, 15, 2, 1, C.Black)
        im.setPixel(12, 16, C.Blue); im.setPixel(19, 16, C.Blue)
        im.fillRect(14, 20, 4, 1, C.Brown)
        im.drawRect(0, 0, 32, 32, C.Teal)
        return im
    }
    function mixFace(): Image {
        const im = image.create(32, 32)
        im.fill(C.Black)
        im.fillCircle(16, 17, 13, C.Gray); im.drawCircle(16, 17, 13, C.DPurple)
        im.fillRect(7, 10, 18, 6, C.Black); im.fillRect(9, 12, 4, 2, C.Red); im.fillRect(19, 12, 4, 2, C.Red)
        im.fillCircle(16, 23, 4, C.Pink); im.drawCircle(16, 23, 4, C.LBlue)
        im.drawRect(0, 0, 32, 32, C.Red)
        return im
    }
}
