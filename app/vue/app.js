import { createApp } from 'vue'
import cds from './cap.js'

const { GET, POST } = await cds.connect.to ('/rest/catalog')
const $ = sel => document.querySelector(sel)
const books = createApp ({

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
      const {data} = await GET(`/ListOfBooks?$expand=genre($select=name),currency($select=symbol)${etc}`)
      books.list = data
    },

    async inspect (eve) {
      const book = books.book = books.list [eve.currentTarget.rowIndex-1]
      const {data} = await GET `/Books/${book.ID}?$select=descr,stock`
      Object.assign (book, data)
      books.order = { quantity:1 }
      setTimeout (()=> $('form > input').focus(), 111)
    },

    async submitOrder () {
      const {book,order} = books, quantity = parseInt (order.quantity) || 1 // REVISIT: Okra should be less strict
      try {
        const {data} = await POST (`/submitOrder`, { quantity, book: book.ID })
        book.stock = data.stock
        books.order = { quantity, succeeded: `Successfully ordered ${quantity} item(s).` }
      } catch (e) {
        books.order = { quantity, failed: e.response.data.error ? e.response.data.error.message : e.response.data }
      }
    },
  }

}).mount('#app')

books.fetch() // initially fill list of books
