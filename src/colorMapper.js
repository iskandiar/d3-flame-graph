function pickHex (color1, color2, weight) {
    const w1 = weight
    const w2 = 1 - w1
    const rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)]
    return rgb
}

function generateHash (name) {
    // Return a vector (0.0->1.0) that is a hash of the input string.
    // The hash is computed to favor early characters over later ones, so
    // that strings with similar starts have similar vectors. Only the first
    // 6 characters are considered.
    const MAX_CHAR = 6

    var hash = 0
    var maxHash = 0
    var weight = 1
    var mod = 10

    if (name) {
        for (var i = 0; i < name.length; i++) {
            if (i > MAX_CHAR) { break }
            hash += weight * (name.charCodeAt(i) % mod)
            maxHash += weight * (mod - 1)
            weight *= 0.70
        }
        if (maxHash > 0) { hash = hash / maxHash }
    }
    return hash
}

export function allocationColorMapper (d) {
    if (d.highlight) return 'rgb(230, 0, 230)'

    const self = d.data.value
    const total = d.value
    const color = pickHex([0, 255, 40], [196, 245, 233], self / total)

    return 'rgb(' + color.join() + ')'
}

export function offCpuColorMapper (d) {
    if (d.highlight) return '#E600E6'

    let name = d.data.n || d.data.name
    let vector = 0
    const nameArr = name.split('`')

    if (nameArr.length > 1) {
        name = nameArr[nameArr.length - 1] // drop module name if present
    }
    name = name.split('(')[0] // drop extra info
    vector = generateHash(name)

    const r = 0 + Math.round(55 * (1 - vector))
    const g = 0 + Math.round(230 * (1 - vector))
    const b = 200 + Math.round(55 * vector)

    return 'rgb(' + r + ',' + g + ',' + b + ')'
}

export function nodeJsColorMapper (d, originalColor) {
    let color = originalColor

    const extras = d.data.extras || {}
    const v8JIT = extras.v8_jit
    const javascript = extras.javascript
    const optimized = extras.optimized
    // Non-JS JIT frames (V8 builtins) are greyed out.
    if (v8JIT && !javascript) {
        color = '#dadada'
    }
    // JavaScript frames are colored based on optimization level
    if (javascript) {
        let opt = (optimized || 0) / d.value
        let r = 255
        let g = 0
        let b = 0
        if (opt < 0.4) {
            opt = opt * 2.5
            r = 240 - opt * 200
        } else if (opt < 0.9) {
            opt = (opt - 0.4) * 2
            r = 0
            b = 200 - (200 * opt)
            g = 100 * opt
        } else {
            opt = (opt - 0.9) * 10
            r = 0
            b = 0
            g = 100 + (150 * opt)
        }
        color = 'rgb(' + r + ',' + g + ',' + b + ')'
    }
    return color
}
