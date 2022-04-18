(function(scope) {
	var CryptoJS = CryptoJS || function(o) {
		function t() {}
		var e = {},
			n = e.lib = {},
			i = n.Base = {
				extend: function(e) {
					t.prototype = this;
					var n = new t;
					return e && n.mixIn(e), n.hasOwnProperty("init") || (n.init = function() {
						n.$super.init.apply(this, arguments)
					}), (n.init.prototype = n).$super = this, n
				},
				create: function() {
					var e = this.extend();
					return e.init.apply(e, arguments), e
				},
				init: function() {},
				mixIn: function(e) {
					for (var n in e) e.hasOwnProperty(n) && (this[n] = e[n]);
					e.hasOwnProperty("toString") && (this.toString = e.toString)
				},
				clone: function() {
					return this.init.prototype.extend(this)
				}
			},
			d = n.WordArray = i.extend({
				init: function(e, n) {
					e = this.words = e || [], this.sigBytes = null != n ? n : 4 * e.length
				},
				toString: function(e) {
					return (e || s).stringify(this)
				},
				concat: function(e) {
					var n = this.words,
						t = e.words,
						i = this.sigBytes;
					if (e = e.sigBytes, this.clamp(), i % 4)
						for (var r = 0; r < e; r++) n[i + r >>> 2] |= (t[r >>> 2] >>> 24 - r % 4 * 8 & 255) << 24 - (i + r) % 4 * 8;
					else if (65535 < t.length)
						for (r = 0; r < e; r += 4) n[i + r >>> 2] = t[r >>> 2];
					else n.push.apply(n, t);
					return this.sigBytes += e, this
				},
				clamp: function() {
					var e = this.words,
						n = this.sigBytes;
					e[n >>> 2] &= 4294967295 << 32 - n % 4 * 8, e.length = o.ceil(n / 4)
				},
				clone: function() {
					var e = i.clone.call(this);
					return e.words = this.words.slice(0), e
				},
				random: function(e) {
					for (var n = [], t = 0; t < e; t += 4) n.push(4294967296 * o.random() | 0);
					return new d.init(n, e)
				}
			}),
			r = e.enc = {},
			s = r.Hex = {
				stringify: function(e) {
					var n = e.words;
					e = e.sigBytes;
					for (var t = [], i = 0; i < e; i++) {
						var r = n[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						t.push((r >>> 4).toString(16)), t.push((15 & r).toString(16))
					}
					return t.join("")
				},
				parse: function(e) {
					for (var n = e.length, t = [], i = 0; i < n; i += 2) t[i >>> 3] |= parseInt(e.substr(i, 2), 16) << 24 - i % 8 * 4;
					return new d.init(t, n / 2)
				}
			},
			a = r.Latin1 = {
				stringify: function(e) {
					var n = e.words;
					e = e.sigBytes;
					for (var t = [], i = 0; i < e; i++) t.push(String.fromCharCode(n[i >>> 2] >>> 24 - i % 4 * 8 & 255));
					return t.join("")
				},
				parse: function(e) {
					for (var n = e.length, t = [], i = 0; i < n; i++) t[i >>> 2] |= (255 & e.charCodeAt(i)) << 24 - i % 4 * 8;
					return new d.init(t, n)
				}
			},
			u = r.Utf8 = {
				stringify: function(e) {
					try {
						return decodeURIComponent(escape(a.stringify(e)))
					} catch (e) {
						throw Error("Malformed UTF-8 data")
					}
				},
				parse: function(e) {
					return a.parse(unescape(encodeURIComponent(e)))
				}
			},
			c = n.BufferedBlockAlgorithm = i.extend({
				reset: function() {
					this._data = new d.init, this._nDataBytes = 0
				},
				_append: function(e) {
					"string" == typeof e && (e = u.parse(e)), this._data.concat(e), this._nDataBytes += e.sigBytes
				},
				_process: function(e) {
					var n = this._data,
						t = n.words,
						i = n.sigBytes,
						r = this.blockSize,
						s = i / (4 * r);
					if (e = (s = e ? o.ceil(s) : o.max((0 | s) - this._minBufferSize, 0)) * r, i = o.min(4 * e, i), e) {
						for (var a = 0; a < e; a += r) this._doProcessBlock(t, a);
						a = t.splice(0, e), n.sigBytes -= i
					}
					return new d.init(a, i)
				},
				clone: function() {
					var e = i.clone.call(this);
					return e._data = this._data.clone(), e
				},
				_minBufferSize: 0
			});
		n.Hasher = c.extend({
			cfg: i.extend(),
			init: function(e) {
				this.cfg = this.cfg.extend(e), this.reset()
			},
			reset: function() {
				c.reset.call(this), this._doReset()
			},
			update: function(e) {
				return this._append(e), this._process(), this
			},
			finalize: function(e) {
				return e && this._append(e), this._doFinalize()
			},
			blockSize: 16,
			_createHelper: function(t) {
				return function(e, n) {
					return new t.init(n).finalize(e)
				}
			},
			_createHmacHelper: function(t) {
				return function(e, n) {
					return new l.HMAC.init(t, n).finalize(e)
				}
			}
		});
		var l = e.algo = {};
		return e
	}(Math);
	! function(r) {
		function e(e) {
			return 4294967296 * (e - (0 | e)) | 0
		}
		for (var n = CryptoJS, t = (s = n.lib).WordArray, i = s.Hasher, s = n.algo, a = [], f = [], o = 2, d = 0; d < 64;) {
			var u;
			e: {
				u = o;
				for (var c = r.sqrt(u), l = 2; l <= c; l++)
					if (!(u % l)) {
						u = !1;
						break e
					} u = !0
			}
			u && (d < 8 && (a[d] = e(r.pow(o, .5))), f[d] = e(r.pow(o, 1 / 3)), d++), o++
		}
		var m = [];
		s = s.SHA256 = i.extend({
			_doReset: function() {
				this._hash = new t.init(a.slice(0))
			},
			_doProcessBlock: function(e, n) {
				for (var t = this._hash.words, i = t[0], r = t[1], s = t[2], a = t[3], o = t[4], d = t[5], u = t[6], c = t[7], l = 0; l < 64; l++) {
					if (l < 16) m[l] = 0 | e[n + l];
					else {
						var v = m[l - 15],
							g = m[l - 2];
						m[l] = ((v << 25 | v >>> 7) ^ (v << 14 | v >>> 18) ^ v >>> 3) + m[l - 7] + ((g << 15 | g >>> 17) ^ (g << 13 | g >>> 19) ^ g >>> 10) + m[l - 16]
					}
					v = c + ((o << 26 | o >>> 6) ^ (o << 21 | o >>> 11) ^ (o << 7 | o >>> 25)) + (o & d ^ ~o & u) + f[l] + m[l], g = ((i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22)) + (i & r ^ i & s ^ r & s), c = u, u = d, d = o, o = a + v | 0, a = s, s = r, r = i, i = v + g | 0
				}
				t[0] = t[0] + i | 0, t[1] = t[1] + r | 0, t[2] = t[2] + s | 0, t[3] = t[3] + a | 0, t[4] = t[4] + o | 0, t[5] = t[5] + d | 0, t[6] = t[6] + u | 0, t[7] = t[7] + c | 0
			},
			_doFinalize: function() {
				var e = this._data,
					n = e.words,
					t = 8 * this._nDataBytes,
					i = 8 * e.sigBytes;
				return n[i >>> 5] |= 128 << 24 - i % 32, n[14 + (64 + i >>> 9 << 4)] = r.floor(t / 4294967296), n[15 + (64 + i >>> 9 << 4)] = t, e.sigBytes = 4 * n.length, this._process(), this._hash
			},
			clone: function() {
				var e = i.clone.call(this);
				return e._hash = this._hash.clone(), e
			}
		});
		n.SHA256 = i._createHelper(s), n.HmacSHA256 = i._createHmacHelper(s)
	}(Math),
	function() {
		var u = CryptoJS.enc.Utf8;
		CryptoJS.algo.HMAC = CryptoJS.lib.Base.extend({
			init: function(e, n) {
				e = this._hasher = new e.init, "string" == typeof n && (n = u.parse(n));
				var t = e.blockSize,
					i = 4 * t;
				n.sigBytes > i && (n = e.finalize(n)), n.clamp();
				for (var r = this._oKey = n.clone(), s = this._iKey = n.clone(), a = r.words, o = s.words, d = 0; d < t; d++) a[d] ^= 1549556828, o[d] ^= 909522486;
				r.sigBytes = s.sigBytes = i, this.reset()
			},
			reset: function() {
				var e = this._hasher;
				e.reset(), e.update(this._iKey)
			},
			update: function(e) {
				return this._hasher.update(e), this
			},
			finalize: function(e) {
				var n = this._hasher;
				return e = n.finalize(e), n.reset(), n.finalize(this._oKey.clone().concat(e))
			}
		})
	}(),
	function() {
		var d = CryptoJS.lib.WordArray;
		CryptoJS.enc.Base64 = {
			stringify: function(e) {
				var n = e.words,
					t = e.sigBytes,
					i = this._map;
				e.clamp(), e = [];
				for (var r = 0; r < t; r += 3)
					for (var s = (n[r >>> 2] >>> 24 - r % 4 * 8 & 255) << 16 | (n[r + 1 >>> 2] >>> 24 - (r + 1) % 4 * 8 & 255) << 8 | n[r + 2 >>> 2] >>> 24 - (r + 2) % 4 * 8 & 255, a = 0; a < 4 && r + .75 * a < t; a++) e.push(i.charAt(s >>> 6 * (3 - a) & 63));
				if (n = i.charAt(64))
					for (; e.length % 4;) e.push(n);
				return e.join("")
			},
			parse: function(e) {
				var n = e.length,
					t = this._map;
				!(i = t.charAt(64)) || -1 != (i = e.indexOf(i)) && (n = i);
				for (var i = [], r = 0, s = 0; s < n; s++)
					if (s % 4) {
						var a = t.indexOf(e.charAt(s - 1)) << s % 4 * 2,
							o = t.indexOf(e.charAt(s)) >>> 6 - s % 4 * 2;
						i[r >>> 2] |= (a | o) << 24 - r % 4 * 8, r++
					} return d.create(i, r)
			},
			_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
		}
	}(),
	function(e) {
		var n, t, i, r, s, a, o, d, u, c, l, v, g;
		(n = e.EGAErrorSeverity || (e.EGAErrorSeverity = {}))[n.Undefined = 0] = "Undefined", n[n.Debug = 1] = "Debug", n[n.Info = 2] = "Info", n[n.Warning = 3] = "Warning", n[n.Error = 4] = "Error", n[n.Critical = 5] = "Critical", (t = e.EGAProgressionStatus || (e.EGAProgressionStatus = {}))[t.Undefined = 0] = "Undefined", t[t.Start = 1] = "Start", t[t.Complete = 2] = "Complete", t[t.Fail = 3] = "Fail", (i = e.EGAResourceFlowType || (e.EGAResourceFlowType = {}))[i.Undefined = 0] = "Undefined", i[i.Source = 1] = "Source", i[i.Sink = 2] = "Sink", (r = e.EGAAdAction || (e.EGAAdAction = {}))[r.Undefined = 0] = "Undefined", r[r.Clicked = 1] = "Clicked", r[r.Show = 2] = "Show", r[r.FailedShow = 3] = "FailedShow", r[r.RewardReceived = 4] = "RewardReceived", (s = e.EGAAdError || (e.EGAAdError = {}))[s.Undefined = 0] = "Undefined", s[s.Unknown = 1] = "Unknown", s[s.Offline = 2] = "Offline", s[s.NoFill = 3] = "NoFill", s[s.InternalError = 4] = "InternalError", s[s.InvalidRequest = 5] = "InvalidRequest", s[s.UnableToPrecache = 6] = "UnableToPrecache", (a = e.EGAAdType || (e.EGAAdType = {}))[a.Undefined = 0] = "Undefined", a[a.Video = 1] = "Video", a[a.RewardedVideo = 2] = "RewardedVideo", a[a.Playable = 3] = "Playable", a[a.Interstitial = 4] = "Interstitial", a[a.OfferWall = 5] = "OfferWall", a[a.Banner = 6] = "Banner", o = e.http || (e.http = {}), (d = o.EGAHTTPApiResponse || (o.EGAHTTPApiResponse = {}))[d.NoResponse = 0] = "NoResponse", d[d.BadResponse = 1] = "BadResponse", d[d.RequestTimeout = 2] = "RequestTimeout", d[d.JsonEncodeFailed = 3] = "JsonEncodeFailed", d[d.JsonDecodeFailed = 4] = "JsonDecodeFailed", d[d.InternalServerError = 5] = "InternalServerError", d[d.BadRequest = 6] = "BadRequest", d[d.Unauthorized = 7] = "Unauthorized", d[d.UnknownResponseCode = 8] = "UnknownResponseCode", d[d.Ok = 9] = "Ok", d[d.Created = 10] = "Created", u = e.events || (e.events = {}), (c = u.EGASdkErrorCategory || (u.EGASdkErrorCategory = {}))[c.Undefined = 0] = "Undefined", c[c.EventValidation = 1] = "EventValidation", c[c.Database = 2] = "Database", c[c.Init = 3] = "Init", c[c.Http = 4] = "Http", c[c.Json = 5] = "Json", (l = u.EGASdkErrorArea || (u.EGASdkErrorArea = {}))[l.Undefined = 0] = "Undefined", l[l.BusinessEvent = 1] = "BusinessEvent", l[l.ResourceEvent = 2] = "ResourceEvent", l[l.ProgressionEvent = 3] = "ProgressionEvent", l[l.DesignEvent = 4] = "DesignEvent", l[l.ErrorEvent = 5] = "ErrorEvent", l[l.InitHttp = 9] = "InitHttp", l[l.EventsHttp = 10] = "EventsHttp", l[l.ProcessEvents = 11] = "ProcessEvents", l[l.AddEventsToStore = 12] = "AddEventsToStore", l[l.AdEvent = 20] = "AdEvent", (v = u.EGASdkErrorAction || (u.EGASdkErrorAction = {}))[v.Undefined = 0] = "Undefined", v[v.InvalidCurrency = 1] = "InvalidCurrency", v[v.InvalidShortString = 2] = "InvalidShortString", v[v.InvalidEventPartLength = 3] = "InvalidEventPartLength", v[v.InvalidEventPartCharacters = 4] = "InvalidEventPartCharacters", v[v.InvalidStore = 5] = "InvalidStore", v[v.InvalidFlowType = 6] = "InvalidFlowType", v[v.StringEmptyOrNull = 7] = "StringEmptyOrNull", v[v.NotFoundInAvailableCurrencies = 8] = "NotFoundInAvailableCurrencies", v[v.InvalidAmount = 9] = "InvalidAmount", v[v.NotFoundInAvailableItemTypes = 10] = "NotFoundInAvailableItemTypes", v[v.WrongProgressionOrder = 11] = "WrongProgressionOrder", v[v.InvalidEventIdLength = 12] = "InvalidEventIdLength", v[v.InvalidEventIdCharacters = 13] = "InvalidEventIdCharacters", v[v.InvalidProgressionStatus = 15] = "InvalidProgressionStatus", v[v.InvalidSeverity = 16] = "InvalidSeverity", v[v.InvalidLongString = 17] = "InvalidLongString", v[v.DatabaseTooLarge = 18] = "DatabaseTooLarge", v[v.DatabaseOpenOrCreate = 19] = "DatabaseOpenOrCreate", v[v.JsonError = 25] = "JsonError", v[v.FailHttpJsonDecode = 29] = "FailHttpJsonDecode", v[v.FailHttpJsonEncode = 30] = "FailHttpJsonEncode", v[v.InvalidAdAction = 31] = "InvalidAdAction", v[v.InvalidAdType = 32] = "InvalidAdType", v[v.InvalidString = 33] = "InvalidString", (g = u.EGASdkErrorParameter || (u.EGASdkErrorParameter = {}))[g.Undefined = 0] = "Undefined", g[g.Currency = 1] = "Currency", g[g.CartType = 2] = "CartType", g[g.ItemType = 3] = "ItemType", g[g.ItemId = 4] = "ItemId", g[g.Store = 5] = "Store", g[g.FlowType = 6] = "FlowType", g[g.Amount = 7] = "Amount", g[g.Progression01 = 8] = "Progression01", g[g.Progression02 = 9] = "Progression02", g[g.Progression03 = 10] = "Progression03", g[g.EventId = 11] = "EventId", g[g.ProgressionStatus = 12] = "ProgressionStatus", g[g.Severity = 13] = "Severity", g[g.Message = 14] = "Message", g[g.AdAction = 15] = "AdAction", g[g.AdType = 16] = "AdType", g[g.AdSdkName = 17] = "AdSdkName", g[g.AdPlacement = 18] = "AdPlacement"
	}(gameanalytics = gameanalytics || {});
	var gameanalytics, EGAErrorSeverity = gameanalytics.EGAErrorSeverity,
		EGAProgressionStatus = gameanalytics.EGAProgressionStatus,
		EGAResourceFlowType = gameanalytics.EGAResourceFlowType;
	! function(e) {
		! function(e) {
			var t, n;
			(n = t = t || {})[n.Error = 0] = "Error", n[n.Warning = 1] = "Warning", n[n.Info = 2] = "Info", n[n.Debug = 3] = "Debug";
			var i = (r.setInfoLog = function(e) {
				r.instance.infoLogEnabled = e
			}, r.setVerboseLog = function(e) {
				r.instance.infoLogVerboseEnabled = e
			}, r.i = function(e) {
				if (r.instance.infoLogEnabled) {
					var n = "Info/" + r.Tag + ": " + e;
					r.instance.sendNotificationMessage(n, t.Info)
				}
			}, r.w = function(e) {
				var n = "Warning/" + r.Tag + ": " + e;
				r.instance.sendNotificationMessage(n, t.Warning)
			}, r.e = function(e) {
				var n = "Error/" + r.Tag + ": " + e;
				r.instance.sendNotificationMessage(n, t.Error)
			}, r.ii = function(e) {
				if (r.instance.infoLogVerboseEnabled) {
					var n = "Verbose/" + r.Tag + ": " + e;
					r.instance.sendNotificationMessage(n, t.Info)
				}
			}, r.d = function(e) {
				if (r.debugEnabled) {
					var n = "Debug/" + r.Tag + ": " + e;
					r.instance.sendNotificationMessage(n, t.Debug)
				}
			}, r.prototype.sendNotificationMessage = function(e, n) {
				switch (n) {
					case t.Error:
						console.error(e);
						break;
					case t.Warning:
						console.warn(e);
						break;
					case t.Debug:
						"function" == typeof console.debug ? console.debug(e) : console.log(e);
						break;
					case t.Info:
						console.log(e)
				}
			}, r.instance = new r, r.Tag = "GameAnalytics", r);

			function r() {
				r.debugEnabled = !1
			}
			e.GALogger = i
		}(e.logging || (e.logging = {}))
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var n, u, t;

		function c() {}
		n = e.utilities || (e.utilities = {}), u = e.logging.GALogger, c.getHmac = function(e, n) {
			var t = CryptoJS.HmacSHA256(n, e);
			return CryptoJS.enc.Base64.stringify(t)
		}, c.stringMatch = function(e, n) {
			return !(!e || !n) && n.test(e)
		}, c.joinStringArray = function(e, n) {
			for (var t = "", i = 0, r = e.length; i < r; i++) 0 < i && (t += n), t += e[i];
			return t
		}, c.stringArrayContainsString = function(e, n) {
			if (0 === e.length) return !1;
			for (var t in e)
				if (e[t] === n) return !0;
			return !1
		}, c.encode64 = function(e) {
			e = encodeURI(e);
			for (var n, t, i, r, s, a = "", o = 0, d = 0, u = 0; i = (n = e.charCodeAt(u++)) >> 2, r = (3 & n) << 4 | (t = e.charCodeAt(u++)) >> 4, s = (15 & t) << 2 | (o = e.charCodeAt(u++)) >> 6, d = 63 & o, isNaN(t) ? s = d = 64 : isNaN(o) && (d = 64), a = a + c.keyStr.charAt(i) + c.keyStr.charAt(r) + c.keyStr.charAt(s) + c.keyStr.charAt(d), n = t = o = 0, i = r = s = d = 0, u < e.length;);
			return a
		}, c.decode64 = function(e) {
			var n, t, i, r, s = "",
				a = 0,
				o = 0,
				d = 0;
			for (/[^A-Za-z0-9\+\/\=]/g.exec(e) && u.w("There were invalid base64 characters in the input text. Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='. Expect errors in decoding."), e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); n = c.keyStr.indexOf(e.charAt(d++)) << 2 | (i = c.keyStr.indexOf(e.charAt(d++))) >> 4, t = (15 & i) << 4 | (r = c.keyStr.indexOf(e.charAt(d++))) >> 2, a = (3 & r) << 6 | (o = c.keyStr.indexOf(e.charAt(d++))), s += String.fromCharCode(n), 64 != r && (s += String.fromCharCode(t)), 64 != o && (s += String.fromCharCode(a)), n = t = a = 0, i = r = o = 0, d < e.length;);
			return decodeURI(s)
		}, c.timeIntervalSince1970 = function() {
			var e = new Date;
			return Math.round(e.getTime() / 1e3)
		}, c.createGuid = function() {
			return (c.s4() + c.s4() + "-" + c.s4() + "-4" + c.s4().substr(0, 3) + "-" + c.s4() + "-" + c.s4() + c.s4() + c.s4()).toLowerCase()
		}, c.s4 = function() {
			return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
		}, c.keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", t = c, n.GAUtilities = t
	}(gameanalytics = gameanalytics || {}),
	function(m) {
		! function(e) {
			var d = m.logging.GALogger,
				o = m.utilities.GAUtilities,
				u = m.events.EGASdkErrorCategory,
				c = m.events.EGASdkErrorArea,
				l = m.events.EGASdkErrorAction,
				v = m.events.EGASdkErrorParameter,
				g = function(e, n, t, i, r) {
					this.category = e, this.area = n, this.action = t, this.parameter = i, this.reason = r
				};
			e.ValidationResult = g;
			var n = (f.validateBusinessEvent = function(e, n, t, i, r) {
				return f.validateCurrency(e) ? n < 0 ? (d.w("Validation fail - business event - amount. Cannot be less than 0. Failed amount: " + n), new g(u.EventValidation, c.BusinessEvent, l.InvalidAmount, v.Amount, n + "")) : f.validateShortString(t, !0) ? f.validateEventPartLength(i, !1) ? f.validateEventPartCharacters(i) ? f.validateEventPartLength(r, !1) ? f.validateEventPartCharacters(r) ? null : (d.w("Validation fail - business event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + r), new g(u.EventValidation, c.BusinessEvent, l.InvalidEventPartCharacters, v.ItemId, r)) : (d.w("Validation fail - business event - itemId. Cannot be (null), empty or above 64 characters. String: " + r), new g(u.EventValidation, c.BusinessEvent, l.InvalidEventPartLength, v.ItemId, r)) : (d.w("Validation fail - business event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + i), new g(u.EventValidation, c.BusinessEvent, l.InvalidEventPartCharacters, v.ItemType, i)) : (d.w("Validation fail - business event - itemType: Cannot be (null), empty or above 64 characters. String: " + i), new g(u.EventValidation, c.BusinessEvent, l.InvalidEventPartLength, v.ItemType, i)) : (d.w("Validation fail - business event - cartType. Cannot be above 32 length. String: " + t), new g(u.EventValidation, c.BusinessEvent, l.InvalidShortString, v.CartType, t)) : (d.w("Validation fail - business event - currency: Cannot be (null) and need to be A-Z, 3 characters and in the standard at openexchangerates.org. Failed currency: " + e), new g(u.EventValidation, c.BusinessEvent, l.InvalidCurrency, v.Currency, e))
			}, f.validateResourceEvent = function(e, n, t, i, r, s, a) {
				return e == m.EGAResourceFlowType.Undefined ? (d.w("Validation fail - resource event - flowType: Invalid flow type."), new g(u.EventValidation, c.ResourceEvent, l.InvalidFlowType, v.FlowType, "")) : n ? o.stringArrayContainsString(s, n) ? 0 < t ? i ? f.validateEventPartLength(i, !1) ? f.validateEventPartCharacters(i) ? o.stringArrayContainsString(a, i) ? f.validateEventPartLength(r, !1) ? f.validateEventPartCharacters(r) ? null : (d.w("Validation fail - resource event - itemId: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + r), new g(u.EventValidation, c.ResourceEvent, l.InvalidEventPartCharacters, v.ItemId, r)) : (d.w("Validation fail - resource event - itemId: Cannot be (null), empty or above 64 characters. String: " + r), new g(u.EventValidation, c.ResourceEvent, l.InvalidEventPartLength, v.ItemId, r)) : (d.w("Validation fail - resource event - itemType: Not found in list of pre-defined available resource itemTypes. String: " + i), new g(u.EventValidation, c.ResourceEvent, l.NotFoundInAvailableItemTypes, v.ItemType, i)) : (d.w("Validation fail - resource event - itemType: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + i), new g(u.EventValidation, c.ResourceEvent, l.InvalidEventPartCharacters, v.ItemType, i)) : (d.w("Validation fail - resource event - itemType: Cannot be (null), empty or above 64 characters. String: " + i), new g(u.EventValidation, c.ResourceEvent, l.InvalidEventPartLength, v.ItemType, i)) : (d.w("Validation fail - resource event - itemType: Cannot be (null)"), new g(u.EventValidation, c.ResourceEvent, l.StringEmptyOrNull, v.ItemType, "")) : (d.w("Validation fail - resource event - amount: Float amount cannot be 0 or negative. Value: " + t), new g(u.EventValidation, c.ResourceEvent, l.InvalidAmount, v.Amount, t + "")) : (d.w("Validation fail - resource event - currency: Not found in list of pre-defined available resource currencies. String: " + n), new g(u.EventValidation, c.ResourceEvent, l.NotFoundInAvailableCurrencies, v.Currency, n)) : (d.w("Validation fail - resource event - currency: Cannot be (null)"), new g(u.EventValidation, c.ResourceEvent, l.StringEmptyOrNull, v.Currency, ""))
			}, f.validateProgressionEvent = function(e, n, t, i) {
				if (e == m.EGAProgressionStatus.Undefined) return d.w("Validation fail - progression event: Invalid progression status."), new g(u.EventValidation, c.ProgressionEvent, l.InvalidProgressionStatus, v.ProgressionStatus, "");
				if (i && !t && n) return d.w("Validation fail - progression event: 03 found but 01+02 are invalid. Progression must be set as either 01, 01+02 or 01+02+03."), new g(u.EventValidation, c.ProgressionEvent, l.WrongProgressionOrder, v.Undefined, n + ":" + t + ":" + i);
				if (t && !n) return d.w("Validation fail - progression event: 02 found but not 01. Progression must be set as either 01, 01+02 or 01+02+03"), new g(u.EventValidation, c.ProgressionEvent, l.WrongProgressionOrder, v.Undefined, n + ":" + t + ":" + i);
				if (!n) return d.w("Validation fail - progression event: progression01 not valid. Progressions must be set as either 01, 01+02 or 01+02+03"), new g(u.EventValidation, c.ProgressionEvent, l.WrongProgressionOrder, v.Undefined, (n || "") + ":" + (t || "") + ":" + (i || ""));
				if (!f.validateEventPartLength(n, !1)) return d.w("Validation fail - progression event - progression01: Cannot be (null), empty or above 64 characters. String: " + n), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartLength, v.Progression01, n);
				if (!f.validateEventPartCharacters(n)) return d.w("Validation fail - progression event - progression01: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + n), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartCharacters, v.Progression01, n);
				if (t) {
					if (!f.validateEventPartLength(t, !0)) return d.w("Validation fail - progression event - progression02: Cannot be empty or above 64 characters. String: " + t), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartLength, v.Progression02, t);
					if (!f.validateEventPartCharacters(t)) return d.w("Validation fail - progression event - progression02: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + t), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartCharacters, v.Progression02, t)
				}
				if (i) {
					if (!f.validateEventPartLength(i, !0)) return d.w("Validation fail - progression event - progression03: Cannot be empty or above 64 characters. String: " + i), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartLength, v.Progression03, i);
					if (!f.validateEventPartCharacters(i)) return d.w("Validation fail - progression event - progression03: Cannot contain other characters than A-z, 0-9, -_., ()!?. String: " + i), new g(u.EventValidation, c.ProgressionEvent, l.InvalidEventPartCharacters, v.Progression03, i)
				}
				return null
			}, f.validateDesignEvent = function(e) {
				return f.validateEventIdLength(e) ? f.validateEventIdCharacters(e) ? null : (d.w("Validation fail - design event - eventId: Non valid characters. Only allowed A-z, 0-9, -_., ()!?. String: " + e), new g(u.EventValidation, c.DesignEvent, l.InvalidEventIdCharacters, v.EventId, e)) : (d.w("Validation fail - design event - eventId: Cannot be (null) or empty. Only 5 event parts allowed seperated by :. Each part need to be 32 characters or less. String: " + e), new g(u.EventValidation, c.DesignEvent, l.InvalidEventIdLength, v.EventId, e))
			}, f.validateErrorEvent = function(e, n) {
				return e == m.EGAErrorSeverity.Undefined ? (d.w("Validation fail - error event - severity: Severity was unsupported value."), new g(u.EventValidation, c.ErrorEvent, l.InvalidSeverity, v.Severity, "")) : f.validateLongString(n, !0) ? null : (d.w("Validation fail - error event - message: Message cannot be above 8192 characters."), new g(u.EventValidation, c.ErrorEvent, l.InvalidLongString, v.Message, n))
			}, f.validateAdEvent = function(e, n, t, i) {
				return e == m.EGAAdAction.Undefined ? (d.w("Validation fail - error event - severity: Severity was unsupported value."), new g(u.EventValidation, c.AdEvent, l.InvalidAdAction, v.AdAction, "")) : n == m.EGAAdType.Undefined ? (d.w("Validation fail - ad event - adType: Ad type was unsupported value."), new g(u.EventValidation, c.AdEvent, l.InvalidAdType, v.AdType, "")) : f.validateShortString(t, !1) ? f.validateString(i, !1) ? null : (d.w("Validation fail - ad event - message: Ad placement cannot be above 64 characters."), new g(u.EventValidation, c.AdEvent, l.InvalidString, v.AdPlacement, i)) : (d.w("Validation fail - ad event - message: Ad SDK name cannot be above 32 characters."), new g(u.EventValidation, c.AdEvent, l.InvalidShortString, v.AdSdkName, t))
			}, f.validateSdkErrorEvent = function(e, n, t, i, r) {
				return !(!f.validateKeys(e, n) || (t === u.Undefined ? (d.w("Validation fail - sdk error event - type: Category was unsupported value."), 1) : i === c.Undefined ? (d.w("Validation fail - sdk error event - type: Area was unsupported value."), 1) : r === l.Undefined && (d.w("Validation fail - sdk error event - type: Action was unsupported value."), 1)))
			}, f.validateKeys = function(e, n) {
				return !(!o.stringMatch(e, /^[A-z0-9]{32}$/) || !o.stringMatch(n, /^[A-z0-9]{40}$/))
			}, f.validateCurrency = function(e) {
				return !!e && !!o.stringMatch(e, /^[A-Z]{3}$/)
			}, f.validateEventPartLength = function(e, n) {
				return !(!n || e) || !!e && !(64 < e.length)
			}, f.validateEventPartCharacters = function(e) {
				return !!o.stringMatch(e, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}$/)
			}, f.validateEventIdLength = function(e) {
				return !!e && !!o.stringMatch(e, /^[^:]{1,64}(?::[^:]{1,64}){0,4}$/)
			}, f.validateEventIdCharacters = function(e) {
				return !!e && !!o.stringMatch(e, /^[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}(:[A-Za-z0-9\s\-_\.\(\)\!\?]{1,64}){0,4}$/)
			}, f.validateAndCleanInitRequestResponse = function(n, e) {
				if (null == n) return d.w("validateInitRequestResponse failed - no response dictionary."), null;
				var t = {};
				try {
					var i = n.server_ts;
					if (!(0 < i)) return d.w("validateInitRequestResponse failed - invalid value in 'server_ts' field."), null;
					t.server_ts = i
				} catch (e) {
					return d.w("validateInitRequestResponse failed - invalid type in 'server_ts' field. type=" + typeof n.server_ts + ", value=" + n.server_ts + ", " + e), null
				}
				if (e) {
					try {
						var r = n.configs;
						t.configs = r
					} catch (e) {
						return d.w("validateInitRequestResponse failed - invalid type in 'configs' field. type=" + typeof n.configs + ", value=" + n.configs + ", " + e), null
					}
					try {
						var s = n.configs_hash;
						t.configs_hash = s
					} catch (e) {
						return d.w("validateInitRequestResponse failed - invalid type in 'configs_hash' field. type=" + typeof n.configs_hash + ", value=" + n.configs_hash + ", " + e), null
					}
					try {
						var a = n.ab_id;
						t.ab_id = a
					} catch (e) {
						return d.w("validateInitRequestResponse failed - invalid type in 'ab_id' field. type=" + typeof n.ab_id + ", value=" + n.ab_id + ", " + e), null
					}
					try {
						var o = n.ab_variant_id;
						t.ab_variant_id = o
					} catch (e) {
						return d.w("validateInitRequestResponse failed - invalid type in 'ab_variant_id' field. type=" + typeof n.ab_variant_id + ", value=" + n.ab_variant_id + ", " + e), null
					}
				}
				return t
			}, f.validateBuild = function(e) {
				return !!f.validateShortString(e, !1)
			}, f.validateSdkWrapperVersion = function(e) {
				return !!o.stringMatch(e, /^(unity|unreal|gamemaker|cocos2d|construct|defold) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/)
			}, f.validateEngineVersion = function(e) {
				return !(!e || !o.stringMatch(e, /^(unity|unreal|gamemaker|cocos2d|construct|defold) [0-9]{0,5}(\.[0-9]{0,5}){0,2}$/))
			}, f.validateUserId = function(e) {
				return !!f.validateString(e, !1) || (d.w("Validation fail - user id: id cannot be (null), empty or above 64 characters."), !1)
			}, f.validateShortString = function(e, n) {
				return !(!n || e) || !(!e || 32 < e.length)
			}, f.validateString = function(e, n) {
				return !(!n || e) || !(!e || 64 < e.length)
			}, f.validateLongString = function(e, n) {
				return !(!n || e) || !(!e || 8192 < e.length)
			}, f.validateConnectionType = function(e) {
				return o.stringMatch(e, /^(wwan|wifi|lan|offline)$/)
			}, f.validateCustomDimensions = function(e) {
				return f.validateArrayOfStrings(20, 32, !1, "custom dimensions", e)
			}, f.validateResourceCurrencies = function(e) {
				if (!f.validateArrayOfStrings(20, 64, !1, "resource currencies", e)) return !1;
				for (var n = 0; n < e.length; ++n)
					if (!o.stringMatch(e[n], /^[A-Za-z]+$/)) return d.w("resource currencies validation failed: a resource currency can only be A-Z, a-z. String was: " + e[n]), !1;
				return !0
			}, f.validateResourceItemTypes = function(e) {
				if (!f.validateArrayOfStrings(20, 32, !1, "resource item types", e)) return !1;
				for (var n = 0; n < e.length; ++n)
					if (!f.validateEventPartCharacters(e[n])) return d.w("resource item types validation failed: a resource item type cannot contain other characters than A-z, 0-9, -_., ()!?. String was: " + e[n]), !1;
				return !0
			}, f.validateDimension01 = function(e, n) {
				return !e || !!o.stringArrayContainsString(n, e)
			}, f.validateDimension02 = function(e, n) {
				return !e || !!o.stringArrayContainsString(n, e)
			}, f.validateDimension03 = function(e, n) {
				return !e || !!o.stringArrayContainsString(n, e)
			}, f.validateArrayOfStrings = function(e, n, t, i, r) {
				var s = i;
				if (s = s || "Array", !r) return d.w(s + " validation failed: array cannot be null. "), !1;
				if (0 == t && 0 == r.length) return d.w(s + " validation failed: array cannot be empty. "), !1;
				if (0 < e && r.length > e) return d.w(s + " validation failed: array cannot exceed " + e + " values. It has " + r.length + " values."), !1;
				for (var a = 0; a < r.length; ++a) {
					var o = r[a] ? r[a].length : 0;
					if (0 === o) return d.w(s + " validation failed: contained an empty string. Array=" + JSON.stringify(r)), !1;
					if (0 < n && n < o) return d.w(s + " validation failed: a string exceeded max allowed length (which is: " + n + "). String was: " + r[a]), !1
				}
				return !0
			}, f.validateClientTs = function(e) {
				return !(e < -4294967294 || 4294967294 < e)
			}, f);

			function f() {}
			e.GAValidator = n
		}(m.validators || (m.validators = {}))
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		! function(e) {
			var n = function(e, n, t) {
				this.name = e, this.value = n, this.version = t
			};
			e.NameValueVersion = n;
			var c = function(e, n) {
				this.name = e, this.version = n
			};
			e.NameVersion = c;
			var t = (r.touch = function() {}, r.getRelevantSdkVersion = function() {
				return r.sdkGameEngineVersion ? r.sdkGameEngineVersion : r.sdkWrapperVersion
			}, r.getConnectionType = function() {
				return r.connectionType
			}, r.updateConnectionType = function() {
				navigator.onLine ? r.connectionType = "ios" === r.buildPlatform || "android" === r.buildPlatform ? "wwan" : "lan" : r.connectionType = "offline"
			}, r.getOSVersionString = function() {
				return r.buildPlatform + " " + r.osVersionPair.version
			}, r.runtimePlatformToString = function() {
				return r.osVersionPair.name
			}, r.getBrowserVersionString = function() {
				var e, n = navigator.userAgent,
					t = n.match(/(opera|chrome|safari|firefox|ubrowser|msie|trident|fbav(?=\/))\/?\s*(\d+)/i) || [];
				if (0 == t.length && "ios" === r.buildPlatform) return "webkit_" + r.osVersion;
				if (/trident/i.test(t[1])) return "IE " + ((e = /\brv[ :]+(\d+)/g.exec(n) || [])[1] || "");
				if ("Chrome" === t[1] && null != (e = n.match(/\b(OPR|Edge|UBrowser)\/(\d+)/))) return e.slice(1).join(" ").replace("OPR", "Opera").replace("UBrowser", "UC").toLowerCase();
				if (t[1] && "fbav" === t[1].toLowerCase() && (t[1] = "facebook", t[2])) return "facebook " + t[2];
				var i = t[2] ? [t[1], t[2]] : [navigator.appName, navigator.appVersion, "-?"];
				return null != (e = n.match(/version\/(\d+)/i)) && i.splice(1, 1, e[1]), i.join(" ").toLowerCase()
			}, r.getDeviceModel = function() {
				return "unknown"
			}, r.getDeviceManufacturer = function() {
				return "unknown"
			}, r.matchItem = function(e, n) {
				var t, i, r, s, a = new c("unknown", "0.0.0"),
					o = 0,
					d = 0;
				for (o = 0; o < n.length; o += 1)
					if (new RegExp(n[o].value, "i").test(e)) {
						if (t = new RegExp(n[o].version + "[- /:;]([\\d._]+)", "i"), s = "", (i = e.match(t)) && i[1] && (r = i[1]), r) {
							var u = r.split(/[._]+/);
							for (d = 0; d < Math.min(u.length, 3); d += 1) s += u[d] + (d < Math.min(u.length, 3) - 1 ? "." : "")
						} else s = "0.0.0";
						return a.name = n[o].name, a.version = s, a
					} return a
			}, r.sdkWrapperVersion = "javascript 4.1.0", r.osVersionPair = r.matchItem([navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor].join(" "), [new n("windows_phone", "Windows Phone", "OS"), new n("windows", "Win", "NT"), new n("ios", "iPhone", "OS"), new n("ios", "iPad", "OS"), new n("ios", "iPod", "OS"), new n("android", "Android", "Android"), new n("blackBerry", "BlackBerry", "/"), new n("mac_osx", "Mac", "OS X"), new n("tizen", "Tizen", "Tizen"), new n("linux", "Linux", "rv")]), r.buildPlatform = r.runtimePlatformToString(), r.deviceModel = r.getDeviceModel(), r.deviceManufacturer = r.getDeviceManufacturer(), r.osVersion = r.getOSVersionString(), r.browserVersion = r.getBrowserVersionString(), r);

			function r() {}
			e.GADevice = t
		}(e.device || (e.device = {}))
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var n, t;

		function i(e) {
			this.deadline = e, this.ignore = !1, this.async = !1, this.running = !1, this.id = ++i.idCounter
		}
		n = e.threading || (e.threading = {}), i.idCounter = 0, t = i, n.TimedBlock = t
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var n, t;

		function i(e) {
			this.comparer = e, this._subQueues = {}, this._sortedKeys = []
		}
		n = e.threading || (e.threading = {}), i.prototype.enqueue = function(e, n) {
			-1 === this._sortedKeys.indexOf(e) && this.addQueueOfPriority(e), this._subQueues[e].push(n)
		}, i.prototype.addQueueOfPriority = function(e) {
			var t = this;
			this._sortedKeys.push(e), this._sortedKeys.sort(function(e, n) {
				return t.comparer.compare(e, n)
			}), this._subQueues[e] = []
		}, i.prototype.peek = function() {
			if (this.hasItems()) return this._subQueues[this._sortedKeys[0]][0];
			throw new Error("The queue is empty")
		}, i.prototype.hasItems = function() {
			return 0 < this._sortedKeys.length
		}, i.prototype.dequeue = function() {
			if (this.hasItems()) return this.dequeueFromHighPriorityQueue();
			throw new Error("The queue is empty")
		}, i.prototype.dequeueFromHighPriorityQueue = function() {
			var e = this._sortedKeys[0],
				n = this._subQueues[e].shift();
			return 0 === this._subQueues[e].length && (this._sortedKeys.shift(), delete this._subQueues[e]), n
		}, t = i, n.PriorityQueue = t
	}(gameanalytics = gameanalytics || {}),
	function(a) {
		! function(e) {
			var l, n, t, i, r = a.logging.GALogger;
			(n = l = e.EGAStoreArgsOperator || (e.EGAStoreArgsOperator = {}))[n.Equal = 0] = "Equal", n[n.LessOrEqual = 1] = "LessOrEqual", n[n.NotEqual = 2] = "NotEqual", (i = t = e.EGAStore || (e.EGAStore = {}))[i.Events = 0] = "Events", i[i.Sessions = 1] = "Sessions", i[i.Progression = 2] = "Progression";
			var s = (v.isStorageAvailable = function() {
				return v.storageAvailable
			}, v.isStoreTooLargeForEvents = function() {
				return v.instance.eventsStore.length + v.instance.sessionsStore.length > v.MaxNumberOfEntries
			}, v.select = function(e, n, t, i) {
				void 0 === n && (n = []), void 0 === t && (t = !1), void 0 === i && (i = 0);
				var r = v.getStore(e);
				if (!r) return null;
				for (var s = [], a = 0; a < r.length; ++a) {
					for (var o = r[a], d = !0, u = 0; u < n.length; ++u) {
						var c = n[u];
						if (o[c[0]]) switch (c[1]) {
							case l.Equal:
								d = o[c[0]] == c[2];
								break;
							case l.LessOrEqual:
								d = o[c[0]] <= c[2];
								break;
							case l.NotEqual:
								d = o[c[0]] != c[2];
								break;
							default:
								d = !1
						} else d = !1;
						if (!d) break
					}
					d && s.push(o)
				}
				return t && s.sort(function(e, n) {
					return e.client_ts - n.client_ts
				}), 0 < i && s.length > i && (s = s.slice(0, i + 1)), s
			}, v.update = function(e, n, t) {
				void 0 === t && (t = []);
				var i = v.getStore(e);
				if (!i) return !1;
				for (var r = 0; r < i.length; ++r) {
					for (var s = i[r], a = !0, o = 0; o < t.length; ++o) {
						var d = t[o];
						if (s[d[0]]) switch (d[1]) {
							case l.Equal:
								a = s[d[0]] == d[2];
								break;
							case l.LessOrEqual:
								a = s[d[0]] <= d[2];
								break;
							case l.NotEqual:
								a = s[d[0]] != d[2];
								break;
							default:
								a = !1
						} else a = !1;
						if (!a) break
					}
					if (a)
						for (o = 0; o < n.length; ++o) {
							var u = n[o];
							s[u[0]] = u[1]
						}
				}
				return !0
			}, v.delete = function(e, n) {
				var t = v.getStore(e);
				if (t)
					for (var i = 0; i < t.length; ++i) {
						for (var r = t[i], s = !0, a = 0; a < n.length; ++a) {
							var o = n[a];
							if (r[o[0]]) switch (o[1]) {
								case l.Equal:
									s = r[o[0]] == o[2];
									break;
								case l.LessOrEqual:
									s = r[o[0]] <= o[2];
									break;
								case l.NotEqual:
									s = r[o[0]] != o[2];
									break;
								default:
									s = !1
							} else s = !1;
							if (!s) break
						}
						s && (t.splice(i, 1), --i)
					}
			}, v.insert = function(e, n, t, i) {
				void 0 === t && (t = !1), void 0 === i && (i = null);
				var r = v.getStore(e);
				if (r)
					if (t) {
						if (!i) return;
						for (var s = !1, a = 0; a < r.length; ++a) {
							var o = r[a];
							if (o[i] == n[i]) {
								for (var d in n) o[d] = n[d];
								s = !0;
								break
							}
						}
						s || r.push(n)
					} else r.push(n)
			}, v.save = function(e) {
				v.isStorageAvailable() ? (localStorage.setItem(v.StringFormat(v.KeyFormat, e, v.EventsStoreKey), JSON.stringify(v.instance.eventsStore)), localStorage.setItem(v.StringFormat(v.KeyFormat, e, v.SessionsStoreKey), JSON.stringify(v.instance.sessionsStore)), localStorage.setItem(v.StringFormat(v.KeyFormat, e, v.ProgressionStoreKey), JSON.stringify(v.instance.progressionStore)), localStorage.setItem(v.StringFormat(v.KeyFormat, e, v.ItemsStoreKey), JSON.stringify(v.instance.storeItems))) : r.w("Storage is not available, cannot save.")
			}, v.load = function(e) {
				if (v.isStorageAvailable()) {
					try {
						v.instance.eventsStore = JSON.parse(localStorage.getItem(v.StringFormat(v.KeyFormat, e, v.EventsStoreKey))), v.instance.eventsStore || (v.instance.eventsStore = [])
					} catch (e) {
						r.w("Load failed for 'events' store. Using empty store."), v.instance.eventsStore = []
					}
					try {
						v.instance.sessionsStore = JSON.parse(localStorage.getItem(v.StringFormat(v.KeyFormat, e, v.SessionsStoreKey))), v.instance.sessionsStore || (v.instance.sessionsStore = [])
					} catch (e) {
						r.w("Load failed for 'sessions' store. Using empty store."), v.instance.sessionsStore = []
					}
					try {
						v.instance.progressionStore = JSON.parse(localStorage.getItem(v.StringFormat(v.KeyFormat, e, v.ProgressionStoreKey))), v.instance.progressionStore || (v.instance.progressionStore = [])
					} catch (e) {
						r.w("Load failed for 'progression' store. Using empty store."), v.instance.progressionStore = []
					}
					try {
						v.instance.storeItems = JSON.parse(localStorage.getItem(v.StringFormat(v.KeyFormat, e, v.ItemsStoreKey))), v.instance.storeItems || (v.instance.storeItems = {})
					} catch (e) {
						r.w("Load failed for 'items' store. Using empty store."), v.instance.progressionStore = []
					}
				} else r.w("Storage is not available, cannot load.")
			}, v.setItem = function(e, n, t) {
				var i = v.StringFormat(v.KeyFormat, e, n);
				t ? v.instance.storeItems[i] = t : i in v.instance.storeItems && delete v.instance.storeItems[i]
			}, v.getItem = function(e, n) {
				var t = v.StringFormat(v.KeyFormat, e, n);
				return t in v.instance.storeItems ? v.instance.storeItems[t] : null
			}, v.getStore = function(e) {
				switch (e) {
					case t.Events:
						return v.instance.eventsStore;
					case t.Sessions:
						return v.instance.sessionsStore;
					case t.Progression:
						return v.instance.progressionStore;
					default:
						return r.w("GAStore.getStore(): Cannot find store: " + e), null
				}
			}, v.instance = new v, v.MaxNumberOfEntries = 2e3, v.StringFormat = function(e) {
				for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
				return e.replace(/{(\d+)}/g, function(e, n) {
					return t[n] || ""
				})
			}, v.KeyFormat = "GA::{0}::{1}", v.EventsStoreKey = "ga_event", v.SessionsStoreKey = "ga_session", v.ProgressionStoreKey = "ga_progression", v.ItemsStoreKey = "ga_items", v);

			function v() {
				this.eventsStore = [], this.sessionsStore = [], this.progressionStore = [], this.storeItems = {};
				try {
					"object" == typeof localStorage ? (localStorage.setItem("testingLocalStorage", "yes"), localStorage.removeItem("testingLocalStorage"), v.storageAvailable = !0) : v.storageAvailable = !1
				} catch (e) {}
			}
			e.GAStore = s
		}(a.store || (a.store = {}))
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var n, r, d, u, o, s, c, t, i;

		function l() {
			this.availableCustomDimensions01 = [], this.availableCustomDimensions02 = [], this.availableCustomDimensions03 = [], this.availableResourceCurrencies = [], this.availableResourceItemTypes = [], this.configurations = {}, this.remoteConfigsListeners = [], this.sdkConfigDefault = {}, this.sdkConfig = {}, this.progressionTries = {}, this._isEventSubmissionEnabled = !0
		}
		n = e.state || (e.state = {}), r = e.validators.GAValidator, d = e.utilities.GAUtilities, u = e.logging.GALogger, o = e.store.GAStore, s = e.device.GADevice, c = e.store.EGAStore, t = e.store.EGAStoreArgsOperator, l.setUserId = function(e) {
			l.instance.userId = e, l.cacheIdentifier()
		}, l.getIdentifier = function() {
			return l.instance.identifier
		}, l.isInitialized = function() {
			return l.instance.initialized
		}, l.setInitialized = function(e) {
			l.instance.initialized = e
		}, l.getSessionStart = function() {
			return l.instance.sessionStart
		}, l.getSessionNum = function() {
			return l.instance.sessionNum
		}, l.getTransactionNum = function() {
			return l.instance.transactionNum
		}, l.getSessionId = function() {
			return l.instance.sessionId
		}, l.getCurrentCustomDimension01 = function() {
			return l.instance.currentCustomDimension01
		}, l.getCurrentCustomDimension02 = function() {
			return l.instance.currentCustomDimension02
		}, l.getCurrentCustomDimension03 = function() {
			return l.instance.currentCustomDimension03
		}, l.getGameKey = function() {
			return l.instance.gameKey
		}, l.getGameSecret = function() {
			return l.instance.gameSecret
		}, l.getAvailableCustomDimensions01 = function() {
			return l.instance.availableCustomDimensions01
		}, l.setAvailableCustomDimensions01 = function(e) {
			r.validateCustomDimensions(e) && (l.instance.availableCustomDimensions01 = e, l.validateAndFixCurrentDimensions(), u.i("Set available custom01 dimension values: (" + d.joinStringArray(e, ", ") + ")"))
		}, l.getAvailableCustomDimensions02 = function() {
			return l.instance.availableCustomDimensions02
		}, l.setAvailableCustomDimensions02 = function(e) {
			r.validateCustomDimensions(e) && (l.instance.availableCustomDimensions02 = e, l.validateAndFixCurrentDimensions(), u.i("Set available custom02 dimension values: (" + d.joinStringArray(e, ", ") + ")"))
		}, l.getAvailableCustomDimensions03 = function() {
			return l.instance.availableCustomDimensions03
		}, l.setAvailableCustomDimensions03 = function(e) {
			r.validateCustomDimensions(e) && (l.instance.availableCustomDimensions03 = e, l.validateAndFixCurrentDimensions(), u.i("Set available custom03 dimension values: (" + d.joinStringArray(e, ", ") + ")"))
		}, l.getAvailableResourceCurrencies = function() {
			return l.instance.availableResourceCurrencies
		}, l.setAvailableResourceCurrencies = function(e) {
			r.validateResourceCurrencies(e) && (l.instance.availableResourceCurrencies = e, u.i("Set available resource currencies: (" + d.joinStringArray(e, ", ") + ")"))
		}, l.getAvailableResourceItemTypes = function() {
			return l.instance.availableResourceItemTypes
		}, l.setAvailableResourceItemTypes = function(e) {
			r.validateResourceItemTypes(e) && (l.instance.availableResourceItemTypes = e, u.i("Set available resource item types: (" + d.joinStringArray(e, ", ") + ")"))
		}, l.getBuild = function() {
			return l.instance.build
		}, l.setBuild = function(e) {
			l.instance.build = e, u.i("Set build version: " + e)
		}, l.getUseManualSessionHandling = function() {
			return l.instance.useManualSessionHandling
		}, l.isEventSubmissionEnabled = function() {
			return l.instance._isEventSubmissionEnabled
		}, l.getABTestingId = function() {
			return l.instance.abId
		}, l.getABTestingVariantId = function() {
			return l.instance.abVariantId
		}, l.prototype.setDefaultId = function(e) {
			this.defaultUserId = e || "", l.cacheIdentifier()
		}, l.getDefaultId = function() {
			return l.instance.defaultUserId
		}, l.getSdkConfig = function() {
			var e, n = 0;
			for (var t in l.instance.sdkConfig) 0 === n && (e = t), ++n;
			if (e && 0 < n) return l.instance.sdkConfig;
			for (var t in n = 0, l.instance.sdkConfigCached) 0 === n && (e = t), ++n;
			return e && 0 < n ? l.instance.sdkConfigCached : l.instance.sdkConfigDefault
		}, l.isEnabled = function() {
			return !!l.instance.initAuthorized
		}, l.setCustomDimension01 = function(e) {
			l.instance.currentCustomDimension01 = e, o.setItem(l.getGameKey(), l.Dimension01Key, e), u.i("Set custom01 dimension value: " + e)
		}, l.setCustomDimension02 = function(e) {
			l.instance.currentCustomDimension02 = e, o.setItem(l.getGameKey(), l.Dimension02Key, e), u.i("Set custom02 dimension value: " + e)
		}, l.setCustomDimension03 = function(e) {
			l.instance.currentCustomDimension03 = e, o.setItem(l.getGameKey(), l.Dimension03Key, e), u.i("Set custom03 dimension value: " + e)
		}, l.incrementSessionNum = function() {
			var e = l.getSessionNum() + 1;
			l.instance.sessionNum = e
		}, l.incrementTransactionNum = function() {
			var e = l.getTransactionNum() + 1;
			l.instance.transactionNum = e
		}, l.incrementProgressionTries = function(e) {
			var n = l.getProgressionTries(e) + 1;
			l.instance.progressionTries[e] = n;
			var t = {};
			t.progression = e, t.tries = n, o.insert(c.Progression, t, !0, "progression")
		}, l.getProgressionTries = function(e) {
			return e in l.instance.progressionTries ? l.instance.progressionTries[e] : 0
		}, l.clearProgressionTries = function(e) {
			e in l.instance.progressionTries && delete l.instance.progressionTries[e];
			var n = [];
			n.push(["progression", t.Equal, e]), o.delete(c.Progression, n)
		}, l.setKeys = function(e, n) {
			l.instance.gameKey = e, l.instance.gameSecret = n
		}, l.setManualSessionHandling = function(e) {
			l.instance.useManualSessionHandling = e, u.i("Use manual session handling: " + e)
		}, l.setEnabledEventSubmission = function(e) {
			l.instance._isEventSubmissionEnabled = e
		}, l.getEventAnnotations = function() {
			var e = {
				v: 2
			};
			e.user_id = l.instance.identifier, e.client_ts = l.getClientTsAdjusted(), e.sdk_version = s.getRelevantSdkVersion(), e.os_version = s.osVersion, e.manufacturer = s.deviceManufacturer, e.device = s.deviceModel, e.browser_version = s.browserVersion, e.platform = s.buildPlatform, e.session_id = l.instance.sessionId, e[l.SessionNumKey] = l.instance.sessionNum;
			var n = s.getConnectionType();
			if (r.validateConnectionType(n) && (e.connection_type = n), s.gameEngineVersion && (e.engine_version = s.gameEngineVersion), l.instance.configurations) {
				var t = 0;
				for (var i in l.instance.configurations) {
					t++;
					break
				}
				0 < t && (e.configurations = l.instance.configurations)
			}
			return l.instance.abId && (e.ab_id = l.instance.abId), l.instance.abVariantId && (e.ab_variant_id = l.instance.abVariantId), l.instance.build && (e.build = l.instance.build), e
		}, l.getSdkErrorEventAnnotations = function() {
			var e = {
				v: 2
			};
			e.category = l.CategorySdkError, e.sdk_version = s.getRelevantSdkVersion(), e.os_version = s.osVersion, e.manufacturer = s.deviceManufacturer, e.device = s.deviceModel, e.platform = s.buildPlatform;
			var n = s.getConnectionType();
			return r.validateConnectionType(n) && (e.connection_type = n), s.gameEngineVersion && (e.engine_version = s.gameEngineVersion), e
		}, l.getInitAnnotations = function() {
			var e = {};
			return l.getIdentifier() || l.cacheIdentifier(), e.user_id = l.getIdentifier(), e.sdk_version = s.getRelevantSdkVersion(), e.os_version = s.osVersion, e.platform = s.buildPlatform, l.getBuild() ? e.build = l.getBuild() : e.build = null, e.session_num = l.getSessionNum(), e.random_salt = l.getSessionNum(), e
		}, l.getClientTsAdjusted = function() {
			var e = d.timeIntervalSince1970(),
				n = e + l.instance.clientServerTimeOffset;
			return r.validateClientTs(n) ? n : e
		}, l.sessionIsStarted = function() {
			return 0 != l.instance.sessionStart
		}, l.cacheIdentifier = function() {
			l.instance.userId ? l.instance.identifier = l.instance.userId : l.instance.defaultUserId && (l.instance.identifier = l.instance.defaultUserId)
		}, l.ensurePersistedStates = function() {
			o.isStorageAvailable() && o.load(l.getGameKey());
			var e = l.instance;
			e.setDefaultId(null != o.getItem(l.getGameKey(), l.DefaultUserIdKey) ? o.getItem(l.getGameKey(), l.DefaultUserIdKey) : d.createGuid()), e.sessionNum = null != o.getItem(l.getGameKey(), l.SessionNumKey) ? Number(o.getItem(l.getGameKey(), l.SessionNumKey)) : 0, e.transactionNum = null != o.getItem(l.getGameKey(), l.TransactionNumKey) ? Number(o.getItem(l.getGameKey(), l.TransactionNumKey)) : 0, e.currentCustomDimension01 ? o.setItem(l.getGameKey(), l.Dimension01Key, e.currentCustomDimension01) : (e.currentCustomDimension01 = null != o.getItem(l.getGameKey(), l.Dimension01Key) ? o.getItem(l.getGameKey(), l.Dimension01Key) : "", e.currentCustomDimension01), e.currentCustomDimension02 ? o.setItem(l.getGameKey(), l.Dimension02Key, e.currentCustomDimension02) : (e.currentCustomDimension02 = null != o.getItem(l.getGameKey(), l.Dimension02Key) ? o.getItem(l.getGameKey(), l.Dimension02Key) : "", e.currentCustomDimension02), e.currentCustomDimension03 ? o.setItem(l.getGameKey(), l.Dimension03Key, e.currentCustomDimension03) : (e.currentCustomDimension03 = null != o.getItem(l.getGameKey(), l.Dimension03Key) ? o.getItem(l.getGameKey(), l.Dimension03Key) : "", e.currentCustomDimension03);
			var n = null != o.getItem(l.getGameKey(), l.SdkConfigCachedKey) ? o.getItem(l.getGameKey(), l.SdkConfigCachedKey) : "";
			if (n) {
				var t = JSON.parse(d.decode64(n));
				t && (e.sdkConfigCached = t)
			}
			var i = l.getSdkConfig();
			e.configsHash = i.configs_hash ? i.configs_hash : "", e.abId = i.ab_id ? i.ab_id : "", e.abVariantId = i.ab_variant_id ? i.ab_variant_id : "";
			var r = o.select(c.Progression);
			if (r)
				for (var s = 0; s < r.length; ++s) {
					var a = r[s];
					a && (e.progressionTries[a.progression] = a.tries)
				}
		}, l.calculateServerTimeOffset = function(e) {
			return e - d.timeIntervalSince1970()
		}, l.validateAndCleanCustomFields = function(e) {
			var n = {};
			if (e) {
				var t = 0;
				for (var i in e) {
					var r = e[i];
					if (i && r)
						if (t < l.MAX_CUSTOM_FIELDS_COUNT) {
							var s = new RegExp("^[a-zA-Z0-9_]{1," + l.MAX_CUSTOM_FIELDS_KEY_LENGTH + "}$");
							if (d.stringMatch(i, s)) {
								var a = typeof r;
								if ("string" == a || r instanceof String) r.length <= l.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH && 0 < r.length ? (n[i] = r, ++t) : u.w("validateAndCleanCustomFields: entry with key=" + i + ", value=" + r + " has been omitted because its value is an empty string or exceeds the max number of characters (" + l.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH + ")");
								else if ("number" == a || r instanceof Number) {
									var o = r;
									n[i] = o, ++t
								} else u.w("validateAndCleanCustomFields: entry with key=" + i + ", value=" + r + " has been omitted because its value is not a string or number")
							} else u.w("validateAndCleanCustomFields: entry with key=" + i + ", value=" + r + " has been omitted because its key contains illegal character, is empty or exceeds the max number of characters (" + l.MAX_CUSTOM_FIELDS_KEY_LENGTH + ")")
						} else u.w("validateAndCleanCustomFields: entry with key=" + i + ", value=" + r + " has been omitted because it exceeds the max number of custom fields (" + l.MAX_CUSTOM_FIELDS_COUNT + ")");
					else u.w("validateAndCleanCustomFields: entry with key=" + i + ", value=" + r + " has been omitted because its key or value is null")
				}
			}
			return n
		}, l.validateAndFixCurrentDimensions = function() {
			r.validateDimension01(l.getCurrentCustomDimension01(), l.getAvailableCustomDimensions01()) || l.setCustomDimension01(""), r.validateDimension02(l.getCurrentCustomDimension02(), l.getAvailableCustomDimensions02()) || l.setCustomDimension02(""), r.validateDimension03(l.getCurrentCustomDimension03(), l.getAvailableCustomDimensions03()) || l.setCustomDimension03("")
		}, l.getConfigurationStringValue = function(e, n) {
			return l.instance.configurations[e] ? l.instance.configurations[e].toString() : n
		}, l.isRemoteConfigsReady = function() {
			return l.instance.remoteConfigsIsReady
		}, l.addRemoteConfigsListener = function(e) {
			l.instance.remoteConfigsListeners.indexOf(e) < 0 && l.instance.remoteConfigsListeners.push(e)
		}, l.removeRemoteConfigsListener = function(e) {
			var n = l.instance.remoteConfigsListeners.indexOf(e); - 1 < n && l.instance.remoteConfigsListeners.splice(n, 1)
		}, l.getRemoteConfigsContentAsString = function() {
			return JSON.stringify(l.instance.configurations)
		}, l.populateConfigurations = function(e) {
			var n = e.configs;
			if (n) {
				l.instance.configurations = {};
				for (var t = 0; t < n.length; ++t) {
					var i = n[t];
					if (i) {
						var r = i.key,
							s = i.value,
							a = i.start_ts ? i.start_ts : Number.MIN_VALUE,
							o = i.end_ts ? i.end_ts : Number.MAX_VALUE,
							d = l.getClientTsAdjusted();
						r && s && a < d && d < o && (l.instance.configurations[r] = s)
					}
				}
			}
			l.instance.remoteConfigsIsReady = !0;
			var u = l.instance.remoteConfigsListeners;
			for (t = 0; t < u.length; ++t) u[t] && u[t].onRemoteConfigsUpdated()
		}, l.CategorySdkError = "sdk_error", l.MAX_CUSTOM_FIELDS_COUNT = 50, l.MAX_CUSTOM_FIELDS_KEY_LENGTH = 64, l.MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH = 256, l.instance = new l, l.DefaultUserIdKey = "default_user_id", l.SessionNumKey = "session_num", l.TransactionNumKey = "transaction_num", l.Dimension01Key = "dimension01", l.Dimension02Key = "dimension02", l.Dimension03Key = "dimension03", l.SdkConfigCachedKey = "sdk_config_cached", i = l, n.GAState = i
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var n, o, d, t;

		function u() {}
		n = e.tasks || (e.tasks = {}), o = e.utilities.GAUtilities, d = e.logging.GALogger, u.execute = function(e, n, t, i) {
			var r = new Date;
			if (u.timestampMap[n] || (u.timestampMap[n] = r), u.countMap[n] || (u.countMap[n] = 0), 3600 <= (r.getTime() - u.timestampMap[n].getTime()) / 1e3 && (u.timestampMap[n] = r, u.countMap[n] = 0), !(u.countMap[n] >= u.MaxCount)) {
				var s = o.getHmac(i, t),
					a = new XMLHttpRequest;
				a.onreadystatechange = function() {
					if (4 === a.readyState) {
						if (!a.responseText) return;
						if (200 != a.status) return void d.w("sdk error failed. response code not 200. status code: " + a.status + ", description: " + a.statusText + ", body: " + a.responseText);
						u.countMap[n] = u.countMap[n] + 1
					}
				}, a.open("POST", e, !0), a.setRequestHeader("Content-Type", "application/json"), a.setRequestHeader("Authorization", s);
				try {
					a.send(t)
				} catch (e) {
					console.error(e)
				}
			}
		}, u.MaxCount = 10, u.countMap = {}, u.timestampMap = {}, t = u, n.SdkErrorTask = t
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var c, p, S, l, A, h, v, g, f, m, n;

		function y() {
			this.protocol = "https", this.hostName = "api.gameanalytics.com", this.version = "v2", this.remoteConfigsVersion = "v1", this.baseUrl = this.protocol + "://" + this.hostName + "/" + this.version, this.remoteConfigsBaseUrl = this.protocol + "://" + this.hostName + "/remote_configs/" + this.remoteConfigsVersion, this.initializeUrlPath = "init", this.eventsUrlPath = "events", this.useGzip = !1
		}
		c = e.http || (e.http = {}), p = e.state.GAState, S = e.logging.GALogger, l = e.utilities.GAUtilities, A = e.validators.GAValidator, h = e.tasks.SdkErrorTask, v = e.events.EGASdkErrorCategory, g = e.events.EGASdkErrorArea, f = e.events.EGASdkErrorAction, m = e.events.EGASdkErrorParameter, y.prototype.requestInit = function(e, n) {
			var t = p.getGameKey(),
				i = this.remoteConfigsBaseUrl + "/" + this.initializeUrlPath + "?game_key=" + t + "&interval_seconds=0&configs_hash=" + e,
				r = p.getInitAnnotations(),
				s = JSON.stringify(r);
			if (s) {
				var a = this.createPayloadData(s, this.useGzip),
					o = [];
				o.push(s), y.sendRequest(i, a, o, this.useGzip, y.initRequestCallback, n)
			} else n(c.EGAHTTPApiResponse.JsonEncodeFailed, null)
		}, y.prototype.sendEventsInArray = function(e, n, t) {
			if (0 != e.length) {
				var i = p.getGameKey(),
					r = this.baseUrl + "/" + i + "/" + this.eventsUrlPath,
					s = JSON.stringify(e);
				if (s) {
					var a = this.createPayloadData(s, this.useGzip),
						o = [];
					o.push(s), o.push(n), o.push(e.length.toString()), y.sendRequest(r, a, o, this.useGzip, y.sendEventInArrayRequestCallback, t)
				} else t(c.EGAHTTPApiResponse.JsonEncodeFailed, null, n, e.length)
			}
		}, y.prototype.sendSdkErrorEvent = function(e, n, t, i, r, s, a) {
			if (p.isEventSubmissionEnabled() && A.validateSdkErrorEvent(s, a, e, n, t)) {
				var o, d = this.baseUrl + "/" + s + "/" + this.eventsUrlPath,
					u = "",
					c = p.getSdkErrorEventAnnotations(),
					l = y.sdkErrorCategoryString(e);
				u += c.error_category = l;
				var v = y.sdkErrorAreaString(n);
				u += ":" + (c.error_area = v);
				var g = y.sdkErrorActionString(t);
				c.error_action = g;
				var f = y.sdkErrorParameterString(i);
				if (0 < f.length && (c.error_parameter = f), 0 < r.length) {
					var m = r;
					r.length > y.MAX_ERROR_MESSAGE_LENGTH && (m = r.substring(0, y.MAX_ERROR_MESSAGE_LENGTH)), c.reason = m
				}
				var E = [];
				E.push(c), (o = JSON.stringify(E)) ? h.execute(d, u, o, a) : S.w("sendSdkErrorEvent: JSON encoding failed.")
			}
		}, y.sendEventInArrayRequestCallback = function(e, n, t, i) {
			void 0 === i && (i = null), i[0], i[1];
			var r, s, a = i[2],
				o = parseInt(i[3]);
			r = e.responseText, s = e.status;
			var d = y.instance.processRequestResponse(s, e.statusText, r, "Events");
			if (d == c.EGAHTTPApiResponse.Ok || d == c.EGAHTTPApiResponse.Created || d == c.EGAHTTPApiResponse.BadRequest) {
				var u = r ? JSON.parse(r) : {};
				if (null == u) return t(c.EGAHTTPApiResponse.JsonDecodeFailed, null, a, o), void y.instance.sendSdkErrorEvent(v.Http, g.EventsHttp, f.FailHttpJsonDecode, m.Undefined, r, p.getGameKey(), p.getGameSecret());
				c.EGAHTTPApiResponse.BadRequest, t(d, u, a, o)
			} else t(d, null, a, o)
		}, y.sendRequest = function(e, n, t, i, r, s) {
			var a = new XMLHttpRequest,
				o = p.getGameSecret(),
				d = l.getHmac(o, n),
				u = [];
			for (var c in u.push(d), t) u.push(t[c]);
			if (a.onreadystatechange = function() {
					4 === a.readyState && r(a, e, s, u)
				}, a.open("POST", e, !0), a.setRequestHeader("Content-Type", "application/json"), a.setRequestHeader("Authorization", d), i) throw new Error("gzip not supported");
			try {
				a.send(n)
			} catch (e) {
				console.error(e.stack)
			}
		}, y.initRequestCallback = function(e, n, t, i) {
			var r, s;
			void 0 === i && (i = null), i[0], i[1], r = e.responseText, s = e.status;
			var a = r ? JSON.parse(r) : {},
				o = y.instance.processRequestResponse(s, e.statusText, r, "Init");
			if (o == c.EGAHTTPApiResponse.Ok || o == c.EGAHTTPApiResponse.Created || o == c.EGAHTTPApiResponse.BadRequest) {
				if (null == a) return t(c.EGAHTTPApiResponse.JsonDecodeFailed, null, "", 0), void y.instance.sendSdkErrorEvent(v.Http, g.InitHttp, f.FailHttpJsonDecode, m.Undefined, r, p.getGameKey(), p.getGameSecret());
				if (o !== c.EGAHTTPApiResponse.BadRequest) {
					var d = A.validateAndCleanInitRequestResponse(a, o === c.EGAHTTPApiResponse.Created);
					d ? t(o, d, "", 0) : t(c.EGAHTTPApiResponse.BadResponse, null, "", 0)
				} else t(o, null, "", 0)
			} else t(o, null, "", 0)
		}, y.prototype.createPayloadData = function(e, n) {
			if (n) throw new Error("gzip not supported");
			return e
		}, y.prototype.processRequestResponse = function(e, n, t, i) {
			return t ? 200 === e ? c.EGAHTTPApiResponse.Ok : 201 === e ? c.EGAHTTPApiResponse.Created : 0 === e || 401 === e ? c.EGAHTTPApiResponse.Unauthorized : 400 === e ? c.EGAHTTPApiResponse.BadRequest : 500 === e ? c.EGAHTTPApiResponse.InternalServerError : c.EGAHTTPApiResponse.UnknownResponseCode : c.EGAHTTPApiResponse.NoResponse
		}, y.sdkErrorCategoryString = function(e) {
			switch (e) {
				case v.EventValidation:
					return "event_validation";
				case v.Database:
					return "db";
				case v.Init:
					return "init";
				case v.Http:
					return "http";
				case v.Json:
					return "json"
			}
			return ""
		}, y.sdkErrorAreaString = function(e) {
			switch (e) {
				case g.BusinessEvent:
					return "business";
				case g.ResourceEvent:
					return "resource";
				case g.ProgressionEvent:
					return "progression";
				case g.DesignEvent:
					return "design";
				case g.ErrorEvent:
					return "error";
				case g.InitHttp:
					return "init_http";
				case g.EventsHttp:
					return "events_http";
				case g.ProcessEvents:
					return "process_events";
				case g.AddEventsToStore:
					return "add_events_to_store"
			}
			return ""
		}, y.sdkErrorActionString = function(e) {
			switch (e) {
				case f.InvalidCurrency:
					return "invalid_currency";
				case f.InvalidShortString:
					return "invalid_short_string";
				case f.InvalidEventPartLength:
					return "invalid_event_part_length";
				case f.InvalidEventPartCharacters:
					return "invalid_event_part_characters";
				case f.InvalidStore:
					return "invalid_store";
				case f.InvalidFlowType:
					return "invalid_flow_type";
				case f.StringEmptyOrNull:
					return "string_empty_or_null";
				case f.NotFoundInAvailableCurrencies:
					return "not_found_in_available_currencies";
				case f.InvalidAmount:
					return "invalid_amount";
				case f.NotFoundInAvailableItemTypes:
					return "not_found_in_available_item_types";
				case f.WrongProgressionOrder:
					return "wrong_progression_order";
				case f.InvalidEventIdLength:
					return "invalid_event_id_length";
				case f.InvalidEventIdCharacters:
					return "invalid_event_id_characters";
				case f.InvalidProgressionStatus:
					return "invalid_progression_status";
				case f.InvalidSeverity:
					return "invalid_severity";
				case f.InvalidLongString:
					return "invalid_long_string";
				case f.DatabaseTooLarge:
					return "db_too_large";
				case f.DatabaseOpenOrCreate:
					return "db_open_or_create";
				case f.JsonError:
					return "json_error";
				case f.FailHttpJsonDecode:
					return "fail_http_json_decode";
				case f.FailHttpJsonEncode:
					return "fail_http_json_encode"
			}
			return ""
		}, y.sdkErrorParameterString = function(e) {
			switch (e) {
				case m.Currency:
					return "currency";
				case m.CartType:
					return "cart_type";
				case m.ItemType:
					return "item_type";
				case m.ItemId:
					return "item_id";
				case m.Store:
					return "store";
				case m.FlowType:
					return "flow_type";
				case m.Amount:
					return "amount";
				case m.Progression01:
					return "progression01";
				case m.Progression02:
					return "progression02";
				case m.Progression03:
					return "progression03";
				case m.EventId:
					return "event_id";
				case m.ProgressionStatus:
					return "progression_status";
				case m.Severity:
					return "severity";
				case m.Message:
					return "message"
			}
			return ""
		}, y.instance = new y, y.MAX_ERROR_MESSAGE_LENGTH = 256, n = y, c.GAHTTPApi = n
	}(gameanalytics = gameanalytics || {}),
	function(g) {
		var v, f, m, E, p, S, A, u, h, y, e;

		function C() {}
		v = g.events || (g.events = {}), f = g.store.GAStore, m = g.store.EGAStore, E = g.store.EGAStoreArgsOperator, p = g.state.GAState, S = g.logging.GALogger, A = g.utilities.GAUtilities, u = g.http.EGAHTTPApiResponse, h = g.http.GAHTTPApi, y = g.validators.GAValidator, C.addSessionStartEvent = function() {
			if (p.isEventSubmissionEnabled()) {
				var e = {};
				e.category = C.CategorySessionStart, p.incrementSessionNum(), f.setItem(p.getGameKey(), p.SessionNumKey, p.getSessionNum().toString()), C.addDimensionsToEvent(e), C.addEventToStore(e), S.i("Add SESSION START event"), C.processEvents(C.CategorySessionStart, !1)
			}
		}, C.addSessionEndEvent = function() {
			if (p.isEventSubmissionEnabled()) {
				var e = p.getSessionStart(),
					n = p.getClientTsAdjusted() - e;
				n < 0 && (S.w("Session length was calculated to be less then 0. Should not be possible. Resetting to 0."), n = 0);
				var t = {};
				t.category = C.CategorySessionEnd, t.length = n, C.addDimensionsToEvent(t), C.addEventToStore(t), S.i("Add SESSION END event."), C.processEvents("", !1)
			}
		}, C.addBusinessEvent = function(e, n, t, i, r, s) {
			if (void 0 === r && (r = null), p.isEventSubmissionEnabled()) {
				var a = y.validateBusinessEvent(e, n, r, t, i);
				if (null == a) {
					var o = {};
					p.incrementTransactionNum(), f.setItem(p.getGameKey(), p.TransactionNumKey, p.getTransactionNum().toString()), o.event_id = t + ":" + i, o.category = C.CategoryBusiness, o.currency = e, o.amount = n, o[p.TransactionNumKey] = p.getTransactionNum(), r && (o.cart_type = r), C.addDimensionsToEvent(o), C.addFieldsToEvent(o, p.validateAndCleanCustomFields(s)), S.i("Add BUSINESS event: {currency:" + e + ", amount:" + n + ", itemType:" + t + ", itemId:" + i + ", cartType:" + r + "}"), C.addEventToStore(o)
				} else h.instance.sendSdkErrorEvent(a.category, a.area, a.action, a.parameter, a.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.addResourceEvent = function(e, n, t, i, r, s) {
			if (p.isEventSubmissionEnabled()) {
				var a = y.validateResourceEvent(e, n, t, i, r, p.getAvailableResourceCurrencies(), p.getAvailableResourceItemTypes());
				if (null == a) {
					e === g.EGAResourceFlowType.Sink && (t *= -1);
					var o = {},
						d = C.resourceFlowTypeToString(e);
					o.event_id = d + ":" + n + ":" + i + ":" + r, o.category = C.CategoryResource, o.amount = t, C.addDimensionsToEvent(o), C.addFieldsToEvent(o, p.validateAndCleanCustomFields(s)), S.i("Add RESOURCE event: {currency:" + n + ", amount:" + t + ", itemType:" + i + ", itemId:" + r + "}"), C.addEventToStore(o)
				} else h.instance.sendSdkErrorEvent(a.category, a.area, a.action, a.parameter, a.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.addProgressionEvent = function(e, n, t, i, r, s, a) {
			if (p.isEventSubmissionEnabled()) {
				var o = C.progressionStatusToString(e),
					d = y.validateProgressionEvent(e, n, t, i);
				if (null == d) {
					var u, c = {};
					u = t ? i ? n + ":" + t + ":" + i : n + ":" + t : n, c.category = C.CategoryProgression, c.event_id = o + ":" + u;
					var l = 0;
					s && e != g.EGAProgressionStatus.Start && (c.score = r), e === g.EGAProgressionStatus.Fail && p.incrementProgressionTries(u), e === g.EGAProgressionStatus.Complete && (p.incrementProgressionTries(u), l = p.getProgressionTries(u), c.attempt_num = l, p.clearProgressionTries(u)), C.addDimensionsToEvent(c), C.addFieldsToEvent(c, p.validateAndCleanCustomFields(a)), S.i("Add PROGRESSION event: {status:" + o + ", progression01:" + n + ", progression02:" + t + ", progression03:" + i + ", score:" + r + ", attempt:" + l + "}"), C.addEventToStore(c)
				} else h.instance.sendSdkErrorEvent(d.category, d.area, d.action, d.parameter, d.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.addDesignEvent = function(e, n, t, i) {
			if (p.isEventSubmissionEnabled()) {
				var r = y.validateDesignEvent(e);
				if (null == r) {
					var s = {};
					s.category = C.CategoryDesign, s.event_id = e, t && (s.value = n), C.addDimensionsToEvent(s), C.addFieldsToEvent(s, p.validateAndCleanCustomFields(i)), S.i("Add DESIGN event: {eventId:" + e + ", value:" + n + "}"), C.addEventToStore(s)
				} else h.instance.sendSdkErrorEvent(r.category, r.area, r.action, r.parameter, r.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.addErrorEvent = function(e, n, t) {
			if (p.isEventSubmissionEnabled()) {
				var i = C.errorSeverityToString(e),
					r = y.validateErrorEvent(e, n);
				if (null == r) {
					var s = {};
					s.category = C.CategoryError, s.severity = i, s.message = n, C.addDimensionsToEvent(s), C.addFieldsToEvent(s, p.validateAndCleanCustomFields(t)), S.i("Add ERROR event: {severity:" + i + ", message:" + n + "}"), C.addEventToStore(s)
				} else h.instance.sendSdkErrorEvent(r.category, r.area, r.action, r.parameter, r.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.addAdEvent = function(e, n, t, i, r, s, a, o) {
			if (p.isEventSubmissionEnabled()) {
				var d = C.adActionToString(e),
					u = C.adTypeToString(n),
					c = C.adErrorToString(r),
					l = y.validateAdEvent(e, n, t, i);
				if (null == l) {
					var v = {};
					v.category = C.CategoryAds, v.ad_sdk_name = t, v.ad_placement = i, v.ad_type = u, v.ad_action = d, e == g.EGAAdAction.FailedShow && 0 < c.length && (v.ad_fail_show_reason = c), !a || n != g.EGAAdType.RewardedVideo && n != g.EGAAdType.Video || (v.ad_duration = s), C.addDimensionsToEvent(v), C.addFieldsToEvent(v, p.validateAndCleanCustomFields(o)), S.i("Add AD event: {ad_sdk_name:" + t + ", ad_placement:" + i + ", ad_type:" + u + ", ad_action:" + d + (e == g.EGAAdAction.FailedShow && 0 < c.length ? ", ad_fail_show_reason:" + c : "") + (!a || n != g.EGAAdType.RewardedVideo && n != g.EGAAdType.Video ? "" : ", ad_duration:" + s) + "}"), C.addEventToStore(v)
				} else h.instance.sendSdkErrorEvent(l.category, l.area, l.action, l.parameter, l.reason, p.getGameKey(), p.getGameSecret())
			}
		}, C.processEvents = function(e, n) {
			if (p.isEventSubmissionEnabled()) try {
				var t = A.createGuid();
				n && (C.cleanupEvents(), C.fixMissingSessionEndEvents());
				var i = [];
				i.push(["status", E.Equal, "new"]);
				var r = [];
				r.push(["status", E.Equal, "new"]), e && (i.push(["category", E.Equal, e]), r.push(["category", E.Equal, e]));
				var s = [];
				s.push(["status", t]);
				var a = f.select(m.Events, i);
				if (!a || 0 == a.length) return S.i("Event queue: No events to send"), void C.updateSessionStore();
				if (a.length > C.MaxEventCount) {
					if (!(a = f.select(m.Events, i, !0, C.MaxEventCount))) return;
					var o = a[a.length - 1].client_ts;
					if (i.push(["client_ts", E.LessOrEqual, o]), !(a = f.select(m.Events, i))) return;
					r.push(["client_ts", E.LessOrEqual, o])
				}
				if (S.i("Event queue: Sending " + a.length + " events."), !f.update(m.Events, s, r)) return;
				for (var d = [], u = 0; u < a.length; ++u) {
					var c = a[u],
						l = JSON.parse(A.decode64(c.event));
					0 != l.length && d.push(l)
				}
				h.instance.sendEventsInArray(d, t, C.processEventsCallback)
			} catch (e) {
				S.e("Error during ProcessEvents(): " + e.stack), h.instance.sendSdkErrorEvent(v.EGASdkErrorCategory.Json, v.EGASdkErrorArea.ProcessEvents, v.EGASdkErrorAction.JsonError, v.EGASdkErrorParameter.Undefined, e.stack, p.getGameKey(), p.getGameSecret())
			}
		}, C.processEventsCallback = function(e, n, t, i) {
			var r = [];
			if (r.push(["status", E.Equal, t]), e === u.Ok) f.delete(m.Events, r), S.i("Event queue: " + i + " events sent.");
			else if (e === u.NoResponse) {
				var s = [];
				s.push(["status", "new"]), S.w("Event queue: Failed to send events to collector - Retrying next time"), f.update(m.Events, s, r)
			} else {
				if (n) {
					var a, o = 0;
					for (var d in n) 0 == o && (a = n[d]), ++o;
					e === u.BadRequest && a.constructor === Array ? S.w("Event queue: " + i + " events sent. " + o + " events failed GA server validation.") : S.w("Event queue: Failed to send events.")
				} else S.w("Event queue: Failed to send events.");
				f.delete(m.Events, r)
			}
		}, C.cleanupEvents = function() {
			f.update(m.Events, [
				["status", "new"]
			])
		}, C.fixMissingSessionEndEvents = function() {
			if (p.isEventSubmissionEnabled()) {
				var e = [];
				e.push(["session_id", E.NotEqual, p.getSessionId()]);
				var n = f.select(m.Sessions, e);
				if (n && 0 != n.length) {
					S.i(n.length + " session(s) located with missing session_end event.");
					for (var t = 0; t < n.length; ++t) {
						var i = JSON.parse(A.decode64(n[t].event)),
							r = i.client_ts - n[t].timestamp;
						r = Math.max(0, r), i.category = C.CategorySessionEnd, i.length = r, C.addEventToStore(i)
					}
				}
			}
		}, C.addEventToStore = function(e) {
			if (p.isEventSubmissionEnabled())
				if (p.isInitialized()) try {
					if (f.isStoreTooLargeForEvents() && !A.stringMatch(e.category, /^(user|session_end|business)$/)) return S.w("Database too large. Event has been blocked."), void h.instance.sendSdkErrorEvent(v.EGASdkErrorCategory.Database, v.EGASdkErrorArea.AddEventsToStore, v.EGASdkErrorAction.DatabaseTooLarge, v.EGASdkErrorParameter.Undefined, "", p.getGameKey(), p.getGameSecret());
					var n = p.getEventAnnotations(),
						t = A.encode64(JSON.stringify(n));
					for (var i in e) n[i] = e[i];
					var r = JSON.stringify(n);
					S.ii("Event added to queue: " + r);
					var s = {
						status: "new"
					};
					s.category = n.category, s.session_id = n.session_id, s.client_ts = n.client_ts, s.event = A.encode64(JSON.stringify(n)), f.insert(m.Events, s), e.category == C.CategorySessionEnd ? f.delete(m.Sessions, [
						["session_id", E.Equal, n.session_id]
					]) : ((s = {}).session_id = n.session_id, s.timestamp = p.getSessionStart(), s.event = t, f.insert(m.Sessions, s, !0, "session_id")), f.isStorageAvailable() && f.save(p.getGameKey())
				} catch (i) {
					S.e("addEventToStore: error"), S.e(i.stack), h.instance.sendSdkErrorEvent(v.EGASdkErrorCategory.Database, v.EGASdkErrorArea.AddEventsToStore, v.EGASdkErrorAction.DatabaseTooLarge, v.EGASdkErrorParameter.Undefined, i.stack, p.getGameKey(), p.getGameSecret())
				} else S.w("Could not add event: SDK is not initialized")
		}, C.updateSessionStore = function() {
			if (p.sessionIsStarted()) {
				var e = {};
				e.session_id = p.instance.sessionId, e.timestamp = p.getSessionStart(), e.event = A.encode64(JSON.stringify(p.getEventAnnotations())), f.insert(m.Sessions, e, !0, "session_id"), f.isStorageAvailable() && f.save(p.getGameKey())
			}
		}, C.addDimensionsToEvent = function(e) {
			e && (p.getCurrentCustomDimension01() && (e.custom_01 = p.getCurrentCustomDimension01()), p.getCurrentCustomDimension02() && (e.custom_02 = p.getCurrentCustomDimension02()), p.getCurrentCustomDimension03() && (e.custom_03 = p.getCurrentCustomDimension03()))
		}, C.addFieldsToEvent = function(e, n) {
			e && n && 0 < Object.keys(n).length && (e.custom_fields = n)
		}, C.resourceFlowTypeToString = function(e) {
			return e == g.EGAResourceFlowType.Source || e == g.EGAResourceFlowType[g.EGAResourceFlowType.Source] ? "Source" : e == g.EGAResourceFlowType.Sink || e == g.EGAResourceFlowType[g.EGAResourceFlowType.Sink] ? "Sink" : ""
		}, C.progressionStatusToString = function(e) {
			return e == g.EGAProgressionStatus.Start || e == g.EGAProgressionStatus[g.EGAProgressionStatus.Start] ? "Start" : e == g.EGAProgressionStatus.Complete || e == g.EGAProgressionStatus[g.EGAProgressionStatus.Complete] ? "Complete" : e == g.EGAProgressionStatus.Fail || e == g.EGAProgressionStatus[g.EGAProgressionStatus.Fail] ? "Fail" : ""
		}, C.errorSeverityToString = function(e) {
			return e == g.EGAErrorSeverity.Debug || e == g.EGAErrorSeverity[g.EGAErrorSeverity.Debug] ? "debug" : e == g.EGAErrorSeverity.Info || e == g.EGAErrorSeverity[g.EGAErrorSeverity.Info] ? "info" : e == g.EGAErrorSeverity.Warning || e == g.EGAErrorSeverity[g.EGAErrorSeverity.Warning] ? "warning" : e == g.EGAErrorSeverity.Error || e == g.EGAErrorSeverity[g.EGAErrorSeverity.Error] ? "error" : e == g.EGAErrorSeverity.Critical || e == g.EGAErrorSeverity[g.EGAErrorSeverity.Critical] ? "critical" : ""
		}, C.adActionToString = function(e) {
			return e == g.EGAAdAction.Clicked || e == g.EGAAdAction[g.EGAAdAction.Clicked] ? "clicked" : e == g.EGAAdAction.Show || e == g.EGAAdAction[g.EGAAdAction.Show] ? "show" : e == g.EGAAdAction.FailedShow || e == g.EGAAdAction[g.EGAAdAction.FailedShow] ? "failed_show" : e == g.EGAAdAction.RewardReceived || e == g.EGAAdAction[g.EGAAdAction.RewardReceived] ? "reward_recevied" : ""
		}, C.adErrorToString = function(e) {
			return e == g.EGAAdError.Unknown || e == g.EGAAdError[g.EGAAdError.Unknown] ? "unknown" : e == g.EGAAdError.Offline || e == g.EGAAdError[g.EGAAdError.Offline] ? "offline" : e == g.EGAAdError.NoFill || e == g.EGAAdError[g.EGAAdError.NoFill] ? "no_fill" : e == g.EGAAdError.InternalError || e == g.EGAAdError[g.EGAAdError.InternalError] ? "internal_error" : e == g.EGAAdError.InvalidRequest || e == g.EGAAdError[g.EGAAdError.InvalidRequest] ? "invalid_request" : e == g.EGAAdError.UnableToPrecache || e == g.EGAAdError[g.EGAAdError.UnableToPrecache] ? "unable_to_precache" : ""
		}, C.adTypeToString = function(e) {
			return e == g.EGAAdType.Video || e == g.EGAAdType[g.EGAAdType.Video] ? "video" : e == g.EGAAdType.RewardedVideo || e == g.EGAAdError[g.EGAAdType.RewardedVideo] ? "rewarded_video" : e == g.EGAAdType.Playable || e == g.EGAAdError[g.EGAAdType.Playable] ? "playable" : e == g.EGAAdType.Interstitial || e == g.EGAAdError[g.EGAAdType.Interstitial] ? "interstitial" : e == g.EGAAdType.OfferWall || e == g.EGAAdError[g.EGAAdType.OfferWall] ? "offer_wall" : e == g.EGAAdType.Banner || e == g.EGAAdError[g.EGAAdType.Banner] ? "banner" : ""
		}, C.CategorySessionStart = "user", C.CategorySessionEnd = "session_end", C.CategoryDesign = "design", C.CategoryBusiness = "business", C.CategoryProgression = "progression", C.CategoryResource = "resource", C.CategoryError = "error", C.CategoryAds = "ads", C.MaxEventCount = 500, e = C, v.GAEvents = e
	}(gameanalytics = gameanalytics || {}),
	function(e) {
		var r, n, t, i, s;

		function a() {
			this.blocks = new r.PriorityQueue({
				compare: function(e, n) {
					return e - n
				}
			}), this.id2TimedBlockMap = {}, a.startThread()
		}
		r = e.threading || (e.threading = {}), n = e.logging.GALogger, t = e.state.GAState, i = e.events.GAEvents, a.createTimedBlock = function(e) {
			void 0 === e && (e = 0);
			var n = new Date;
			return n.setSeconds(n.getSeconds() + e), new r.TimedBlock(n)
		}, a.performTaskOnGAThread = function(e, n) {
			void 0 === n && (n = 0);
			var t = new Date;
			t.setSeconds(t.getSeconds() + n);
			var i = new r.TimedBlock(t);
			i.block = e, a.instance.id2TimedBlockMap[i.id] = i, a.instance.addTimedBlock(i)
		}, a.performTimedBlockOnGAThread = function(e) {
			a.instance.id2TimedBlockMap[e.id] = e, a.instance.addTimedBlock(e)
		}, a.scheduleTimer = function(e, n) {
			var t = new Date;
			t.setSeconds(t.getSeconds() + e);
			var i = new r.TimedBlock(t);
			return i.block = n, a.instance.id2TimedBlockMap[i.id] = i, a.instance.addTimedBlock(i), i.id
		}, a.getTimedBlockById = function(e) {
			return e in a.instance.id2TimedBlockMap ? a.instance.id2TimedBlockMap[e] : null
		}, a.ensureEventQueueIsRunning = function() {
			a.instance.keepRunning = !0, a.instance.isRunning || (a.instance.isRunning = !0, a.scheduleTimer(a.ProcessEventsIntervalInSeconds, a.processEventQueue))
		}, a.endSessionAndStopQueue = function() {
			t.isInitialized() && (n.i("Ending session."), a.stopEventQueue(), t.isEnabled() && t.sessionIsStarted() && (i.addSessionEndEvent(), t.instance.sessionStart = 0))
		}, a.stopEventQueue = function() {
			a.instance.keepRunning = !1
		}, a.ignoreTimer = function(e) {
			e in a.instance.id2TimedBlockMap && (a.instance.id2TimedBlockMap[e].ignore = !0)
		}, a.setEventProcessInterval = function(e) {
			0 < e && (a.ProcessEventsIntervalInSeconds = e)
		}, a.prototype.addTimedBlock = function(e) {
			this.blocks.enqueue(e.deadline.getTime(), e)
		}, a.run = function() {
			clearTimeout(a.runTimeoutId);
			try {
				for (var e; e = a.getNextBlock();)
					if (!e.ignore)
						if (e.async) {
							if (!e.running) {
								e.running = !0, e.block();
								break
							}
						} else e.block();
				return void(a.runTimeoutId = setTimeout(a.run, a.ThreadWaitTimeInMs))
			} catch (e) {
				n.e("Error on GA thread"), n.e(e.stack)
			}
		}, a.startThread = function() {
			a.runTimeoutId = setTimeout(a.run, 0)
		}, a.getNextBlock = function() {
			var e = new Date;
			return a.instance.blocks.hasItems() && a.instance.blocks.peek().deadline.getTime() <= e.getTime() ? a.instance.blocks.peek().async && a.instance.blocks.peek().running ? a.instance.blocks.peek() : a.instance.blocks.dequeue() : null
		}, a.processEventQueue = function() {
			i.processEvents("", !0), a.instance.keepRunning ? a.scheduleTimer(a.ProcessEventsIntervalInSeconds, a.processEventQueue) : a.instance.isRunning = !1
		}, a.instance = new a, a.ThreadWaitTimeInMs = 1e3, a.ProcessEventsIntervalInSeconds = 8, s = a, r.GAThreading = s
	}(gameanalytics = gameanalytics || {}),
	function(a) {
		var o = a.threading.GAThreading,
			d = a.logging.GALogger,
			u = a.store.GAStore,
			c = a.state.GAState,
			e = a.http.GAHTTPApi,
			l = a.device.GADevice,
			i = a.validators.GAValidator,
			v = a.http.EGAHTTPApiResponse,
			g = a.utilities.GAUtilities,
			f = a.events.GAEvents,
			n = (m.init = function() {
				if (l.touch(), m.methodMap.configureAvailableCustomDimensions01 = m.configureAvailableCustomDimensions01, m.methodMap.configureAvailableCustomDimensions02 = m.configureAvailableCustomDimensions02, m.methodMap.configureAvailableCustomDimensions03 = m.configureAvailableCustomDimensions03, m.methodMap.configureAvailableResourceCurrencies = m.configureAvailableResourceCurrencies, m.methodMap.configureAvailableResourceItemTypes = m.configureAvailableResourceItemTypes, m.methodMap.configureBuild = m.configureBuild, m.methodMap.configureSdkGameEngineVersion = m.configureSdkGameEngineVersion, m.methodMap.configureGameEngineVersion = m.configureGameEngineVersion, m.methodMap.configureUserId = m.configureUserId, m.methodMap.initialize = m.initialize, m.methodMap.addBusinessEvent = m.addBusinessEvent, m.methodMap.addResourceEvent = m.addResourceEvent, m.methodMap.addProgressionEvent = m.addProgressionEvent, m.methodMap.addDesignEvent = m.addDesignEvent, m.methodMap.addErrorEvent = m.addErrorEvent, m.methodMap.addErrorEvent = m.addErrorEvent, m.methodMap.setEnabledInfoLog = m.setEnabledInfoLog, m.methodMap.setEnabledVerboseLog = m.setEnabledVerboseLog, m.methodMap.setEnabledManualSessionHandling = m.setEnabledManualSessionHandling, m.methodMap.setEnabledEventSubmission = m.setEnabledEventSubmission, m.methodMap.setCustomDimension01 = m.setCustomDimension01, m.methodMap.setCustomDimension02 = m.setCustomDimension02, m.methodMap.setCustomDimension03 = m.setCustomDimension03, m.methodMap.setEventProcessInterval = m.setEventProcessInterval, m.methodMap.startSession = m.startSession, m.methodMap.endSession = m.endSession, m.methodMap.onStop = m.onStop, m.methodMap.onResume = m.onResume, m.methodMap.addRemoteConfigsListener = m.addRemoteConfigsListener, m.methodMap.removeRemoteConfigsListener = m.removeRemoteConfigsListener, m.methodMap.getRemoteConfigsValueAsString = m.getRemoteConfigsValueAsString, m.methodMap.isRemoteConfigsReady = m.isRemoteConfigsReady, m.methodMap.getRemoteConfigsContentAsString = m.getRemoteConfigsContentAsString, "undefined" != typeof window && void 0 !== window.GameAnalytics && void 0 !== window.GameAnalytics.q) {
					var e = window.GameAnalytics.q;
					for (var n in e) m.gaCommand.apply(null, e[n])
				}
				window.addEventListener("beforeunload", function() {
					console.log("addEventListener unload"), o.endSessionAndStopQueue()
				})
			}, m.gaCommand = function() {
				for (var e = [], n = 0; n < arguments.length; n++) e[n] = arguments[n];
				0 < e.length && e[0] in a.GameAnalytics.methodMap && (1 < e.length ? a.GameAnalytics.methodMap[e[0]].apply(null, Array.prototype.slice.call(e, 1)) : a.GameAnalytics.methodMap[e[0]]())
			}, m.configureAvailableCustomDimensions01 = function(e) {
				void 0 === e && (e = []), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Available custom dimensions must be set before SDK is initialized") : c.setAvailableCustomDimensions01(e)
				})
			}, m.configureAvailableCustomDimensions02 = function(e) {
				void 0 === e && (e = []), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Available custom dimensions must be set before SDK is initialized") : c.setAvailableCustomDimensions02(e)
				})
			}, m.configureAvailableCustomDimensions03 = function(e) {
				void 0 === e && (e = []), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Available custom dimensions must be set before SDK is initialized") : c.setAvailableCustomDimensions03(e)
				})
			}, m.configureAvailableResourceCurrencies = function(e) {
				void 0 === e && (e = []), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Available resource currencies must be set before SDK is initialized") : c.setAvailableResourceCurrencies(e)
				})
			}, m.configureAvailableResourceItemTypes = function(e) {
				void 0 === e && (e = []), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Available resource item types must be set before SDK is initialized") : c.setAvailableResourceItemTypes(e)
				})
			}, m.configureBuild = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("Build version must be set before SDK is initialized.") : i.validateBuild(e) ? c.setBuild(e) : d.i("Validation fail - configure build: Cannot be null, empty or above 32 length. String: " + e)
				})
			}, m.configureSdkGameEngineVersion = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) || (i.validateSdkWrapperVersion(e) ? l.sdkGameEngineVersion = e : d.i("Validation fail - configure sdk version: Sdk version not supported. String: " + e))
				})
			}, m.configureGameEngineVersion = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) || (i.validateEngineVersion(e) ? l.gameEngineVersion = e : d.i("Validation fail - configure game engine version: Game engine version not supported. String: " + e))
				})
			}, m.configureUserId = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !1) ? d.w("A custom user id must be set before SDK is initialized.") : i.validateUserId(e) ? c.setUserId(e) : d.i("Validation fail - configure user_id: Cannot be null, empty or above 64 length. Will use default user_id method. Used string: " + e)
				})
			}, m.initialize = function(e, n) {
				void 0 === e && (e = ""), void 0 === n && (n = ""), l.updateConnectionType();
				var t = o.createTimedBlock();
				t.async = !0, m.initTimedBlockId = t.id, t.block = function() {
					m.isSdkReady(!0, !1) ? d.w("SDK already initialized. Can only be called once.") : i.validateKeys(e, n) ? (c.setKeys(e, n), m.internalInitialize()) : d.w("SDK failed initialize. Game key or secret key is invalid. Can only contain characters A-z 0-9, gameKey is 32 length, gameSecret is 40 length. Failed keys - gameKey: " + e + ", secretKey: " + n)
				}, o.performTimedBlockOnGAThread(t)
			}, m.addBusinessEvent = function(e, n, t, i, r) {
				void 0 === e && (e = ""), void 0 === n && (n = 0), void 0 === t && (t = ""), void 0 === i && (i = ""), void 0 === r && (r = ""), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add business event") && f.addBusinessEvent(e, n, t, i, r, {})
				})
			}, m.addResourceEvent = function(e, n, t, i, r) {
				void 0 === e && (e = a.EGAResourceFlowType.Undefined), void 0 === n && (n = ""), void 0 === t && (t = 0), void 0 === i && (i = ""), void 0 === r && (r = ""), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add resource event") && f.addResourceEvent(e, n, t, i, r, {})
				})
			}, m.addProgressionEvent = function(n, t, i, r, s) {
				void 0 === n && (n = a.EGAProgressionStatus.Undefined), void 0 === t && (t = ""), void 0 === i && (i = ""), void 0 === r && (r = ""), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					if (m.isSdkReady(!0, !0, "Could not add progression event")) {
						var e = "number" == typeof s;
						f.addProgressionEvent(n, t, i, r, e ? s : 0, e, {})
					}
				})
			}, m.addDesignEvent = function(n, t) {
				l.updateConnectionType(), o.performTaskOnGAThread(function() {
					if (m.isSdkReady(!0, !0, "Could not add design event")) {
						var e = "number" == typeof t;
						f.addDesignEvent(n, e ? t : 0, e, {})
					}
				})
			}, m.addErrorEvent = function(e, n) {
				void 0 === e && (e = a.EGAErrorSeverity.Undefined), void 0 === n && (n = ""), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add error event") && f.addErrorEvent(e, n, {})
				})
			}, m.addAdEventWithNoAdReason = function(e, n, t, i, r) {
				void 0 === e && (e = a.EGAAdAction.Undefined), void 0 === n && (n = a.EGAAdType.Undefined), void 0 === t && (t = ""), void 0 === i && (i = ""), void 0 === r && (r = a.EGAAdError.Undefined), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add ad event") && f.addAdEvent(e, n, t, i, r, 0, !1, {})
				})
			}, m.addAdEventWithDuration = function(e, n, t, i, r) {
				void 0 === e && (e = a.EGAAdAction.Undefined), void 0 === n && (n = a.EGAAdType.Undefined), void 0 === t && (t = ""), void 0 === i && (i = ""), void 0 === r && (r = 0), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add ad event") && f.addAdEvent(e, n, t, i, a.EGAAdError.Undefined, r, !0, {})
				})
			}, m.addAdEvent = function(e, n, t, i) {
				void 0 === e && (e = a.EGAAdAction.Undefined), void 0 === n && (n = a.EGAAdType.Undefined), void 0 === t && (t = ""), void 0 === i && (i = ""), l.updateConnectionType(), o.performTaskOnGAThread(function() {
					m.isSdkReady(!0, !0, "Could not add ad event") && f.addAdEvent(e, n, t, i, a.EGAAdError.Undefined, 0, !1, {})
				})
			}, m.setEnabledInfoLog = function(e) {
				void 0 === e && (e = !1), o.performTaskOnGAThread(function() {
					e ? (d.setInfoLog(e), d.i("Info logging enabled")) : (d.i("Info logging disabled"), d.setInfoLog(e))
				})
			}, m.setEnabledVerboseLog = function(e) {
				void 0 === e && (e = !1), o.performTaskOnGAThread(function() {
					e ? (d.setVerboseLog(e), d.i("Verbose logging enabled")) : (d.i("Verbose logging disabled"), d.setVerboseLog(e))
				})
			}, m.setEnabledManualSessionHandling = function(e) {
				void 0 === e && (e = !1), o.performTaskOnGAThread(function() {
					c.setManualSessionHandling(e)
				})
			}, m.setEnabledEventSubmission = function(e) {
				void 0 === e && (e = !1), o.performTaskOnGAThread(function() {
					e ? (c.setEnabledEventSubmission(e), d.i("Event submission enabled")) : (d.i("Event submission disabled"), c.setEnabledEventSubmission(e))
				})
			}, m.setCustomDimension01 = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					i.validateDimension01(e, c.getAvailableCustomDimensions01()) ? c.setCustomDimension01(e) : d.w("Could not set custom01 dimension value to '" + e + "'. Value not found in available custom01 dimension values")
				})
			}, m.setCustomDimension02 = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					i.validateDimension02(e, c.getAvailableCustomDimensions02()) ? c.setCustomDimension02(e) : d.w("Could not set custom02 dimension value to '" + e + "'. Value not found in available custom02 dimension values")
				})
			}, m.setCustomDimension03 = function(e) {
				void 0 === e && (e = ""), o.performTaskOnGAThread(function() {
					i.validateDimension03(e, c.getAvailableCustomDimensions03()) ? c.setCustomDimension03(e) : d.w("Could not set custom03 dimension value to '" + e + "'. Value not found in available custom03 dimension values")
				})
			}, m.setEventProcessInterval = function(e) {
				o.performTaskOnGAThread(function() {
					o.setEventProcessInterval(e)
				})
			}, m.startSession = function() {
				if (c.isInitialized()) {
					var e = o.createTimedBlock();
					e.async = !0, m.initTimedBlockId = e.id, e.block = function() {
						c.isEnabled() && c.sessionIsStarted() && o.endSessionAndStopQueue(), m.resumeSessionAndStartQueue()
					}, o.performTimedBlockOnGAThread(e)
				}
			}, m.endSession = function() {
				m.onStop()
			}, m.onStop = function() {
				o.performTaskOnGAThread(function() {
					try {
						o.endSessionAndStopQueue()
					} catch (e) {}
				})
			}, m.onResume = function() {
				var e = o.createTimedBlock();
				e.async = !0, m.initTimedBlockId = e.id, e.block = function() {
					m.resumeSessionAndStartQueue()
				}, o.performTimedBlockOnGAThread(e)
			}, m.getRemoteConfigsValueAsString = function(e, n) {
				return void 0 === n && (n = null), c.getConfigurationStringValue(e, n)
			}, m.isRemoteConfigsReady = function() {
				return c.isRemoteConfigsReady()
			}, m.addRemoteConfigsListener = function(e) {
				c.addRemoteConfigsListener(e)
			}, m.removeRemoteConfigsListener = function(e) {
				c.removeRemoteConfigsListener(e)
			}, m.getRemoteConfigsContentAsString = function() {
				return c.getRemoteConfigsContentAsString()
			}, m.getABTestingId = function() {
				return c.getABTestingId()
			}, m.getABTestingVariantId = function() {
				return c.getABTestingVariantId()
			}, m.internalInitialize = function() {
				c.ensurePersistedStates(), u.setItem(c.getGameKey(), c.DefaultUserIdKey, c.getDefaultId()), c.setInitialized(!0), m.newSession(), c.isEnabled() && o.ensureEventQueueIsRunning()
			}, m.newSession = function() {
				d.i("Starting a new session."), c.validateAndFixCurrentDimensions(), e.instance.requestInit(c.instance.configsHash, m.startNewSessionCallback)
			}, m.startNewSessionCallback = function(e, n) {
				if (e !== v.Ok && e !== v.Created || !n) e == v.Unauthorized ? (d.w("Initialize SDK failed - Unauthorized"), c.instance.initAuthorized = !1) : (e === v.NoResponse || e === v.RequestTimeout ? d.i("Init call (session start) failed - no response. Could be offline or timeout.") : e === v.BadResponse || e === v.JsonEncodeFailed || e === v.JsonDecodeFailed ? d.i("Init call (session start) failed - bad response. Could be bad response from proxy or GA servers.") : e !== v.BadRequest && e !== v.UnknownResponseCode || d.i("Init call (session start) failed - bad request or unknown response."), null == c.instance.sdkConfig ? null != c.instance.sdkConfigCached ? (d.i("Init call (session start) failed - using cached init values."), c.instance.sdkConfig = c.instance.sdkConfigCached) : (d.i("Init call (session start) failed - using default init values."), c.instance.sdkConfig = c.instance.sdkConfigDefault) : d.i("Init call (session start) failed - using cached init values."), c.instance.initAuthorized = !0);
				else {
					var t = 0;
					if (n.server_ts) {
						var i = n.server_ts;
						t = c.calculateServerTimeOffset(i)
					}
					if (n.time_offset = t, e != v.Created) {
						var r = c.getSdkConfig();
						r.configs && (n.configs = r.configs), r.configs_hash && (n.configs_hash = r.configs_hash), r.ab_id && (n.ab_id = r.ab_id), r.ab_variant_id && (n.ab_variant_id = r.ab_variant_id)
					}
					c.instance.configsHash = n.configs_hash ? n.configs_hash : "", c.instance.abId = n.ab_id ? n.ab_id : "", c.instance.abVariantId = n.ab_variant_id ? n.ab_variant_id : "", u.setItem(c.getGameKey(), c.SdkConfigCachedKey, g.encode64(JSON.stringify(n))), c.instance.sdkConfigCached = n, c.instance.sdkConfig = n, c.instance.initAuthorized = !0
				}
				if (c.instance.clientServerTimeOffset = c.getSdkConfig().time_offset ? c.getSdkConfig().time_offset : 0, c.populateConfigurations(c.getSdkConfig()), !c.isEnabled()) return d.w("Could not start session: SDK is disabled."), void o.stopEventQueue();
				o.ensureEventQueueIsRunning();
				var s = g.createGuid();
				c.instance.sessionId = s, c.instance.sessionStart = c.getClientTsAdjusted(), f.addSessionStartEvent();
				var a = o.getTimedBlockById(m.initTimedBlockId);
				null != a && (a.running = !1), m.initTimedBlockId = -1
			}, m.resumeSessionAndStartQueue = function() {
				c.isInitialized() && (d.i("Resuming session."), c.sessionIsStarted() || m.newSession())
			}, m.isSdkReady = function(e, n, t) {
				return void 0 === n && (n = !0), void 0 === t && (t = ""), t && (t += ": "), e && !c.isInitialized() ? (n && d.w(t + "SDK is not initialized"), !1) : e && !c.isEnabled() ? (n && d.w(t + "SDK is disabled"), !1) : !(e && !c.sessionIsStarted() && (n && d.w(t + "Session has not started yet"), 1))
			}, m.initTimedBlockId = -1, m.methodMap = {}, m);

		function m() {}
		a.GameAnalytics = n
	}(gameanalytics = gameanalytics || {}), gameanalytics.GameAnalytics.init();
	var GameAnalytics = gameanalytics.GameAnalytics.gaCommand;
	scope.gameanalytics = gameanalytics;
	scope.GameAnalytics = GameAnalytics;
})(this);