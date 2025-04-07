/* globals Vue */

// const GET = (...ttl) => axios.get (url4(ttl)) .then (res => res.data.value || res.data)
// const POST = (...ttl) => ({ with: data => axios.post (url4(ttl), data) .then (res => res.data.value || res.data) })
const GET = (...ttl) => fetch (url4(ttl)) .then (get_data)
const POST = (...ttl) => ({
  with: data => fetch (url4(ttl), {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }) .then (get_data)
})
const url4 = ttl => (ttl[0][0][0] === '/' ? '' : '/browse/') + String.raw(...ttl)
const get_data = res => res.json() .then (d => {
  if (res.ok) return d.value??d; else throw Object.assign (new Error, d.error || {
    message: res.statusText,
    code: res.status,
  })
})
const $ = sel => document.querySelector(sel)

const books = Vue.createApp ({

  data() {
    return {
      list: [],
      book: undefined,
      order: { quantity:1, succeeded:'', failed:'' },
      user: undefined
    }
  },

  methods: {

    search: ({target:{value:v}}) => books.fetch(v && '&$search='+v),

    async fetch (etc='') {
      books.list = await GET `ListOfBooks?$expand=genre($select=name),currency($select=symbol)${etc}`
    },

    async inspect (eve, index = eve.currentTarget.rowIndex-1) {
      const book = books.list [index]
      const details = await GET `Books/${book.ID}?$select=descr,stock,image`
      books.book = { ...book, ...details }
      books.order = { quantity:1 }
      setTimeout (()=> $('form > input').focus(), 111)
    },

    async submitOrder () {
      const {book,order} = books, quantity = order.quantity
      try {
        const {stock} = await POST `submitOrder` .with ({ quantity, book: book.ID })
        book.stock = stock
        books.order = { quantity, succeeded: `Successfully ordered ${quantity} item(s).` }
      } catch (e) {
        books.order = { quantity, failed: e.message }
      }
    },

    async login() {
      try {
        const { data:user } = await axios.post('/user/login',{})
        if (user.id !== 'anonymous') books.user = user
      } catch (err) { books.user = { id: err.message } }
    },

    async getUserInfo() {
      try {
        const user = await GET `/user/me`
        if (user.id !== 'anonymous') books.user = user
      } catch (err) { books.user = { id: err.message } }
    },
  }
}).mount('#app')

books.getUserInfo()
books.fetch() // initially fill list of books

// hide user info on request
document.addEventListener('keydown', event => {
  if (event.key === 'u')  books.user = undefined
})
