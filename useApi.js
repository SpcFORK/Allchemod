import {ak as j, f as S, al as H, am as E, an as K, R as O, K as L, a8 as $, I as N, k as I, ao as q, g as M, ap as x, a1 as V, aq as W, V as J, ac as Q} from "./entry.dIduaBGw.js";
import {C as G, a as z, y as P} from "./index.V1O18Iln.js";
const Y = r=>r === "defer" || r === !1;
function X(...r) {
    var y;
    const n = typeof r[r.length - 1] == "string" ? r.pop() : void 0;
    typeof r[0] != "string" && r.unshift(n);
    let[s,e,t={}] = r;
    if (typeof s != "string")
        throw new TypeError("[nuxt] [asyncData] key must be a string.");
    if (typeof e != "function")
        throw new TypeError("[nuxt] [asyncData] handler must be a function.");
    const a = $()
      , o = ()=>null
      , d = ()=>a.isHydrating ? a.payload.data[s] : a.static.data[s];
    t.server = t.server ?? !0,
    t.default = t.default ?? o,
    t.getCachedData = t.getCachedData ?? d,
    t.lazy = t.lazy ?? !1,
    t.immediate = t.immediate ?? !0,
    t.deep = t.deep ?? j.deep,
    t.dedupe = t.dedupe ?? "cancel";
    const c = ()=>![null, void 0].includes(t.getCachedData(s));
    if (!a._asyncData[s] || !t.immediate) {
        (y = a.payload._errors)[s] ?? (y[s] = null);
        const l = t.deep ? S : H;
        a._asyncData[s] = {
            data: l(t.getCachedData(s) ?? t.default()),
            pending: S(!c()),
            error: E(a.payload._errors, s),
            status: S("idle")
        }
    }
    const i = {
        ...a._asyncData[s]
    };
    i.refresh = i.execute = (l={})=>{
        if (a._asyncDataPromises[s]) {
            if (Y(l.dedupe ?? t.dedupe))
                return a._asyncDataPromises[s];
            a._asyncDataPromises[s].cancelled = !0
        }
        if ((l._initial || a.isHydrating && l._initial !== !1) && c())
            return Promise.resolve(t.getCachedData(s));
        i.pending.value = !0,
        i.status.value = "pending";
        const h = new Promise((f,g)=>{
            try {
                f(e(a))
            } catch (D) {
                g(D)
            }
        }
        ).then(f=>{
            if (h.cancelled)
                return a._asyncDataPromises[s];
            let g = f;
            t.transform && (g = t.transform(f)),
            t.pick && (g = Z(g, t.pick)),
            a.payload.data[s] = g,
            i.data.value = g,
            i.error.value = null,
            i.status.value = "success"
        }
        ).catch(f=>{
            if (h.cancelled)
                return a._asyncDataPromises[s];
            i.error.value = N(f),
            i.data.value = I(t.default()),
            i.status.value = "error"
        }
        ).finally(()=>{
            h.cancelled || (i.pending.value = !1,
            delete a._asyncDataPromises[s])
        }
        );
        return a._asyncDataPromises[s] = h,
        a._asyncDataPromises[s]
    }
    ;
    const p = ()=>i.refresh({
        _initial: !0
    })
      , m = t.server !== !1 && a.payload.serverRendered;
    {
        const l = q();
        if (l && !l._nuxtOnBeforeMountCbs) {
            l._nuxtOnBeforeMountCbs = [];
            const f = l._nuxtOnBeforeMountCbs;
            l && (K(()=>{
                f.forEach(g=>{
                    g()
                }
                ),
                f.splice(0, f.length)
            }
            ),
            O(()=>f.splice(0, f.length)))
        }
        m && a.isHydrating && (i.error.value || c()) ? (i.pending.value = !1,
        i.status.value = i.error.value ? "error" : "success") : l && (a.payload.serverRendered && a.isHydrating || t.lazy) && t.immediate ? l._nuxtOnBeforeMountCbs.push(p) : t.immediate && p(),
        t.watch && L(t.watch, ()=>i.refresh());
        const h = a.hook("app:data:refresh", async f=>{
            (!f || f.includes(s)) && await i.refresh()
        }
        );
        l && O(h)
    }
    const u = Promise.resolve(a._asyncDataPromises[s]).then(()=>i);
    return Object.assign(u, i),
    u
}
function Z(r, n) {
    const s = {};
    for (const e of n)
        s[e] = r[e];
    return s
}
const T = Object.freeze({
    ignoreUnknown: !1,
    respectType: !1,
    respectFunctionNames: !1,
    respectFunctionProperties: !1,
    unorderedObjects: !0,
    unorderedArrays: !1,
    unorderedSets: !1,
    excludeKeys: void 0,
    excludeValues: void 0,
    replacer: void 0
});
function tt(r, n) {
    n ? n = {
        ...T,
        ...n
    } : n = T;
    const s = A(n);
    return s.dispatch(r),
    s.toString()
}
const et = Object.freeze(["prototype", "__proto__", "constructor"]);
function A(r) {
    let n = ""
      , s = new Map;
    const e = t=>{
        n += t
    }
    ;
    return {
        toString() {
            return n
        },
        getContext() {
            return s
        },
        dispatch(t) {
            return r.replacer && (t = r.replacer(t)),
            this[t === null ? "null" : typeof t](t)
        },
        object(t) {
            if (t && typeof t.toJSON == "function")
                return this.object(t.toJSON());
            const a = Object.prototype.toString.call(t);
            let o = "";
            const d = a.length;
            d < 10 ? o = "unknown:[" + a + "]" : o = a.slice(8, d - 1),
            o = o.toLowerCase();
            let c = null;
            if ((c = s.get(t)) === void 0)
                s.set(t, s.size);
            else
                return this.dispatch("[CIRCULAR:" + c + "]");
            if (typeof Buffer < "u" && Buffer.isBuffer && Buffer.isBuffer(t))
                return e("buffer:"),
                e(t.toString("utf8"));
            if (o !== "object" && o !== "function" && o !== "asyncfunction")
                this[o] ? this[o](t) : r.ignoreUnknown || this.unkown(t, o);
            else {
                let i = Object.keys(t);
                r.unorderedObjects && (i = i.sort());
                let p = [];
                r.respectType !== !1 && !R(t) && (p = et),
                r.excludeKeys && (i = i.filter(u=>!r.excludeKeys(u)),
                p = p.filter(u=>!r.excludeKeys(u))),
                e("object:" + (i.length + p.length) + ":");
                const m = u=>{
                    this.dispatch(u),
                    e(":"),
                    r.excludeValues || this.dispatch(t[u]),
                    e(",")
                }
                ;
                for (const u of i)
                    m(u);
                for (const u of p)
                    m(u)
            }
        },
        array(t, a) {
            if (a = a === void 0 ? r.unorderedArrays !== !1 : a,
            e("array:" + t.length + ":"),
            !a || t.length <= 1) {
                for (const c of t)
                    this.dispatch(c);
                return
            }
            const o = new Map
              , d = t.map(c=>{
                const i = A(r);
                i.dispatch(c);
                for (const [p,m] of i.getContext())
                    o.set(p, m);
                return i.toString()
            }
            );
            return s = o,
            d.sort(),
            this.array(d, !1)
        },
        date(t) {
            return e("date:" + t.toJSON())
        },
        symbol(t) {
            return e("symbol:" + t.toString())
        },
        unkown(t, a) {
            if (e(a),
            !!t && (e(":"),
            t && typeof t.entries == "function"))
                return this.array(Array.from(t.entries()), !0)
        },
        error(t) {
            return e("error:" + t.toString())
        },
        boolean(t) {
            return e("bool:" + t)
        },
        string(t) {
            e("string:" + t.length + ":"),
            e(t)
        },
        function(t) {
            e("fn:"),
            R(t) ? this.dispatch("[native]") : this.dispatch(t.toString()),
            r.respectFunctionNames !== !1 && this.dispatch("function-name:" + String(t.name)),
            r.respectFunctionProperties && this.object(t)
        },
        number(t) {
            return e("number:" + t)
        },
        xml(t) {
            return e("xml:" + t.toString())
        },
        null() {
            return e("Null")
        },
        undefined() {
            return e("Undefined")
        },
        regexp(t) {
            return e("regex:" + t.toString())
        },
        uint8array(t) {
            return e("uint8array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        uint8clampedarray(t) {
            return e("uint8clampedarray:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        int8array(t) {
            return e("int8array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        uint16array(t) {
            return e("uint16array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        int16array(t) {
            return e("int16array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        uint32array(t) {
            return e("uint32array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        int32array(t) {
            return e("int32array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        float32array(t) {
            return e("float32array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        float64array(t) {
            return e("float64array:"),
            this.dispatch(Array.prototype.slice.call(t))
        },
        arraybuffer(t) {
            return e("arraybuffer:"),
            this.dispatch(new Uint8Array(t))
        },
        url(t) {
            return e("url:" + t.toString())
        },
        map(t) {
            e("map:");
            const a = [...t];
            return this.array(a, r.unorderedSets !== !1)
        },
        set(t) {
            e("set:");
            const a = [...t];
            return this.array(a, r.unorderedSets !== !1)
        },
        file(t) {
            return e("file:"),
            this.dispatch([t.name, t.size, t.type, t.lastModfied])
        },
        blob() {
            if (r.ignoreUnknown)
                return e("[blob]");
            throw new Error(`Hashing Blob objects is currently not supported
Use "options.replacer" or "options.ignoreUnknown"
`)
        },
        domwindow() {
            return e("domwindow")
        },
        bigint(t) {
            return e("bigint:" + t.toString())
        },
        process() {
            return e("process")
        },
        timer() {
            return e("timer")
        },
        pipe() {
            return e("pipe")
        },
        tcp() {
            return e("tcp")
        },
        udp() {
            return e("udp")
        },
        tty() {
            return e("tty")
        },
        statwatcher() {
            return e("statwatcher")
        },
        securecontext() {
            return e("securecontext")
        },
        connection() {
            return e("connection")
        },
        zlib() {
            return e("zlib")
        },
        context() {
            return e("context")
        },
        nodescript() {
            return e("nodescript")
        },
        httpparser() {
            return e("httpparser")
        },
        dataview() {
            return e("dataview")
        },
        signal() {
            return e("signal")
        },
        fsevent() {
            return e("fsevent")
        },
        tlswrap() {
            return e("tlswrap")
        }
    }
}
const F = "[native code] }"
  , st = F.length;
function R(r) {
    return typeof r != "function" ? !1 : Function.prototype.toString.call(r).slice(-st) === F
}
class v {
    constructor(n, s) {
        n = this.words = n || [],
        this.sigBytes = s === void 0 ? n.length * 4 : s
    }
    toString(n) {
        return (n || rt).stringify(this)
    }
    concat(n) {
        if (this.clamp(),
        this.sigBytes % 4)
            for (let s = 0; s < n.sigBytes; s++) {
                const e = n.words[s >>> 2] >>> 24 - s % 4 * 8 & 255;
                this.words[this.sigBytes + s >>> 2] |= e << 24 - (this.sigBytes + s) % 4 * 8
            }
        else
            for (let s = 0; s < n.sigBytes; s += 4)
                this.words[this.sigBytes + s >>> 2] = n.words[s >>> 2];
        return this.sigBytes += n.sigBytes,
        this
    }
    clamp() {
        this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8,
        this.words.length = Math.ceil(this.sigBytes / 4)
    }
    clone() {
        return new v([...this.words])
    }
}
const rt = {
    stringify(r) {
        const n = [];
        for (let s = 0; s < r.sigBytes; s++) {
            const e = r.words[s >>> 2] >>> 24 - s % 4 * 8 & 255;
            n.push((e >>> 4).toString(16), (e & 15).toString(16))
        }
        return n.join("")
    }
}
  , nt = {
    stringify(r) {
        const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
          , s = [];
        for (let e = 0; e < r.sigBytes; e += 3) {
            const t = r.words[e >>> 2] >>> 24 - e % 4 * 8 & 255
              , a = r.words[e + 1 >>> 2] >>> 24 - (e + 1) % 4 * 8 & 255
              , o = r.words[e + 2 >>> 2] >>> 24 - (e + 2) % 4 * 8 & 255
              , d = t << 16 | a << 8 | o;
            for (let c = 0; c < 4 && e * 8 + c * 6 < r.sigBytes * 8; c++)
                s.push(n.charAt(d >>> 6 * (3 - c) & 63))
        }
        return s.join("")
    }
}
  , at = {
    parse(r) {
        const n = r.length
          , s = [];
        for (let e = 0; e < n; e++)
            s[e >>> 2] |= (r.charCodeAt(e) & 255) << 24 - e % 4 * 8;
        return new v(s,n)
    }
}
  , it = {
    parse(r) {
        return at.parse(unescape(encodeURIComponent(r)))
    }
};
class ot {
    constructor() {
        this._data = new v,
        this._nDataBytes = 0,
        this._minBufferSize = 0,
        this.blockSize = 512 / 32
    }
    reset() {
        this._data = new v,
        this._nDataBytes = 0
    }
    _append(n) {
        typeof n == "string" && (n = it.parse(n)),
        this._data.concat(n),
        this._nDataBytes += n.sigBytes
    }
    _doProcessBlock(n, s) {}
    _process(n) {
        let s, e = this._data.sigBytes / (this.blockSize * 4);
        n ? e = Math.ceil(e) : e = Math.max((e | 0) - this._minBufferSize, 0);
        const t = e * this.blockSize
          , a = Math.min(t * 4, this._data.sigBytes);
        if (t) {
            for (let o = 0; o < t; o += this.blockSize)
                this._doProcessBlock(this._data.words, o);
            s = this._data.words.splice(0, t),
            this._data.sigBytes -= a
        }
        return new v(s,a)
    }
}
class ct extends ot {
    update(n) {
        return this._append(n),
        this._process(),
        this
    }
    finalize(n) {
        n && this._append(n)
    }
}
const U = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225]
  , ut = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998]
  , B = [];
class lt extends ct {
    constructor() {
        super(...arguments),
        this._hash = new v([...U])
    }
    reset() {
        super.reset(),
        this._hash = new v([...U])
    }
    _doProcessBlock(n, s) {
        const e = this._hash.words;
        let t = e[0]
          , a = e[1]
          , o = e[2]
          , d = e[3]
          , c = e[4]
          , i = e[5]
          , p = e[6]
          , m = e[7];
        for (let u = 0; u < 64; u++) {
            if (u < 16)
                B[u] = n[s + u] | 0;
            else {
                const b = B[u - 15]
                  , w = (b << 25 | b >>> 7) ^ (b << 14 | b >>> 18) ^ b >>> 3
                  , k = B[u - 2]
                  , _ = (k << 15 | k >>> 17) ^ (k << 13 | k >>> 19) ^ k >>> 10;
                B[u] = w + B[u - 7] + _ + B[u - 16]
            }
            const y = c & i ^ ~c & p
              , l = t & a ^ t & o ^ a & o
              , h = (t << 30 | t >>> 2) ^ (t << 19 | t >>> 13) ^ (t << 10 | t >>> 22)
              , f = (c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)
              , g = m + f + y + ut[u] + B[u]
              , D = h + l;
            m = p,
            p = i,
            i = c,
            c = d + g | 0,
            d = o,
            o = a,
            a = t,
            t = g + D | 0
        }
        e[0] = e[0] + t | 0,
        e[1] = e[1] + a | 0,
        e[2] = e[2] + o | 0,
        e[3] = e[3] + d | 0,
        e[4] = e[4] + c | 0,
        e[5] = e[5] + i | 0,
        e[6] = e[6] + p | 0,
        e[7] = e[7] + m | 0
    }
    finalize(n) {
        super.finalize(n);
        const s = this._nDataBytes * 8
          , e = this._data.sigBytes * 8;
        return this._data.words[e >>> 5] |= 128 << 24 - e % 32,
        this._data.words[(e + 64 >>> 9 << 4) + 14] = Math.floor(s / 4294967296),
        this._data.words[(e + 64 >>> 9 << 4) + 15] = s,
        this._data.sigBytes = this._data.words.length * 4,
        this._process(),
        this._hash
    }
}
function ft(r) {
    return new lt().finalize(r).toString(nt)
}
function ht(r, n={}) {
    const s = typeof r == "string" ? r : tt(r, n);
    return ft(s).slice(0, 10)
}
function dt(r, n, s) {
    const [e={},t] = typeof n == "string" ? [{}, n] : [n, s]
      , a = M(()=>{
        let _ = r;
        return typeof _ == "function" && (_ = _()),
        x(_)
    }
    )
      , o = e.key || ht([t, typeof a.value == "string" ? a.value : "", ...yt(e)]);
    if (!o || typeof o != "string")
        throw new TypeError("[nuxt] [useFetch] key must be a string: " + o);
    if (!r)
        throw new Error("[nuxt] [useFetch] request is missing.");
    const d = o === t ? "$f" + o : o;
    if (!e.baseURL && typeof a.value == "string" && a.value[0] === "/" && a.value[1] === "/")
        throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
    const {server: c, lazy: i, default: p, transform: m, pick: u, watch: y, immediate: l, getCachedData: h, deep: f, ...g} = e
      , D = V({
        ...W,
        ...g,
        cache: typeof e.cache == "boolean" ? void 0 : e.cache
    })
      , b = {
        server: c,
        lazy: i,
        default: p,
        transform: m,
        pick: u,
        immediate: l,
        getCachedData: h,
        deep: f,
        watch: y === !1 ? [] : [D, a, ...y || []]
    };
    let w;
    return X(d, ()=>{
        var C;
        (C = w == null ? void 0 : w.abort) == null || C.call(w),
        w = typeof AbortController < "u" ? new AbortController : {};
        const _ = x(e.timeout);
        return _ && setTimeout(()=>w.abort(), _),
        (e.$fetch || globalThis.$fetch)(a.value, {
            signal: w.signal,
            ...D
        })
    }
    , b)
}
function yt(r) {
    var s;
    const n = [((s = x(r.method)) == null ? void 0 : s.toUpperCase()) || "GET", x(r.baseURL)];
    for (const e of [r.params || r.query]) {
        const t = x(e);
        if (!t)
            continue;
        const a = {};
        for (const [o,d] of Object.entries(t))
            a[x(o)] = x(d);
        n.push(a)
    }
    return n
}
function pt(r, n, s, e) {
    {
        localStorage.removeItem(r);
        for (let t = 1; t < n; t++)
            localStorage.removeItem(`${r}/v${t}`)
    }
    return G(`${r}/v${n}`, s, e)
}
const gt = J("ui", ()=>{
    const r = S([])
      , n = S(null)
      , s = z(`(min-width: ${P.sm}px)`)
      , e = z(`(max-height: ${P.sm}px)`)
      , t = M(()=>({
        width: s.value ? "wide" : "narrow",
        height: e.value ? "short" : "tall"
    }))
      , a = Q(pt("ui/dismissed", 1, {}))
      , o = (y,l)=>{
        const h = Math.random();
        return r.value.push({
            id: h,
            ...y
        }),
        l && setTimeout(()=>d(h), l),
        h
    }
      , d = (y,l=!1)=>{
        var f;
        const h = r.value.find(g=>g.id === y);
        (f = h == null ? void 0 : h.onHide) == null || f.call(h, l),
        r.value = r.value.filter(g=>g.id !== y)
    }
      , c = (y,l,h)=>{
        const f = Math.random();
        return n.value = {
            id: f,
            component: y,
            props: l,
            forceRightAnchor: h
        },
        f
    }
      , i = y=>{
        var l;
        ((l = n.value) == null ? void 0 : l.id) === y && (n.value = null)
    }
      , p = y=>{
        a.value[y] = Date.now()
    }
      , m = S(null);
    return {
        dismissed: a,
        toasts: r,
        tooltip: n,
        screen: t,
        inventoryBounds: m,
        dismiss: p,
        showToast: o,
        hideToast: d,
        setTooltip: c,
        unsetTooltip: i,
        setInventoryBounds: y=>{
            const {update: l, ...h} = S(y).value;
            m.value = h
        }
    }
}
)
  , vt = (r,n)=>dt(r, {
    ...n,
    retry: (n == null ? void 0 : n.retry) ?? 0,
    onResponseError(s) {
        typeof (n == null ? void 0 : n.onResponseError) == "function" && n.onResponseError(s),
        s.response.status === 429 && gt().showToast({
            content: "You're doing that too fast! Try again later.",
            emoji: "🐌",
            action: {
                text: "OK",
                callback: ()=>{}
            }
        }, 3e3)
    }
}, "$UqgiltlUfE");
export {dt as a, vt as b, pt as c, X as d, gt as u};
