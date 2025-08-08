/**
 * USAGE @example
 * import cds from 'cap.js'; const { GET, POST } = cds.connect.to ('/rest/catalog')
 * import fetch from 'cap.js'; const { GET, POST } = fetch.for ('/rest/catalog')
 */
export default {
  connect: { to: (base, defaults) => new Fetcher (base, defaults) },
  for: (base, defaults) => new Fetcher (base, defaults),
}

/** A CAP Service lookalike for HTTP clients */
export class Fetcher {

  // These are convenience methods that still return standard fetch Response objects
  options (..._) { return this.fetch ('OPTIONS', ..._) }
  head (..._)    { return this.fetch ('HEAD', ..._) }
  get (..._)     { return this.fetch ('GET', ..._) }
  put (..._)     { return this.fetch ('PUT', ..._) }
  post (..._)    { return this.fetch ('POST', ..._) }
  patch (..._)   { return this.fetch ('PATCH', ..._) }
  delete (..._)  { return this.fetch ('DELETE', ..._) }

  // These are convenience methods that return unwrapped response data
  read(..._)   { return this.get(..._)   .then (_respond) }
  create(..._) { return this.post(..._)  .then (_respond) }
  insert(..._) { return this.post(..._)  .then (_respond) }
  upsert(..._) { return this.put(..._)   .then (_respond) }
  update(..._) { return this.patch(..._) .then (_respond) }

  // These are bound convenience methods that return unwrapped response data
  get GET()    { return (..._) => this.get(..._)    .then (_respond) }
  get PUT()    { return (..._) => this.put(..._)    .then (_respond) }
  get POST()   { return (..._) => this.post(..._)   .then (_respond) }
  get PATCH()  { return (..._) => this.patch(..._)  .then (_respond) }
  get DELETE() { return (..._) => this.delete(..._) .then (_respond) }

  constructor (base, defaults) {
    this.base = base[0] === '/' ? base : '/' + base
    this.defaults = { ...defaults, headers: {
      'content-type': 'application/json',
      ...defaults?.headers
    }}
  }

  /** This is the core method to send requests using Fetch API */
  async fetch (method, url, d, o) {
    if (url.raw) [url,d,o] = [String.raw (url,d,o)] // support tagged template literals
    const o2 = !d ? { ...o } : d?.headers || d?.body ? { ...d } : { ...o, body: _serialized (d) }
    const d2 = this.defaults; for (let k in d2)
      o2[k] = typeof d2[k] === 'object' ? { ...d2[k], ...o2[k] } : o2[k] ?? d2[k]

    // send the request, and return the response, if successful
    const res = await fetch (this.base + (url[0] === '/' ? url : '/' + url), { ...o2, method })
    if (res.ok) return res

    // if failed, construct and throw an error
    const { data, error:e = data.error } = await res.json(); e.message ??= `HTTP ${res.status}: ${res.statusText}`
    throw Object.assign (new Error, e)
  }
}

/** A helper function to unwrap response data */
const _respond = r => { switch (r.headers.get('content-type')?.split(';')[0]) {
  case 'application/json': return _unwrap (r.json())
  case 'application/xml': return _unwrap (r.text())
  case 'text/plain': return _unwrap (r.text())
  case 'text/html': return _unwrap (r.text())
  default: return r // leaving it to the caller to handle
}}

/** Helper function to unwrap response data from OData, GraphQL, REST, and HCQL servers */
const _unwrap = async d => (d = await d).value?.data || d.value || d.data || d

/** Helper function to check if a body is an object that needs serialization */
const _serialized = x => x && typeof x === 'object' && !(x instanceof FormData) ? JSON.stringify(x) : x /* global FormData */
